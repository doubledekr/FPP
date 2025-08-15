"""
Salesforce Integration Service for PersonalizeAI
Handles CRM data synchronization, lead scoring, and contact enrichment
"""

import json
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import logging

logger = logging.getLogger(__name__)

class SalesforceService:
    """Service for integrating with Salesforce CRM"""
    
    def __init__(self, instance_url: str = None, access_token: str = None):
        self.instance_url = instance_url or "https://demo.salesforce.com"
        self.access_token = access_token or "demo_token"
        self.api_version = "v58.0"
        self.base_url = f"{self.instance_url}/services/data/{self.api_version}"
        
    def authenticate(self, client_id: str, client_secret: str, username: str, password: str) -> Dict[str, Any]:
        """Authenticate with Salesforce using OAuth 2.0"""
        try:
            # In demo mode, return mock authentication
            return {
                "access_token": "demo_access_token_12345",
                "instance_url": "https://demo.salesforce.com",
                "token_type": "Bearer",
                "expires_in": 3600,
                "scope": "full",
                "authenticated": True,
                "demo_mode": True
            }
        except Exception as e:
            logger.error(f"Salesforce authentication failed: {e}")
            return {"error": str(e), "authenticated": False}
    
    def sync_subscriber_to_contact(self, subscriber_data: Dict[str, Any]) -> Dict[str, Any]:
        """Sync PersonalizeAI subscriber data to Salesforce Contact"""
        try:
            # Calculate engagement metrics
            engagement_score = self._calculate_engagement_score(subscriber_data)
            lead_score = self._calculate_lead_score(subscriber_data, engagement_score)
            
            # Prepare Salesforce contact data
            contact_data = {
                "FirstName": subscriber_data.get("first_name", ""),
                "LastName": subscriber_data.get("last_name", ""),
                "Email": subscriber_data.get("email", ""),
                "PersonalizeAI_Engagement_Score__c": engagement_score,
                "PersonalizeAI_Lead_Score__c": lead_score,
                "PersonalizeAI_Subscriber_ID__c": subscriber_data.get("id"),
                "PersonalizeAI_Segment__c": subscriber_data.get("segment", ""),
                "PersonalizeAI_Churn_Risk__c": subscriber_data.get("churn_risk", 0),
                "PersonalizeAI_Last_Sync__c": datetime.utcnow().isoformat(),
                "LeadSource": "PersonalizeAI Newsletter"
            }
            
            # In demo mode, simulate successful sync
            return {
                "success": True,
                "contact_id": f"003{subscriber_data.get('id', '000')}0000ABC123",
                "lead_score": lead_score,
                "engagement_score": engagement_score,
                "sync_timestamp": datetime.utcnow().isoformat(),
                "demo_mode": True,
                "contact_data": contact_data
            }
            
        except Exception as e:
            logger.error(f"Failed to sync subscriber to Salesforce: {e}")
            return {"success": False, "error": str(e)}
    
    def get_contact_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Retrieve Salesforce contact by email address"""
        try:
            # In demo mode, return mock contact data
            return {
                "Id": f"003{hash(email) % 1000}0000ABC123",
                "FirstName": email.split('@')[0].split('.')[0].title(),
                "LastName": email.split('@')[0].split('.')[-1].title(),
                "Email": email,
                "PersonalizeAI_Engagement_Score__c": 75.5,
                "PersonalizeAI_Lead_Score__c": 82.3,
                "PersonalizeAI_Segment__c": "high_engagement",
                "LeadSource": "PersonalizeAI Newsletter",
                "CreatedDate": (datetime.utcnow() - timedelta(days=30)).isoformat(),
                "LastModifiedDate": datetime.utcnow().isoformat(),
                "demo_mode": True
            }
        except Exception as e:
            logger.error(f"Failed to retrieve contact: {e}")
            return None
    
    def update_lead_scores(self, subscriber_updates: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Bulk update lead scores in Salesforce based on engagement data"""
        try:
            updated_contacts = []
            
            for update in subscriber_updates:
                engagement_score = self._calculate_engagement_score(update)
                lead_score = self._calculate_lead_score(update, engagement_score)
                
                contact_update = {
                    "contact_id": f"003{update.get('id', '000')}0000ABC123",
                    "email": update.get("email"),
                    "old_lead_score": update.get("previous_lead_score", 50),
                    "new_lead_score": lead_score,
                    "engagement_score": engagement_score,
                    "score_change": lead_score - update.get("previous_lead_score", 50),
                    "last_updated": datetime.utcnow().isoformat()
                }
                updated_contacts.append(contact_update)
            
            return {
                "success": True,
                "updated_count": len(updated_contacts),
                "contacts": updated_contacts,
                "average_score_improvement": sum(c["score_change"] for c in updated_contacts) / len(updated_contacts) if updated_contacts else 0,
                "demo_mode": True
            }
            
        except Exception as e:
            logger.error(f"Failed to update lead scores: {e}")
            return {"success": False, "error": str(e)}
    
    def create_opportunity_from_engagement(self, subscriber_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create Salesforce opportunity for highly engaged subscribers"""
        try:
            engagement_score = self._calculate_engagement_score(subscriber_data)
            
            # Only create opportunities for high-engagement subscribers
            if engagement_score < 80:
                return {"success": False, "reason": "Engagement score too low for opportunity creation"}
            
            opportunity_data = {
                "Name": f"PersonalizeAI Lead - {subscriber_data.get('first_name', '')} {subscriber_data.get('last_name', '')}",
                "StageName": "Prospecting",
                "CloseDate": (datetime.utcnow() + timedelta(days=30)).strftime("%Y-%m-%d"),
                "Amount": self._estimate_opportunity_value(subscriber_data),
                "LeadSource": "PersonalizeAI Newsletter Engagement",
                "PersonalizeAI_Engagement_Score__c": engagement_score,
                "Description": f"High-engagement newsletter subscriber with {engagement_score:.1f}% engagement score"
            }
            
            return {
                "success": True,
                "opportunity_id": f"006{subscriber_data.get('id', '000')}0000DEF456",
                "opportunity_data": opportunity_data,
                "estimated_value": opportunity_data["Amount"],
                "demo_mode": True
            }
            
        except Exception as e:
            logger.error(f"Failed to create opportunity: {e}")
            return {"success": False, "error": str(e)}
    
    def get_salesforce_analytics(self) -> Dict[str, Any]:
        """Get analytics on Salesforce integration performance"""
        try:
            # Mock analytics data for demo
            return {
                "total_contacts_synced": 847,
                "opportunities_created": 23,
                "average_lead_score_improvement": 15.7,
                "total_pipeline_value": 284500,
                "conversion_rate": 2.7,
                "last_sync": datetime.utcnow().isoformat(),
                "sync_frequency": "Every 4 hours",
                "top_performing_segments": [
                    {"segment": "high_engagement", "avg_lead_score": 87.3, "opportunity_rate": 4.2},
                    {"segment": "stock_focused", "avg_lead_score": 82.1, "opportunity_rate": 3.8},
                    {"segment": "premium_subscribers", "avg_lead_score": 79.5, "opportunity_rate": 3.1}
                ],
                "recent_opportunities": [
                    {
                        "name": "PersonalizeAI Lead - John Investor",
                        "amount": 15000,
                        "stage": "Qualification",
                        "created_date": (datetime.utcnow() - timedelta(days=2)).isoformat()
                    },
                    {
                        "name": "PersonalizeAI Lead - Sarah Trader",
                        "amount": 25000,
                        "stage": "Proposal",
                        "created_date": (datetime.utcnow() - timedelta(days=5)).isoformat()
                    }
                ],
                "demo_mode": True
            }
        except Exception as e:
            logger.error(f"Failed to get Salesforce analytics: {e}")
            return {"error": str(e)}
    
    def _calculate_engagement_score(self, subscriber_data: Dict[str, Any]) -> float:
        """Calculate engagement score based on subscriber behavior"""
        base_score = 50.0
        
        # Adjust based on subscription tier
        tier_multiplier = {
            "premium": 1.3,
            "standard": 1.1,
            "basic": 0.9
        }
        
        tier = subscriber_data.get("subscription_tier", "basic")
        score = base_score * tier_multiplier.get(tier, 1.0)
        
        # Adjust based on engagement metrics (if available)
        if "engagement_metrics" in subscriber_data:
            metrics = subscriber_data["engagement_metrics"]
            open_rate = metrics.get("open_rate", 0.25)
            click_rate = metrics.get("click_rate", 0.03)
            
            # Higher open and click rates increase score
            score += (open_rate - 0.25) * 100  # Baseline 25% open rate
            score += (click_rate - 0.03) * 500  # Baseline 3% click rate
        
        # Adjust based on segment
        segment_bonus = {
            "high_engagement": 20,
            "stock_focused": 15,
            "market_focused": 10,
            "news_focused": 5,
            "low_engagement": -15
        }
        
        segment = subscriber_data.get("segment", "")
        score += segment_bonus.get(segment, 0)
        
        # Ensure score is within reasonable bounds
        return max(0, min(100, score))
    
    def _calculate_lead_score(self, subscriber_data: Dict[str, Any], engagement_score: float) -> float:
        """Calculate lead score for Salesforce based on engagement and other factors"""
        base_lead_score = engagement_score * 0.8  # Start with 80% of engagement score
        
        # Bonus for premium subscribers
        if subscriber_data.get("subscription_tier") == "premium":
            base_lead_score += 10
        
        # Bonus for recent signups (more likely to convert)
        signup_date = subscriber_data.get("signup_date")
        if signup_date:
            try:
                signup_dt = datetime.fromisoformat(signup_date.replace('Z', '+00:00'))
                days_since_signup = (datetime.utcnow() - signup_dt.replace(tzinfo=None)).days
                if days_since_signup < 30:
                    base_lead_score += 15  # Recent signups get bonus
                elif days_since_signup > 365:
                    base_lead_score -= 5   # Very old subscribers get slight penalty
            except:
                pass
        
        # Penalty for high churn risk
        churn_risk = subscriber_data.get("churn_risk", 0)
        base_lead_score -= churn_risk * 20
        
        return max(0, min(100, base_lead_score))
    
    def _estimate_opportunity_value(self, subscriber_data: Dict[str, Any]) -> float:
        """Estimate potential opportunity value based on subscriber profile"""
        base_value = 10000  # Base opportunity value
        
        # Adjust based on subscription tier
        tier_multiplier = {
            "premium": 2.5,
            "standard": 1.5,
            "basic": 1.0
        }
        
        tier = subscriber_data.get("subscription_tier", "basic")
        value = base_value * tier_multiplier.get(tier, 1.0)
        
        # Adjust based on engagement
        engagement_score = self._calculate_engagement_score(subscriber_data)
        if engagement_score > 90:
            value *= 1.5
        elif engagement_score > 80:
            value *= 1.3
        elif engagement_score < 50:
            value *= 0.7
        
        return round(value, 2)

# Demo data for Salesforce integration
def get_demo_salesforce_data():
    """Generate demo data for Salesforce integration showcase"""
    return {
        "connection_status": {
            "connected": True,
            "instance_url": "https://demo.salesforce.com",
            "last_sync": datetime.utcnow().isoformat(),
            "sync_status": "Active",
            "demo_mode": True
        },
        "sync_statistics": {
            "total_contacts": 847,
            "synced_today": 23,
            "opportunities_created": 15,
            "pipeline_value": 284500,
            "average_lead_score": 73.2,
            "sync_success_rate": 98.7
        },
        "field_mappings": [
            {"personalize_field": "email", "salesforce_field": "Email", "status": "mapped"},
            {"personalize_field": "first_name", "salesforce_field": "FirstName", "status": "mapped"},
            {"personalize_field": "last_name", "salesforce_field": "LastName", "status": "mapped"},
            {"personalize_field": "engagement_score", "salesforce_field": "PersonalizeAI_Engagement_Score__c", "status": "mapped"},
            {"personalize_field": "lead_score", "salesforce_field": "PersonalizeAI_Lead_Score__c", "status": "mapped"},
            {"personalize_field": "segment", "salesforce_field": "PersonalizeAI_Segment__c", "status": "mapped"},
            {"personalize_field": "churn_risk", "salesforce_field": "PersonalizeAI_Churn_Risk__c", "status": "mapped"}
        ],
        "recent_syncs": [
            {
                "contact_name": "John Investor",
                "email": "john.investor@example.com",
                "lead_score": 87.3,
                "opportunity_created": True,
                "sync_time": (datetime.utcnow() - timedelta(minutes=15)).isoformat()
            },
            {
                "contact_name": "Sarah Trader",
                "email": "sarah.trader@example.com",
                "lead_score": 82.1,
                "opportunity_created": True,
                "sync_time": (datetime.utcnow() - timedelta(minutes=32)).isoformat()
            },
            {
                "contact_name": "Lisa Analyst",
                "email": "lisa.analyst@example.com",
                "lead_score": 79.5,
                "opportunity_created": False,
                "sync_time": (datetime.utcnow() - timedelta(hours=1)).isoformat()
            }
        ]
    }

