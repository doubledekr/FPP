from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class Subscriber(db.Model):
    __tablename__ = 'subscribers'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    signup_date = db.Column(db.DateTime, default=datetime.utcnow)
    platform_id = db.Column(db.String(50), nullable=False)
    platform_subscriber_id = db.Column(db.String(100), nullable=False)
    subscription_tier = db.Column(db.String(50), default='basic')
    preferences = db.Column(db.Text, default='{}')  # JSON string
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    engagement_events = db.relationship('EngagementEvent', backref='subscriber', lazy=True)
    profile = db.relationship('SubscriberProfile', backref='subscriber', uselist=False)
    
    def __init__(self, email, platform_id, platform_subscriber_id, **kwargs):
        self.email = email
        self.platform_id = platform_id
        self.platform_subscriber_id = platform_subscriber_id
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
    
    def get_preferences(self):
        """Get preferences as dictionary"""
        try:
            return json.loads(self.preferences) if self.preferences else {}
        except:
            return {}
    
    def set_preferences(self, prefs_dict):
        """Set preferences from dictionary"""
        self.preferences = json.dumps(prefs_dict)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'signup_date': self.signup_date.isoformat() if self.signup_date else None,
            'platform_id': self.platform_id,
            'platform_subscriber_id': self.platform_subscriber_id,
            'subscription_tier': self.subscription_tier,
            'preferences': self.get_preferences(),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class EngagementEvent(db.Model):
    __tablename__ = 'engagement_events'
    
    id = db.Column(db.Integer, primary_key=True)
    subscriber_id = db.Column(db.Integer, db.ForeignKey('subscribers.id'), nullable=False)
    event_type = db.Column(db.String(50), nullable=False)  # 'email_open', 'link_click', 'content_view', 'unsubscribe'
    event_data = db.Column(db.Text, default='{}')  # JSON string for additional event data
    newsletter_id = db.Column(db.String(100))
    content_section = db.Column(db.String(100))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    platform_id = db.Column(db.String(50), nullable=False)
    
    def __init__(self, subscriber_id, event_type, platform_id, **kwargs):
        self.subscriber_id = subscriber_id
        self.event_type = event_type
        self.platform_id = platform_id
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
    
    def get_event_data(self):
        """Get event data as dictionary"""
        try:
            return json.loads(self.event_data) if self.event_data else {}
        except:
            return {}
    
    def set_event_data(self, data_dict):
        """Set event data from dictionary"""
        self.event_data = json.dumps(data_dict)
    
    def to_dict(self):
        return {
            'id': self.id,
            'subscriber_id': self.subscriber_id,
            'event_type': self.event_type,
            'event_data': self.get_event_data(),
            'newsletter_id': self.newsletter_id,
            'content_section': self.content_section,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'platform_id': self.platform_id
        }


class ContentItem(db.Model):
    __tablename__ = 'content_items'
    
    id = db.Column(db.Integer, primary_key=True)
    newsletter_id = db.Column(db.String(100), nullable=False)
    section_name = db.Column(db.String(100), nullable=False)
    content_type = db.Column(db.String(50), nullable=False)  # 'stock_analysis', 'market_commentary', 'news', 'recommendation'
    title = db.Column(db.Text)
    summary = db.Column(db.Text)
    content_text = db.Column(db.Text)
    tags = db.Column(db.Text, default='[]')  # JSON array of tags
    performance_metrics = db.Column(db.Text, default='{}')  # JSON object with metrics
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __init__(self, newsletter_id, section_name, content_type, **kwargs):
        self.newsletter_id = newsletter_id
        self.section_name = section_name
        self.content_type = content_type
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
    
    def get_tags(self):
        """Get tags as list"""
        try:
            return json.loads(self.tags) if self.tags else []
        except:
            return []
    
    def set_tags(self, tags_list):
        """Set tags from list"""
        self.tags = json.dumps(tags_list)
    
    def get_performance_metrics(self):
        """Get performance metrics as dictionary"""
        try:
            return json.loads(self.performance_metrics) if self.performance_metrics else {}
        except:
            return {}
    
    def set_performance_metrics(self, metrics_dict):
        """Set performance metrics from dictionary"""
        self.performance_metrics = json.dumps(metrics_dict)
    
    def to_dict(self):
        return {
            'id': self.id,
            'newsletter_id': self.newsletter_id,
            'section_name': self.section_name,
            'content_type': self.content_type,
            'title': self.title,
            'summary': self.summary,
            'content_text': self.content_text,
            'tags': self.get_tags(),
            'performance_metrics': self.get_performance_metrics(),
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class SubscriberProfile(db.Model):
    __tablename__ = 'subscriber_profiles'
    
    id = db.Column(db.Integer, primary_key=True)
    subscriber_id = db.Column(db.Integer, db.ForeignKey('subscribers.id'), nullable=False, unique=True)
    engagement_score = db.Column(db.Float, default=0.0)
    content_preferences = db.Column(db.Text, default='{}')  # JSON object
    behavioral_segments = db.Column(db.Text, default='[]')  # JSON array
    churn_risk_score = db.Column(db.Float, default=0.0)
    optimal_send_time = db.Column(db.String(10))  # HH:MM format
    preferred_content_length = db.Column(db.String(20), default='medium')
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __init__(self, subscriber_id, **kwargs):
        self.subscriber_id = subscriber_id
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
    
    def get_content_preferences(self):
        """Get content preferences as dictionary"""
        try:
            return json.loads(self.content_preferences) if self.content_preferences else {}
        except:
            return {}
    
    def set_content_preferences(self, prefs_dict):
        """Set content preferences from dictionary"""
        self.content_preferences = json.dumps(prefs_dict)
    
    def get_behavioral_segments(self):
        """Get behavioral segments as list"""
        try:
            return json.loads(self.behavioral_segments) if self.behavioral_segments else []
        except:
            return []
    
    def set_behavioral_segments(self, segments_list):
        """Set behavioral segments from list"""
        self.behavioral_segments = json.dumps(segments_list)
    
    def to_dict(self):
        return {
            'id': self.id,
            'subscriber_id': self.subscriber_id,
            'engagement_score': self.engagement_score,
            'content_preferences': self.get_content_preferences(),
            'behavioral_segments': self.get_behavioral_segments(),
            'churn_risk_score': self.churn_risk_score,
            'optimal_send_time': self.optimal_send_time,
            'preferred_content_length': self.preferred_content_length,
            'last_updated': self.last_updated.isoformat() if self.last_updated else None
        }

