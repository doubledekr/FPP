from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from src.models.subscriber import db, Subscriber, EngagementEvent, ContentItem, SubscriberProfile
from src.services.personalization_service import PersonalizationService

personalization_bp = Blueprint('personalization', __name__)

# Subscriber Management Routes
@personalization_bp.route('/subscribers', methods=['POST'])
def create_subscriber():
    """Create a new subscriber"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'platform_id', 'platform_subscriber_id']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Check if subscriber already exists
        existing = Subscriber.query.filter_by(email=data['email']).first()
        if existing:
            return jsonify({'error': 'Subscriber already exists'}), 409
        
        # Create new subscriber
        subscriber = Subscriber(
            email=data['email'],
            platform_id=data['platform_id'],
            platform_subscriber_id=data['platform_subscriber_id'],
            first_name=data.get('first_name'),
            last_name=data.get('last_name'),
            subscription_tier=data.get('subscription_tier', 'basic')
        )
        
        db.session.add(subscriber)
        db.session.commit()
        
        # Create initial profile
        PersonalizationService.update_subscriber_profile(subscriber.id)
        
        return jsonify(subscriber.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@personalization_bp.route('/subscribers', methods=['GET'])
def get_subscribers():
    """Get all subscribers with pagination"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        segment = request.args.get('segment')
        
        query = Subscriber.query
        
        # Filter by segment if provided
        if segment:
            profile_ids = db.session.query(SubscriberProfile.subscriber_id).filter(
                SubscriberProfile.behavioral_segments.contains(f'"{segment}"')
            ).all()
            subscriber_ids = [pid[0] for pid in profile_ids]
            query = query.filter(Subscriber.id.in_(subscriber_ids))
        
        subscribers = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'subscribers': [s.to_dict() for s in subscribers.items],
            'total': subscribers.total,
            'pages': subscribers.pages,
            'current_page': page
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@personalization_bp.route('/subscribers/<int:subscriber_id>', methods=['GET'])
def get_subscriber(subscriber_id):
    """Get a specific subscriber with their profile"""
    try:
        subscriber = Subscriber.query.get(subscriber_id)
        if not subscriber:
            return jsonify({'error': 'Subscriber not found'}), 404
        
        profile = SubscriberProfile.query.filter_by(subscriber_id=subscriber_id).first()
        
        result = subscriber.to_dict()
        if profile:
            result['profile'] = profile.to_dict()
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Engagement Event Routes
@personalization_bp.route('/events', methods=['POST'])
def create_engagement_event():
    """Record an engagement event"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['subscriber_id', 'event_type', 'platform_id']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Verify subscriber exists
        subscriber = Subscriber.query.get(data['subscriber_id'])
        if not subscriber:
            return jsonify({'error': 'Subscriber not found'}), 404
        
        # Create engagement event
        event = EngagementEvent(
            subscriber_id=data['subscriber_id'],
            event_type=data['event_type'],
            platform_id=data['platform_id'],
            newsletter_id=data.get('newsletter_id'),
            content_section=data.get('content_section')
        )
        
        if 'event_data' in data:
            event.set_event_data(data['event_data'])
        
        db.session.add(event)
        db.session.commit()
        
        # Update subscriber profile asynchronously (in production, use background job)
        PersonalizationService.update_subscriber_profile(data['subscriber_id'])
        
        return jsonify(event.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@personalization_bp.route('/events', methods=['GET'])
def get_engagement_events():
    """Get engagement events with filtering"""
    try:
        subscriber_id = request.args.get('subscriber_id', type=int)
        event_type = request.args.get('event_type')
        days = request.args.get('days', 30, type=int)
        
        query = EngagementEvent.query
        
        if subscriber_id:
            query = query.filter(EngagementEvent.subscriber_id == subscriber_id)
        
        if event_type:
            query = query.filter(EngagementEvent.event_type == event_type)
        
        # Filter by date range
        start_date = datetime.utcnow() - timedelta(days=days)
        query = query.filter(EngagementEvent.timestamp >= start_date)
        
        events = query.order_by(EngagementEvent.timestamp.desc()).limit(1000).all()
        
        return jsonify([event.to_dict() for event in events])
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Personalization Routes
@personalization_bp.route('/personalize/subject-line', methods=['POST'])
def personalize_subject_line():
    """Generate personalized subject line for a subscriber"""
    try:
        data = request.get_json()
        
        required_fields = ['subscriber_id', 'base_subject', 'content_summary']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        personalized_subject = PersonalizationService.generate_personalized_subject_line(
            data['subscriber_id'],
            data['content_summary'],
            data['base_subject']
        )
        
        return jsonify({
            'original_subject': data['base_subject'],
            'personalized_subject': personalized_subject,
            'subscriber_id': data['subscriber_id']
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@personalization_bp.route('/personalize/content-order', methods=['POST'])
def personalize_content_order():
    """Personalize content order for a subscriber"""
    try:
        data = request.get_json()
        
        required_fields = ['subscriber_id', 'content_items']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        personalized_items = PersonalizationService.personalize_content_order(
            data['subscriber_id'],
            data['content_items']
        )
        
        return jsonify({
            'subscriber_id': data['subscriber_id'],
            'personalized_content': personalized_items
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@personalization_bp.route('/personalize/newsletter', methods=['POST'])
def personalize_newsletter():
    """Full newsletter personalization for a subscriber"""
    try:
        data = request.get_json()
        
        required_fields = ['subscriber_id', 'newsletter_data']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        subscriber_id = data['subscriber_id']
        newsletter_data = data['newsletter_data']
        
        # Personalize subject line
        personalized_subject = PersonalizationService.generate_personalized_subject_line(
            subscriber_id,
            newsletter_data.get('summary', ''),
            newsletter_data.get('subject', 'Newsletter Update')
        )
        
        # Personalize content order
        content_items = newsletter_data.get('content_items', [])
        personalized_content = PersonalizationService.personalize_content_order(
            subscriber_id,
            content_items
        )
        
        # Get subscriber profile for additional context
        profile = SubscriberProfile.query.filter_by(subscriber_id=subscriber_id).first()
        
        result = {
            'subscriber_id': subscriber_id,
            'personalized_subject': personalized_subject,
            'personalized_content': personalized_content,
            'optimal_send_time': profile.optimal_send_time if profile else '09:00',
            'personalization_applied': True
        }
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Analytics and Dashboard Routes
@personalization_bp.route('/dashboard/analytics', methods=['GET'])
def get_dashboard_analytics():
    """Get analytics data for the dashboard"""
    try:
        days = request.args.get('days', 30, type=int)
        analytics = PersonalizationService.get_dashboard_analytics(days)
        return jsonify(analytics)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@personalization_bp.route('/subscribers/<int:subscriber_id>/profile', methods=['PUT'])
def update_subscriber_profile(subscriber_id):
    """Update subscriber profile analytics"""
    try:
        subscriber = Subscriber.query.get(subscriber_id)
        if not subscriber:
            return jsonify({'error': 'Subscriber not found'}), 404
        
        profile = PersonalizationService.update_subscriber_profile(subscriber_id)
        return jsonify(profile.to_dict())
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@personalization_bp.route('/segments', methods=['GET'])
def get_segments():
    """Get all available behavioral segments"""
    try:
        # Get unique segments from all profiles
        profiles = SubscriberProfile.query.all()
        all_segments = set()
        
        for profile in profiles:
            segments = profile.get_behavioral_segments()
            all_segments.update(segments)
        
        segment_counts = {}
        for segment in all_segments:
            count = SubscriberProfile.query.filter(
                SubscriberProfile.behavioral_segments.contains(f'"{segment}"')
            ).count()
            segment_counts[segment] = count
        
        return jsonify({
            'segments': list(all_segments),
            'segment_counts': segment_counts
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Content Management Routes
@personalization_bp.route('/content', methods=['POST'])
def create_content_item():
    """Create a new content item"""
    try:
        data = request.get_json()
        
        required_fields = ['newsletter_id', 'section_name', 'content_type']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        content_item = ContentItem(
            newsletter_id=data['newsletter_id'],
            section_name=data['section_name'],
            content_type=data['content_type'],
            title=data.get('title'),
            summary=data.get('summary'),
            content_text=data.get('content_text')
        )
        
        if 'tags' in data:
            content_item.set_tags(data['tags'])
        
        db.session.add(content_item)
        db.session.commit()
        
        return jsonify(content_item.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@personalization_bp.route('/content', methods=['GET'])
def get_content_items():
    """Get content items"""
    try:
        newsletter_id = request.args.get('newsletter_id')
        content_type = request.args.get('content_type')
        
        query = ContentItem.query
        
        if newsletter_id:
            query = query.filter(ContentItem.newsletter_id == newsletter_id)
        
        if content_type:
            query = query.filter(ContentItem.content_type == content_type)
        
        content_items = query.order_by(ContentItem.created_at.desc()).limit(100).all()
        
        return jsonify([item.to_dict() for item in content_items])
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

