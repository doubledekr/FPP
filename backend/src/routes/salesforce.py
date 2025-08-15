"""
Salesforce Integration API Routes for PersonalizeAI
Handles CRM synchronization, lead scoring, and opportunity management
"""

from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import logging
from ..services.salesforce_service import SalesforceService, get_demo_salesforce_data

logger = logging.getLogger(__name__)

salesforce_bp = Blueprint('salesforce', __name__)
salesforce_service = SalesforceService()

@salesforce_bp.route('/connection/status', methods=['GET'])
def get_connection_status():
    """Get Salesforce connection status"""
    try:
        demo_data = get_demo_salesforce_data()
        return jsonify({
            "status": "success",
            "connection": demo_data["connection_status"],
            "last_check": datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Error getting connection status: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@salesforce_bp.route('/connection/authenticate', methods=['POST'])
def authenticate_salesforce():
    """Authenticate with Salesforce"""
    try:
        data = request.get_json()
        client_id = data.get('client_id', 'demo_client_id')
        client_secret = data.get('client_secret', 'demo_client_secret')
        username = data.get('username', 'demo@personalizeai.com')
        password = data.get('password', 'demo_password')
        
        auth_result = salesforce_service.authenticate(client_id, client_secret, username, password)
        
        return jsonify({
            "status": "success",
            "authentication": auth_result,
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Error authenticating with Salesforce: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@salesforce_bp.route('/sync/subscriber/<int:subscriber_id>', methods=['POST'])
def sync_subscriber_to_salesforce(subscriber_id):
    """Sync a specific subscriber to Salesforce"""
    try:
        # Mock subscriber data for demo
        subscriber_data = {
            "id": subscriber_id,
            "first_name": "John",
            "last_name": "Investor",
            "email": f"subscriber{subscriber_id}@example.com",
            "segment": "high_engagement",
            "subscription_tier": "premium",
            "churn_risk": 0.15,
            "signup_date": (datetime.utcnow() - timedelta(days=90)).isoformat(),
            "engagement_metrics": {
                "open_rate": 0.65,
                "click_rate": 0.12
            }
        }
        
        sync_result = salesforce_service.sync_subscriber_to_contact(subscriber_data)
        
        return jsonify({
            "status": "success",
            "sync_result": sync_result,
            "subscriber_id": subscriber_id,
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Error syncing subscriber {subscriber_id}: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@salesforce_bp.route('/sync/bulk', methods=['POST'])
def bulk_sync_subscribers():
    """Bulk sync multiple subscribers to Salesforce"""
    try:
        data = request.get_json()
        subscriber_ids = data.get('subscriber_ids', [1, 2, 3, 4, 5])
        
        # Mock bulk sync data
        subscriber_updates = []
        for sub_id in subscriber_ids:
            subscriber_updates.append({
                "id": sub_id,
                "email": f"subscriber{sub_id}@example.com",
                "segment": "high_engagement" if sub_id % 2 == 0 else "stock_focused",
                "subscription_tier": "premium" if sub_id <= 3 else "basic",
                "previous_lead_score": 50 + (sub_id * 5),
                "engagement_metrics": {
                    "open_rate": 0.45 + (sub_id * 0.05),
                    "click_rate": 0.03 + (sub_id * 0.01)
                }
            })
        
        update_result = salesforce_service.update_lead_scores(subscriber_updates)
        
        return jsonify({
            "status": "success",
            "bulk_sync_result": update_result,
            "processed_count": len(subscriber_ids),
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Error in bulk sync: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@salesforce_bp.route('/opportunities/create', methods=['POST'])
def create_opportunity():
    """Create Salesforce opportunity for high-engagement subscriber"""
    try:
        data = request.get_json()
        subscriber_id = data.get('subscriber_id', 1)
        
        # Mock high-engagement subscriber data
        subscriber_data = {
            "id": subscriber_id,
            "first_name": "Sarah",
            "last_name": "Trader",
            "email": f"highvalue{subscriber_id}@example.com",
            "segment": "high_engagement",
            "subscription_tier": "premium",
            "engagement_metrics": {
                "open_rate": 0.85,
                "click_rate": 0.18
            }
        }
        
        opportunity_result = salesforce_service.create_opportunity_from_engagement(subscriber_data)
        
        return jsonify({
            "status": "success",
            "opportunity_result": opportunity_result,
            "subscriber_id": subscriber_id,
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Error creating opportunity: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@salesforce_bp.route('/analytics', methods=['GET'])
def get_salesforce_analytics():
    """Get Salesforce integration analytics and performance metrics"""
    try:
        analytics = salesforce_service.get_salesforce_analytics()
        
        return jsonify({
            "status": "success",
            "analytics": analytics,
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Error getting Salesforce analytics: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@salesforce_bp.route('/contacts/search', methods=['GET'])
def search_contacts():
    """Search Salesforce contacts by email or other criteria"""
    try:
        email = request.args.get('email', 'john.investor@example.com')
        
        contact = salesforce_service.get_contact_by_email(email)
        
        if contact:
            return jsonify({
                "status": "success",
                "contact": contact,
                "found": True,
                "timestamp": datetime.utcnow().isoformat()
            })
        else:
            return jsonify({
                "status": "success",
                "contact": None,
                "found": False,
                "message": "Contact not found",
                "timestamp": datetime.utcnow().isoformat()
            })
    except Exception as e:
        logger.error(f"Error searching contacts: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@salesforce_bp.route('/dashboard/data', methods=['GET'])
def get_dashboard_data():
    """Get comprehensive dashboard data for Salesforce integration"""
    try:
        demo_data = get_demo_salesforce_data()
        analytics = salesforce_service.get_salesforce_analytics()
        
        dashboard_data = {
            "connection_status": demo_data["connection_status"],
            "sync_statistics": demo_data["sync_statistics"],
            "field_mappings": demo_data["field_mappings"],
            "recent_syncs": demo_data["recent_syncs"],
            "performance_metrics": {
                "total_pipeline_value": analytics["total_pipeline_value"],
                "opportunities_created": analytics["opportunities_created"],
                "conversion_rate": analytics["conversion_rate"],
                "average_lead_score_improvement": analytics["average_lead_score_improvement"]
            },
            "top_segments": analytics["top_performing_segments"],
            "recent_opportunities": analytics["recent_opportunities"]
        }
        
        return jsonify({
            "status": "success",
            "dashboard_data": dashboard_data,
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Error getting dashboard data: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@salesforce_bp.route('/lead-scoring/update', methods=['POST'])
def update_lead_scoring_rules():
    """Update lead scoring rules and algorithms"""
    try:
        data = request.get_json()
        rules = data.get('rules', {})
        
        # Mock update of lead scoring rules
        updated_rules = {
            "engagement_weight": rules.get("engagement_weight", 0.6),
            "tier_bonus": rules.get("tier_bonus", {"premium": 15, "standard": 10, "basic": 5}),
            "segment_bonus": rules.get("segment_bonus", {
                "high_engagement": 20,
                "stock_focused": 15,
                "market_focused": 10
            }),
            "churn_penalty": rules.get("churn_penalty", 0.3),
            "recency_bonus": rules.get("recency_bonus", 10),
            "last_updated": datetime.utcnow().isoformat()
        }
        
        return jsonify({
            "status": "success",
            "message": "Lead scoring rules updated successfully",
            "updated_rules": updated_rules,
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Error updating lead scoring rules: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@salesforce_bp.route('/reports/roi', methods=['GET'])
def get_salesforce_roi_report():
    """Generate ROI report for Salesforce integration"""
    try:
        # Mock ROI calculation
        roi_data = {
            "integration_cost": 5000,  # One-time setup cost
            "monthly_cost": 200,       # Monthly maintenance
            "pipeline_value_generated": 284500,
            "closed_deals_value": 85000,
            "deals_attributed_to_personalization": 12,
            "average_deal_size": 7083,
            "time_period_months": 6,
            "roi_percentage": 1600,    # 16x return
            "payback_period_months": 0.8,
            "metrics": {
                "lead_score_improvement": 23.7,
                "opportunity_creation_rate": 2.7,
                "sales_cycle_reduction_days": 12,
                "conversion_rate_improvement": 1.8
            },
            "projections": {
                "year_1_pipeline": 650000,
                "year_1_closed": 195000,
                "year_1_roi": 3800
            }
        }
        
        return jsonify({
            "status": "success",
            "roi_report": roi_data,
            "generated_at": datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Error generating ROI report: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@salesforce_bp.route('/demo/scenarios', methods=['GET'])
def get_demo_scenarios():
    """Get demo scenarios for client presentations"""
    try:
        scenarios = {
            "porter_co_salesforce": {
                "name": "Porter & Co + Salesforce Integration",
                "description": "Newsletter personalization with CRM lead scoring",
                "metrics": {
                    "newsletter_subscribers": 15420,
                    "salesforce_contacts": 8500,
                    "overlap_contacts": 3200,
                    "new_opportunities_monthly": 15,
                    "average_opportunity_value": 18500,
                    "pipeline_increase": 277500,
                    "lead_score_improvement": 28.3,
                    "sales_cycle_reduction": 18
                },
                "roi": {
                    "setup_cost": 8000,
                    "monthly_cost": 500,
                    "annual_pipeline_value": 3330000,
                    "annual_closed_value": 999000,
                    "roi_percentage": 12375,
                    "payback_months": 0.6
                }
            },
            "generic_financial_publisher": {
                "name": "Generic Financial Publisher + Salesforce",
                "description": "Mid-size publisher with existing Salesforce implementation",
                "metrics": {
                    "newsletter_subscribers": 8500,
                    "salesforce_contacts": 5200,
                    "overlap_contacts": 2100,
                    "new_opportunities_monthly": 8,
                    "average_opportunity_value": 12000,
                    "pipeline_increase": 96000,
                    "lead_score_improvement": 22.1,
                    "sales_cycle_reduction": 12
                },
                "roi": {
                    "setup_cost": 5000,
                    "monthly_cost": 300,
                    "annual_pipeline_value": 1152000,
                    "annual_closed_value": 345600,
                    "roi_percentage": 6812,
                    "payback_months": 1.2
                }
            },
            "premium_research_firm": {
                "name": "Premium Research Firm + Salesforce Enterprise",
                "description": "High-value subscribers with enterprise Salesforce setup",
                "metrics": {
                    "newsletter_subscribers": 3200,
                    "salesforce_contacts": 2800,
                    "overlap_contacts": 1900,
                    "new_opportunities_monthly": 12,
                    "average_opportunity_value": 45000,
                    "pipeline_increase": 540000,
                    "lead_score_improvement": 35.7,
                    "sales_cycle_reduction": 25
                },
                "roi": {
                    "setup_cost": 12000,
                    "monthly_cost": 800,
                    "annual_pipeline_value": 6480000,
                    "annual_closed_value": 1944000,
                    "roi_percentage": 15900,
                    "payback_months": 0.5
                }
            }
        }
        
        return jsonify({
            "status": "success",
            "demo_scenarios": scenarios,
            "usage_instructions": {
                "client_presentation": "Use these scenarios to demonstrate ROI potential based on client size and Salesforce usage",
                "customization": "Adjust subscriber counts and Salesforce contact numbers based on actual client data",
                "confidence_level": "Conservative estimates based on industry benchmarks and PersonalizeAI performance data"
            },
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Error getting demo scenarios: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

