"""
Demo data seeder for PersonalizeAI prototype.
Creates sample subscribers, engagement events, and content items for demonstration.
"""

import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import random
from datetime import datetime, timedelta
from src.models.subscriber import db, Subscriber, EngagementEvent, ContentItem, SubscriberProfile
from src.services.personalization_service import PersonalizationService

class DemoDataSeeder:
    
    @staticmethod
    def seed_all():
        """Seed all demo data"""
        print("🌱 Seeding demo data...")
        
        # Clear existing data
        DemoDataSeeder.clear_data()
        
        # Seed data in order
        subscribers = DemoDataSeeder.seed_subscribers()
        content_items = DemoDataSeeder.seed_content_items()
        DemoDataSeeder.seed_engagement_events(subscribers, content_items)
        DemoDataSeeder.update_all_profiles(subscribers)
        
        print("✅ Demo data seeding completed!")
        return True
    
    @staticmethod
    def clear_data():
        """Clear existing demo data"""
        print("🧹 Clearing existing data...")
        SubscriberProfile.query.delete()
        EngagementEvent.query.delete()
        ContentItem.query.delete()
        Subscriber.query.delete()
        db.session.commit()
    
    @staticmethod
    def seed_subscribers():
        """Create sample subscribers representing different user types"""
        print("👥 Creating sample subscribers...")
        
        sample_subscribers = [
            {
                'email': 'john.investor@example.com',
                'first_name': 'John',
                'last_name': 'Investor',
                'platform_id': 'mailchimp',
                'platform_subscriber_id': 'mc_001',
                'subscription_tier': 'premium',
                'signup_days_ago': 120
            },
            {
                'email': 'sarah.trader@example.com',
                'first_name': 'Sarah',
                'last_name': 'Trader',
                'platform_id': 'mailchimp',
                'platform_subscriber_id': 'mc_002',
                'subscription_tier': 'premium',
                'signup_days_ago': 45
            },
            {
                'email': 'mike.newbie@example.com',
                'first_name': 'Mike',
                'last_name': 'Newbie',
                'platform_id': 'convertkit',
                'platform_subscriber_id': 'ck_001',
                'subscription_tier': 'basic',
                'signup_days_ago': 7
            },
            {
                'email': 'lisa.analyst@example.com',
                'first_name': 'Lisa',
                'last_name': 'Analyst',
                'platform_id': 'mailchimp',
                'platform_subscriber_id': 'mc_003',
                'subscription_tier': 'premium',
                'signup_days_ago': 200
            },
            {
                'email': 'david.casual@example.com',
                'first_name': 'David',
                'last_name': 'Casual',
                'platform_id': 'sendgrid',
                'platform_subscriber_id': 'sg_001',
                'subscription_tier': 'basic',
                'signup_days_ago': 30
            },
            {
                'email': 'emma.growth@example.com',
                'first_name': 'Emma',
                'last_name': 'Growth',
                'platform_id': 'mailchimp',
                'platform_subscriber_id': 'mc_004',
                'subscription_tier': 'premium',
                'signup_days_ago': 90
            },
            {
                'email': 'robert.value@example.com',
                'first_name': 'Robert',
                'last_name': 'Value',
                'platform_id': 'convertkit',
                'platform_subscriber_id': 'ck_002',
                'subscription_tier': 'premium',
                'signup_days_ago': 180
            },
            {
                'email': 'jennifer.inactive@example.com',
                'first_name': 'Jennifer',
                'last_name': 'Inactive',
                'platform_id': 'mailchimp',
                'platform_subscriber_id': 'mc_005',
                'subscription_tier': 'basic',
                'signup_days_ago': 60
            }
        ]
        
        created_subscribers = []
        
        for sub_data in sample_subscribers:
            signup_date = datetime.utcnow() - timedelta(days=sub_data['signup_days_ago'])
            
            subscriber = Subscriber(
                email=sub_data['email'],
                first_name=sub_data['first_name'],
                last_name=sub_data['last_name'],
                platform_id=sub_data['platform_id'],
                platform_subscriber_id=sub_data['platform_subscriber_id'],
                subscription_tier=sub_data['subscription_tier']
            )
            subscriber.signup_date = signup_date
            
            db.session.add(subscriber)
            created_subscribers.append(subscriber)
        
        db.session.commit()
        print(f"✅ Created {len(created_subscribers)} subscribers")
        return created_subscribers
    
    @staticmethod
    def seed_content_items():
        """Create sample newsletter content items"""
        print("📰 Creating sample content items...")
        
        sample_content = [
            {
                'newsletter_id': 'daily_2025_08_10',
                'section_name': 'Market Analysis',
                'content_type': 'market_commentary',
                'title': 'Tech Stocks Rally Continues',
                'summary': 'Technology sector shows strong momentum with AI stocks leading gains.',
                'tags': ['tech', 'AI', 'growth', 'momentum']
            },
            {
                'newsletter_id': 'daily_2025_08_10',
                'section_name': 'Stock Spotlight',
                'content_type': 'stock_analysis',
                'title': 'NVIDIA: AI Infrastructure Play',
                'summary': 'Deep dive into NVIDIA\'s position in the AI infrastructure market.',
                'tags': ['NVDA', 'AI', 'semiconductors', 'growth']
            },
            {
                'newsletter_id': 'daily_2025_08_10',
                'section_name': 'Economic News',
                'content_type': 'news',
                'title': 'Fed Minutes Signal Cautious Approach',
                'summary': 'Federal Reserve meeting minutes reveal measured stance on interest rates.',
                'tags': ['fed', 'interest_rates', 'monetary_policy']
            },
            {
                'newsletter_id': 'daily_2025_08_09',
                'section_name': 'Value Picks',
                'content_type': 'stock_recommendation',
                'title': 'Undervalued Dividend Stocks',
                'summary': 'Three dividend-paying stocks trading below fair value.',
                'tags': ['dividends', 'value', 'income', 'undervalued']
            },
            {
                'newsletter_id': 'daily_2025_08_09',
                'section_name': 'Market Analysis',
                'content_type': 'market_commentary',
                'title': 'Bond Market Signals',
                'summary': 'Yield curve movements suggest changing market sentiment.',
                'tags': ['bonds', 'yield_curve', 'fixed_income']
            },
            {
                'newsletter_id': 'daily_2025_08_08',
                'section_name': 'Crypto Corner',
                'content_type': 'crypto_analysis',
                'title': 'Bitcoin ETF Flows Update',
                'summary': 'Latest institutional flows into Bitcoin ETFs show continued interest.',
                'tags': ['bitcoin', 'ETF', 'institutional', 'crypto']
            }
        ]
        
        created_content = []
        
        for content_data in sample_content:
            content_item = ContentItem(
                newsletter_id=content_data['newsletter_id'],
                section_name=content_data['section_name'],
                content_type=content_data['content_type'],
                title=content_data['title'],
                summary=content_data['summary']
            )
            content_item.set_tags(content_data['tags'])
            
            db.session.add(content_item)
            created_content.append(content_item)
        
        db.session.commit()
        print(f"✅ Created {len(created_content)} content items")
        return created_content
    
    @staticmethod
    def seed_engagement_events(subscribers, content_items):
        """Create realistic engagement events for subscribers"""
        print("📊 Creating engagement events...")
        
        event_count = 0
        
        for subscriber in subscribers:
            # Define engagement patterns based on subscriber characteristics
            if 'newbie' in subscriber.email:
                # New subscriber - low engagement
                daily_open_rate = 0.3
                click_rate = 0.1
                days_active = 5
            elif 'inactive' in subscriber.email:
                # Inactive subscriber - very low engagement
                daily_open_rate = 0.1
                click_rate = 0.02
                days_active = 10
            elif 'casual' in subscriber.email:
                # Casual subscriber - moderate engagement
                daily_open_rate = 0.5
                click_rate = 0.2
                days_active = 20
            elif subscriber.subscription_tier == 'premium':
                # Premium subscribers - high engagement
                daily_open_rate = 0.8
                click_rate = 0.4
                days_active = 30
            else:
                # Default engagement
                daily_open_rate = 0.6
                click_rate = 0.25
                days_active = 25
            
            # Generate events for the last 30 days
            for days_ago in range(min(days_active, 30)):
                event_date = datetime.utcnow() - timedelta(days=days_ago)
                
                # Email open event
                if random.random() < daily_open_rate:
                    newsletter_id = f"daily_2025_08_{10-days_ago:02d}"
                    
                    open_event = EngagementEvent(
                        subscriber_id=subscriber.id,
                        event_type='email_open',
                        platform_id=subscriber.platform_id,
                        newsletter_id=newsletter_id
                    )
                    open_event.timestamp = event_date.replace(
                        hour=random.randint(7, 11),
                        minute=random.randint(0, 59)
                    )
                    
                    db.session.add(open_event)
                    event_count += 1
                    
                    # Click events (only if email was opened)
                    if random.random() < click_rate:
                        # Random content section click
                        content_sections = ['Market Analysis', 'Stock Spotlight', 'Economic News', 'Value Picks']
                        section = random.choice(content_sections)
                        
                        click_event = EngagementEvent(
                            subscriber_id=subscriber.id,
                            event_type='link_click',
                            platform_id=subscriber.platform_id,
                            newsletter_id=newsletter_id,
                            content_section=section
                        )
                        click_event.timestamp = open_event.timestamp + timedelta(minutes=random.randint(1, 30))
                        
                        db.session.add(click_event)
                        event_count += 1
                        
                        # Content view event (if they clicked)
                        if random.random() < 0.7:
                            view_event = EngagementEvent(
                                subscriber_id=subscriber.id,
                                event_type='content_view',
                                platform_id=subscriber.platform_id,
                                newsletter_id=newsletter_id,
                                content_section=section
                            )
                            view_event.timestamp = click_event.timestamp + timedelta(minutes=random.randint(1, 15))
                            
                            db.session.add(view_event)
                            event_count += 1
        
        db.session.commit()
        print(f"✅ Created {event_count} engagement events")
    
    @staticmethod
    def update_all_profiles(subscribers):
        """Update profiles for all subscribers"""
        print("🔄 Updating subscriber profiles...")
        
        for subscriber in subscribers:
            PersonalizationService.update_subscriber_profile(subscriber.id)
        
        print("✅ Updated all subscriber profiles")

def main():
    """Run the demo data seeder"""
    from src.main import app
    
    with app.app_context():
        DemoDataSeeder.seed_all()

def seed_demo_data():
    """Simple function for Replit compatibility"""
    return DemoDataSeeder.seed_all()

if __name__ == '__main__':
    main()

