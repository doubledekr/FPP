# PersonalizeAI Backend

Flask-based API server providing AI-powered newsletter personalization services.

## Features

- **Advanced Personalization Engine** - AI algorithms for content and subject line optimization
- **Revenue Impact Analysis** - Calculate ROI and revenue projections
- **A/B Testing Framework** - Generate and test content variants
- **Email Platform Integration** - Simulate integration with major email platforms
- **Comprehensive Analytics** - Engagement tracking and behavioral analysis

## API Endpoints

### Core Personalization
- `GET /api/subscribers` - List all subscribers with engagement data
- `POST /api/personalize/subject-line` - Generate personalized subject lines
- `POST /api/personalize/content-order` - Optimize content ordering
- `GET /api/dashboard/analytics` - Get dashboard analytics

### Advanced Features
- `GET /api/advanced/revenue-impact/{subscriber_id}` - Individual revenue analysis
- `GET /api/advanced/revenue-impact/aggregate` - Aggregate revenue analysis
- `POST /api/advanced/ab-test/subject-lines` - Generate A/B test variants
- `GET /api/advanced/optimize-send-time/{subscriber_id}` - Send time optimization
- `POST /api/advanced/predict-content-performance` - Content performance prediction

### Email Platform Integration
- `GET /api/advanced/email-platforms` - List supported platforms
- `POST /api/advanced/email-platform/{platform}/{action}` - Simulate platform actions
- `GET /api/advanced/demo-scenarios` - Get client demo scenarios

## Setup Instructions

### Prerequisites
- Python 3.11+
- pip (Python package manager)

### Installation
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the application
python src/main.py
```

The API will be available at `http://localhost:5001`

### Database Setup
The application uses SQLite for development with automatic table creation. Demo data is seeded automatically on first run.

### Environment Variables
Create a `.env` file in the backend directory:
```bash
FLASK_ENV=development
DATABASE_URL=sqlite:///src/database/app.db
OPENAI_API_KEY=your_openai_api_key_here
```

## Project Structure

```
backend/
├── src/
│   ├── models/
│   │   └── subscriber.py          # Database models
│   ├── services/
│   │   ├── personalization_service.py    # Core AI algorithms
│   │   └── advanced_personalization.py  # Advanced features
│   ├── routes/
│   │   ├── personalization.py     # Core API routes
│   │   └── advanced_features.py   # Advanced API routes
│   ├── database/
│   │   └── app.db                 # SQLite database
│   ├── demo_data_seeder.py        # Demo data generation
│   └── main.py                    # Application entry point
├── requirements.txt               # Python dependencies
└── README.md                     # This file
```

## API Documentation

### Subscriber Model
```json
{
  "id": 1,
  "email": "subscriber@example.com",
  "name": "John Doe",
  "segment": "high_engagement",
  "engagement_score": 85.5,
  "churn_risk": 0.15,
  "preferences": {
    "content_types": ["market_commentary", "stock_analysis"],
    "frequency": "daily"
  }
}
```

### Revenue Impact Response
```json
{
  "subscriber_id": 1,
  "baseline_metrics": {
    "open_rate": 22.0,
    "click_rate": 3.5,
    "avg_revenue_per_subscriber": 1200
  },
  "improvements": {
    "open_rate_improvement": 10.6,
    "click_rate_improvement": 17.7,
    "engagement_score": 35.3
  },
  "revenue_impact": {
    "baseline_annual_revenue": 1200,
    "improved_annual_revenue": 1616.13,
    "annual_revenue_lift": 416.13,
    "roi_percentage": 34.7
  }
}
```

## Development

### Adding New Features
1. Create new service classes in `src/services/`
2. Add API routes in `src/routes/`
3. Register blueprints in `src/main.py`
4. Update this README with new endpoints

### Testing
```bash
# Test API endpoints
curl http://localhost:5001/api/subscribers
curl http://localhost:5001/api/advanced/health
```

## Deployment

### Production Setup
1. Use PostgreSQL instead of SQLite
2. Set environment variables for production
3. Use a WSGI server like Gunicorn
4. Configure reverse proxy (nginx)

### Environment Variables for Production
```bash
FLASK_ENV=production
DATABASE_URL=postgresql://user:password@host:port/database
OPENAI_API_KEY=your_production_api_key
SECRET_KEY=your_secret_key_here
```

### Docker Deployment
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY src/ ./src/
EXPOSE 5001
CMD ["python", "src/main.py"]
```

## License

Proprietary software. All rights reserved.

