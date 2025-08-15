import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.subscriber import db
from src.routes.user import user_bp
from src.routes.personalization import personalization_bp
from src.routes.advanced_features import advanced_bp
from src.routes.salesforce import salesforce_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

# Enable CORS for all routes - Replit compatibility
CORS(app, origins=['*'], allow_headers=['*'], methods=['*'])

app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(personalization_bp, url_prefix='/api')
app.register_blueprint(advanced_bp, url_prefix='/api/advanced')
app.register_blueprint(salesforce_bp, url_prefix='/api/salesforce')

# Database configuration - Replit compatible
database_path = os.path.join(os.path.dirname(__file__), 'database', 'app.db')
os.makedirs(os.path.dirname(database_path), exist_ok=True)
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{database_path}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Initialize database
with app.app_context():
    db.create_all()
    
    # Seed demo data if database is empty
    from src.models.subscriber import Subscriber
    if Subscriber.query.count() == 0:
        print("🌱 Seeding demo data...")
        try:
            from src.demo_data_seeder import seed_demo_data
            seed_demo_data()
            print("✅ Demo data seeded successfully!")
        except Exception as e:
            print(f"⚠️ Could not seed demo data: {e}")

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404

@app.route('/health')
def health_check():
    """Health check endpoint for Replit"""
    return {"status": "healthy", "service": "PersonalizeAI Backend", "version": "1.0.0"}

if __name__ == '__main__':
    # Replit-compatible server configuration
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
