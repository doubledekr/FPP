import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import { Users, TrendingUp, Mail, Target, AlertTriangle, CheckCircle, DollarSign, FlaskConical, Zap } from 'lucide-react'
import RevenueImpactAnalysis from './components/RevenueImpactAnalysis'
import ABTestingLab from './components/ABTestingLab'
import EmailPlatformIntegration from './components/EmailPlatformIntegration'
import SalesforceIntegration from './components/SalesforceIntegration'
import './App.css'

// Replit-compatible API URL detection
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('replit.dev') || hostname.includes('repl.co')) {
      // Replit environment - use same domain with port 5001
      return `https://${hostname.replace(/:\d+/, '')}:5001/api`;
    }
  }
  // Fallback for development and other environments
  return import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
};

const API_BASE_URL = getApiBaseUrl();

function App() {
  const [dashboardData, setDashboardData] = useState(null)
  const [subscribers, setSubscribers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardData()
    fetchSubscribers()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/analytics`)
      if (!response.ok) throw new Error('Failed to fetch dashboard data')
      const data = await response.json()
      setDashboardData(data)
    } catch (err) {
      setError(err.message)
    }
  }

  const fetchSubscribers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/subscribers`)
      if (!response.ok) throw new Error('Failed to fetch subscribers')
      const data = await response.json()
      setSubscribers(data.subscribers || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const testPersonalization = async (subscriberId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/personalize/subject-line`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriber_id: subscriberId,
          base_subject: 'Weekly Market Update',
          content_summary: 'Stock analysis, market trends, and investment opportunities'
        })
      })
      
      if (!response.ok) throw new Error('Failed to test personalization')
      const result = await response.json()
      
      alert(`Personalization Test Result:\n\nOriginal: ${result.original_subject}\nPersonalized: ${result.personalized_subject}`)
    } catch (err) {
      alert(`Error: ${err.message}`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading PersonalizeAI Dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

  const segmentData = dashboardData?.segments ? Object.entries(dashboardData.segments).map(([name, value]) => ({
    name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value
  })) : []

  const churnData = dashboardData?.churn_risk_distribution ? [
    { name: 'Low Risk', value: dashboardData.churn_risk_distribution.low, color: '#00C49F' },
    { name: 'Medium Risk', value: dashboardData.churn_risk_distribution.medium, color: '#FFBB28' },
    { name: 'High Risk', value: dashboardData.churn_risk_distribution.high, color: '#FF8042' }
  ] : []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">PersonalizeAI</h1>
              <p className="text-gray-600">AI-Powered Newsletter Personalization Dashboard</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="w-4 h-4 mr-1" />
                System Active
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
            <TabsTrigger value="personalization">Personalization</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="revenue-impact">Revenue Impact</TabsTrigger>
            <TabsTrigger value="ab-testing">A/B Testing</TabsTrigger>
            <TabsTrigger value="email-integration">Email Integration</TabsTrigger>
            <TabsTrigger value="salesforce">Salesforce CRM</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData?.total_subscribers || 0}</div>
                  <p className="text-xs text-muted-foreground">Active newsletter subscribers</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData?.overall_open_rate || 0}%</div>
                  <p className="text-xs text-muted-foreground">Average email open rate</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData?.overall_click_rate || 0}%</div>
                  <p className="text-xs text-muted-foreground">Average click-through rate</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData?.total_events || 0}</div>
                  <p className="text-xs text-muted-foreground">Engagement events tracked</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Engagement Trends</CardTitle>
                  <CardDescription>Daily open and click rates over the last 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dashboardData?.daily_trends || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="open_rate" stroke="#8884d8" strokeWidth={2} name="Open Rate %" />
                      <Line type="monotone" dataKey="click_rate" stroke="#82ca9d" strokeWidth={2} name="Click Rate %" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Subscriber Segments</CardTitle>
                  <CardDescription>Distribution of behavioral segments</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={segmentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {segmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Churn Risk */}
            <Card>
              <CardHeader>
                <CardTitle>Churn Risk Distribution</CardTitle>
                <CardDescription>Subscriber churn risk analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={churnData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscribers Tab */}
          <TabsContent value="subscribers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Subscriber Management</CardTitle>
                <CardDescription>View and manage your newsletter subscribers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subscribers.map((subscriber) => (
                    <div key={subscriber.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium">{subscriber.first_name} {subscriber.last_name}</p>
                            <p className="text-sm text-gray-600">{subscriber.email}</p>
                          </div>
                          <Badge variant={subscriber.subscription_tier === 'premium' ? 'default' : 'secondary'}>
                            {subscriber.subscription_tier}
                          </Badge>
                          <Badge variant="outline">
                            {subscriber.platform_id}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => testPersonalization(subscriber.id)}
                        >
                          Test Personalization
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Personalization Tab */}
          <TabsContent value="personalization" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personalization Features</CardTitle>
                  <CardDescription>AI-powered personalization capabilities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Subject Line Optimization</p>
                      <p className="text-sm text-gray-600">AI-generated personalized subject lines</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Content Ordering</p>
                      <p className="text-sm text-gray-600">Personalized content section ordering</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Churn Prevention</p>
                      <p className="text-sm text-gray-600">Predictive churn risk analysis</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Behavioral Segmentation</p>
                      <p className="text-sm text-gray-600">Automatic subscriber segmentation</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Personalization Impact</CardTitle>
                  <CardDescription>Measured improvements from AI personalization</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Open Rate Improvement</span>
                      <span>+23%</span>
                    </div>
                    <Progress value={23} className="mt-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Click Rate Improvement</span>
                      <span>+31%</span>
                    </div>
                    <Progress value={31} className="mt-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Engagement Score</span>
                      <span>+18%</span>
                    </div>
                    <Progress value={18} className="mt-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Churn Reduction</span>
                      <span>-15%</span>
                    </div>
                    <Progress value={15} className="mt-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Detailed Engagement Analytics</CardTitle>
                  <CardDescription>Comprehensive view of subscriber engagement patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={dashboardData?.daily_trends || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="opens" stroke="#8884d8" strokeWidth={2} name="Opens" />
                      <Line type="monotone" dataKey="clicks" stroke="#82ca9d" strokeWidth={2} name="Clicks" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Insights</CardTitle>
                  <CardDescription>AI-generated insights and recommendations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">High Engagement Segment</p>
                    <p className="text-xs text-blue-700">Premium subscribers show 40% higher engagement rates</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-900">Optimal Send Time</p>
                    <p className="text-xs text-green-700">Best engagement occurs between 9-11 AM</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm font-medium text-yellow-900">Content Preference</p>
                    <p className="text-xs text-yellow-700">Market analysis content performs best</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm font-medium text-purple-900">Personalization ROI</p>
                    <p className="text-xs text-purple-700">25% improvement in overall engagement</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Revenue Impact Tab */}
          <TabsContent value="revenue-impact" className="space-y-6">
            <RevenueImpactAnalysis />
          </TabsContent>

          {/* A/B Testing Tab */}
          <TabsContent value="ab-testing" className="space-y-6">
            <ABTestingLab />
          </TabsContent>

          {/* Email Integration Tab */}
          <TabsContent value="email-integration" className="space-y-6">
            <EmailPlatformIntegration />
          </TabsContent>

          {/* Salesforce CRM Tab */}
          <TabsContent value="salesforce" className="space-y-6">
            <SalesforceIntegration />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default App

