# PersonalizeAI Frontend Dashboard

Professional React-based dashboard for the PersonalizeAI newsletter personalization platform.

## Features

### Dashboard Tabs
1. **Overview** - Key metrics and engagement trends
2. **Subscribers** - Subscriber management with personalization testing
3. **Personalization** - AI features and impact metrics
4. **Analytics** - Detailed engagement analytics and insights
5. **Revenue Impact** - ROI analysis and revenue projections
6. **A/B Testing Lab** - Subject line and content performance testing
7. **Email Integration** - Platform integration and sync management

### Key Components
- **Real-time Analytics** - Interactive charts and metrics
- **Subscriber Segmentation** - Visual representation of behavioral segments
- **A/B Testing Tools** - Generate and test content variants
- **Revenue Calculator** - ROI projections and impact analysis
- **Integration Simulator** - Email platform connection demos

## Technology Stack

- **React 18** - Modern React with hooks and functional components
- **Tailwind CSS** - Utility-first CSS framework for responsive design
- **shadcn/ui** - High-quality component library
- **Lucide Icons** - Beautiful, customizable icons
- **Recharts** - Composable charting library for React
- **Vite** - Fast build tool and development server

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm/pnpm
- Backend API running on `http://localhost:5001`

### Installation
```bash
# Install dependencies
npm install
# or
pnpm install

# Start development server
npm run dev
# or
pnpm dev
```

The dashboard will be available at `http://localhost:5173`

### Build for Production
```bash
# Create production build
npm run build
# or
pnpm build

# Preview production build
npm run preview
# or
pnpm preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── RevenueImpactAnalysis.jsx
│   │   ├── ABTestingLab.jsx
│   │   └── EmailPlatformIntegration.jsx
│   ├── App.jsx                    # Main application component
│   ├── main.jsx                   # Application entry point
│   └── App.css                    # Global styles
├── public/                        # Static assets
├── index.html                     # HTML template
├── package.json                   # Dependencies and scripts
├── tailwind.config.js             # Tailwind CSS configuration
├── vite.config.js                 # Vite configuration
└── README.md                      # This file
```

## Component Overview

### App.jsx
Main application component containing:
- Tab navigation system
- State management for all dashboard data
- API integration with backend
- Responsive layout and design

### RevenueImpactAnalysis.jsx
- Individual subscriber revenue analysis
- Aggregate revenue projections
- ROI calculations and visualizations
- Conservative vs. aggressive growth scenarios

### ABTestingLab.jsx
- Subject line A/B test generator
- Content performance prediction
- Segment-specific optimization
- Copy-to-clipboard functionality

### EmailPlatformIntegration.jsx
- Multi-platform integration simulation
- Real-time sync progress tracking
- Demo scenarios for client presentations
- OAuth integration demonstration

## API Integration

The frontend communicates with the Flask backend via REST API:

```javascript
const API_BASE_URL = 'http://localhost:5001/api'

// Example API calls
const fetchSubscribers = async () => {
  const response = await fetch(`${API_BASE_URL}/subscribers`)
  return response.json()
}

const generateSubjectLines = async (data) => {
  const response = await fetch(`${API_BASE_URL}/advanced/ab-test/subject-lines`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return response.json()
}
```

## Styling and Design

### Tailwind CSS Classes
The application uses Tailwind CSS for styling with a professional color scheme:
- Primary: Blue (`blue-600`, `blue-50`)
- Success: Green (`green-600`, `green-50`)
- Warning: Yellow (`yellow-600`, `yellow-50`)
- Error: Red (`red-600`, `red-50`)

### Responsive Design
- Mobile-first approach
- Responsive grid layouts
- Adaptive navigation
- Touch-friendly interactions

### Component Library
shadcn/ui components provide:
- Consistent design system
- Accessibility features
- Professional appearance
- Easy customization

## Development

### Adding New Components
1. Create component in `src/components/`
2. Import and use in `App.jsx`
3. Add to tab navigation if needed
4. Update API integration as required

### Customizing Styles
1. Modify `tailwind.config.js` for theme changes
2. Update component classes for styling
3. Add custom CSS in `App.css` if needed

### Environment Configuration
Create `.env` file for environment variables:
```bash
VITE_API_BASE_URL=http://localhost:5001/api
VITE_APP_NAME=PersonalizeAI Dashboard
```

## Deployment

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
VITE_API_BASE_URL=https://your-api-domain.com/api
```

### Netlify Deployment
```bash
# Build the project
npm run build

# Deploy dist/ folder to Netlify
# Set environment variables in Netlify dashboard
```

### Manual Deployment
```bash
# Build for production
npm run build

# Upload dist/ folder to your hosting provider
# Configure environment variables
```

## Performance Optimization

### Code Splitting
- Components are loaded on-demand
- Lazy loading for heavy components
- Tree shaking for unused code

### Asset Optimization
- Image optimization with Vite
- CSS purging with Tailwind
- Bundle size optimization

### Caching Strategy
- API response caching
- Static asset caching
- Service worker for offline support

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

Proprietary software. All rights reserved.

