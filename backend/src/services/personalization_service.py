import random
import json
from datetime import datetime, timedelta
from collections import defaultdict, Counter
from src.models.subscriber import db, Subscriber, EngagementEvent, SubscriberProfile, ContentItem

class PersonalizationService:
    """
    Core personalization service that handles AI-driven content personalization,
    engagement scoring, and churn prediction.
    """
    
    @staticmethod
    def calculate_engagement_score(subscriber_id, days=30):
        """
        Calculate engagement score based on recent subscriber behavior.
        Returns a score from 0-100.
        """
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Get recent engagement events
        events = EngagementEvent.query.filter(
            EngagementEvent.subscriber_id == subscriber_id,
            EngagementEvent.timestamp >= start_date
        ).all()
        
        if not events:
            return 0.0
        
        # Count different event types
        opens = len([e for e in events if e.event_type == 'email_open'])
        clicks = len([e for e in events if e.event_type == 'link_click'])
        content_views = len([e for e in events if e.event_type == 'content_view'])
        
        # Estimate total emails sent (for demo, assume 1 per day)
        total_emails = min(days, 30)  # Cap at 30 for realistic rates
        
        if total_emails == 0:
            return 0.0
        
        # Calculate rates
        open_rate = min(opens / total_emails, 1.0)
        click_rate = min(clicks / total_emails, 1.0) if opens > 0 else 0
        engagement_rate = min(content_views / total_emails, 1.0)
        
        # Weighted scoring: opens (30%), clicks (40%), content engagement (30%)
        engagement_score = (open_rate * 30 + click_rate * 40 + engagement_rate * 30)
        
        return min(engagement_score, 100.0)
    
    @staticmethod
    def analyze_content_preferences(subscriber_id):
        """
        Analyze subscriber's content preferences based on engagement history.
        Returns a dictionary of content type preferences with scores.
        """
        # Get all engagement events for this subscriber
        events = EngagementEvent.query.filter(
            EngagementEvent.subscriber_id == subscriber_id
        ).all()
        
        if not events:
            return {}
        
        # Count engagement by content section/type
        section_engagement = defaultdict(int)
        total_events = len(events)
        
        for event in events:
            if event.content_section:
                section_engagement[event.content_section] += 1
        
        # Convert to preferences with scores
        preferences = {}
        for section, count in section_engagement.items():
            preferences[section] = (count / total_events) * 100
        
        return preferences
    
    @staticmethod
    def predict_churn_risk(subscriber_id):
        """
        Predict churn risk based on engagement patterns and subscriber behavior.
        Returns a risk score from 0-100 (higher = more likely to churn).
        """
        subscriber = Subscriber.query.get(subscriber_id)
        if not subscriber:
            return 0.0
        
        # Calculate days since signup
        days_since_signup = (datetime.utcnow() - subscriber.signup_date).days
        
        # Get recent engagement
        recent_events = EngagementEvent.query.filter(
            EngagementEvent.subscriber_id == subscriber_id,
            EngagementEvent.timestamp >= datetime.utcnow() - timedelta(days=14)
        ).count()
        
        # Get last engagement
        last_event = EngagementEvent.query.filter(
            EngagementEvent.subscriber_id == subscriber_id
        ).order_by(EngagementEvent.timestamp.desc()).first()
        
        days_since_last_engagement = 0
        if last_event:
            days_since_last_engagement = (datetime.utcnow() - last_event.timestamp).days
        else:
            days_since_last_engagement = days_since_signup
        
        # Calculate churn risk factors
        risk_factors = []
        
        # Factor 1: Days since last engagement (higher = more risk)
        if days_since_last_engagement > 14:
            risk_factors.append(min(days_since_last_engagement * 2, 40))
        
        # Factor 2: Low recent engagement (less than 2 events in 2 weeks)
        if recent_events < 2:
            risk_factors.append(30)
        
        # Factor 3: New subscriber with no engagement (first 7 days)
        if days_since_signup <= 7 and recent_events == 0:
            risk_factors.append(50)
        
        # Factor 4: Long-term subscriber with declining engagement
        if days_since_signup > 90 and recent_events < 1:
            risk_factors.append(35)
        
        # Calculate final risk score
        if not risk_factors:
            return 10.0  # Base risk for active subscribers
        
        churn_risk = min(sum(risk_factors), 100.0)
        return churn_risk
    
    @staticmethod
    def determine_behavioral_segments(subscriber_id):
        """
        Determine behavioral segments for a subscriber based on their activity patterns.
        Returns a list of segment names.
        """
        engagement_score = PersonalizationService.calculate_engagement_score(subscriber_id)
        churn_risk = PersonalizationService.predict_churn_risk(subscriber_id)
        preferences = PersonalizationService.analyze_content_preferences(subscriber_id)
        
        segments = []
        
        # Engagement-based segments
        if engagement_score >= 70:
            segments.append('high_engagement')
        elif engagement_score >= 40:
            segments.append('medium_engagement')
        else:
            segments.append('low_engagement')
        
        # Risk-based segments
        if churn_risk >= 70:
            segments.append('high_churn_risk')
        elif churn_risk >= 40:
            segments.append('medium_churn_risk')
        else:
            segments.append('low_churn_risk')
        
        # Content preference segments
        if preferences:
            top_preference = max(preferences, key=preferences.get)
            if 'stock_analysis' in top_preference.lower():
                segments.append('stock_focused')
            elif 'market' in top_preference.lower():
                segments.append('market_focused')
            elif 'news' in top_preference.lower():
                segments.append('news_focused')
        
        return segments
    
    @staticmethod
    def generate_personalized_subject_line(subscriber_id, content_summary, base_subject):
        """
        Generate a personalized subject line based on subscriber preferences.
        For demo purposes, this uses rule-based logic. In production, would use OpenAI API.
        """
        subscriber = Subscriber.query.get(subscriber_id)
        if not subscriber:
            return base_subject
        
        profile = SubscriberProfile.query.filter_by(subscriber_id=subscriber_id).first()
        if not profile:
            return base_subject
        
        segments = profile.get_behavioral_segments()
        preferences = profile.get_content_preferences()
        
        # Personalization rules based on segments
        personalized_subject = base_subject
        
        if 'high_engagement' in segments:
            personalized_subject = f"🔥 {base_subject}"
        elif 'low_engagement' in segments:
            personalized_subject = f"Quick Read: {base_subject}"
        
        if 'stock_focused' in segments and 'stock' in content_summary.lower():
            personalized_subject = f"📈 Stock Alert: {base_subject}"
        elif 'market_focused' in segments and 'market' in content_summary.lower():
            personalized_subject = f"📊 Market Update: {base_subject}"
        
        # Add urgency for high churn risk subscribers
        if 'high_churn_risk' in segments:
            personalized_subject = f"Don't Miss: {personalized_subject}"
        
        return personalized_subject
    
    @staticmethod
    def personalize_content_order(subscriber_id, content_items):
        """
        Reorder content items based on subscriber preferences.
        Returns reordered list of content items.
        """
        profile = SubscriberProfile.query.filter_by(subscriber_id=subscriber_id).first()
        if not profile:
            return content_items
        
        preferences = profile.get_content_preferences()
        if not preferences:
            return content_items
        
        # Sort content by preference scores
        def preference_score(item):
            section = item.get('section_name', '')
            content_type = item.get('content_type', '')
            
            # Get preference scores for section and content type
            section_score = preferences.get(section, 0)
            type_score = preferences.get(content_type, 0)
            
            return section_score + type_score
        
        # Sort by preference score (descending)
        personalized_items = sorted(content_items, key=preference_score, reverse=True)
        
        return personalized_items
    
    @staticmethod
    def update_subscriber_profile(subscriber_id):
        """
        Update or create subscriber profile with latest analytics.
        """
        # Calculate all metrics
        engagement_score = PersonalizationService.calculate_engagement_score(subscriber_id)
        content_preferences = PersonalizationService.analyze_content_preferences(subscriber_id)
        churn_risk_score = PersonalizationService.predict_churn_risk(subscriber_id)
        behavioral_segments = PersonalizationService.determine_behavioral_segments(subscriber_id)
        
        # Get or create profile
        profile = SubscriberProfile.query.filter_by(subscriber_id=subscriber_id).first()
        if not profile:
            profile = SubscriberProfile(subscriber_id=subscriber_id)
            db.session.add(profile)
        
        # Update profile data
        profile.engagement_score = engagement_score
        profile.set_content_preferences(content_preferences)
        profile.churn_risk_score = churn_risk_score
        profile.set_behavioral_segments(behavioral_segments)
        profile.last_updated = datetime.utcnow()
        
        # Determine optimal send time (simplified logic)
        recent_opens = EngagementEvent.query.filter(
            EngagementEvent.subscriber_id == subscriber_id,
            EngagementEvent.event_type == 'email_open',
            EngagementEvent.timestamp >= datetime.utcnow() - timedelta(days=30)
        ).all()
        
        if recent_opens:
            # Find most common hour for opens
            hours = [event.timestamp.hour for event in recent_opens]
            most_common_hour = Counter(hours).most_common(1)[0][0]
            profile.optimal_send_time = f"{most_common_hour:02d}:00"
        else:
            profile.optimal_send_time = "09:00"  # Default morning time
        
        db.session.commit()
        return profile
    
    @staticmethod
    def get_dashboard_analytics(days=30):
        """
        Get analytics data for the publisher dashboard.
        """
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Get all subscribers and their profiles
        subscribers = Subscriber.query.all()
        total_subscribers = len(subscribers)
        
        # Get engagement events in date range
        events = EngagementEvent.query.filter(
            EngagementEvent.timestamp >= start_date
        ).all()
        
        # Calculate overall metrics
        total_opens = len([e for e in events if e.event_type == 'email_open'])
        total_clicks = len([e for e in events if e.event_type == 'link_click'])
        total_emails_sent = total_subscribers * days  # Simplified assumption
        
        overall_open_rate = (total_opens / total_emails_sent * 100) if total_emails_sent > 0 else 0
        overall_click_rate = (total_clicks / total_emails_sent * 100) if total_emails_sent > 0 else 0
        
        # Segment analysis
        segments_data = defaultdict(int)
        churn_risk_distribution = {'low': 0, 'medium': 0, 'high': 0}
        
        for subscriber in subscribers:
            profile = SubscriberProfile.query.filter_by(subscriber_id=subscriber.id).first()
            if profile:
                segments = profile.get_behavioral_segments()
                for segment in segments:
                    segments_data[segment] += 1
                
                # Churn risk distribution
                if profile.churn_risk_score >= 70:
                    churn_risk_distribution['high'] += 1
                elif profile.churn_risk_score >= 40:
                    churn_risk_distribution['medium'] += 1
                else:
                    churn_risk_distribution['low'] += 1
        
        # Daily engagement trends (last 7 days)
        daily_trends = []
        for i in range(7):
            day_start = end_date - timedelta(days=i+1)
            day_end = day_start + timedelta(days=1)
            
            day_opens = EngagementEvent.query.filter(
                EngagementEvent.event_type == 'email_open',
                EngagementEvent.timestamp >= day_start,
                EngagementEvent.timestamp < day_end
            ).count()
            
            day_clicks = EngagementEvent.query.filter(
                EngagementEvent.event_type == 'link_click',
                EngagementEvent.timestamp >= day_start,
                EngagementEvent.timestamp < day_end
            ).count()
            
            daily_trends.append({
                'date': day_start.strftime('%Y-%m-%d'),
                'opens': day_opens,
                'clicks': day_clicks,
                'open_rate': (day_opens / total_subscribers * 100) if total_subscribers > 0 else 0,
                'click_rate': (day_clicks / total_subscribers * 100) if total_subscribers > 0 else 0
            })
        
        return {
            'total_subscribers': total_subscribers,
            'overall_open_rate': round(overall_open_rate, 2),
            'overall_click_rate': round(overall_click_rate, 2),
            'segments': dict(segments_data),
            'churn_risk_distribution': churn_risk_distribution,
            'daily_trends': list(reversed(daily_trends)),
            'total_events': len(events)
        }

