import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { DollarSign, TrendingUp, Users, Target } from 'lucide-react'

const API_BASE_URL = 'https://77h9ikcwe13v.manus.space/api'

export default function RevenueImpactAnalysis() {
  const [aggregateData, setAggregateData] = useState(null)
  const [selectedSubscriber, setSelectedSubscriber] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAggregateData()
  }, [])

  const fetchAggregateData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/advanced/revenue-impact/aggregate`)
      if (!response.ok) throw new Error('Failed to fetch revenue data')
      const data = await response.json()
      setAggregateData(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubscriberImpact = async (subscriberId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/advanced/revenue-impact/${subscriberId}`)
      if (!response.ok) throw new Error('Failed to fetch subscriber data')
      const data = await response.json()
      setSelectedSubscriber(data)
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading revenue analysis...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-600">Error: {error}</p>
            <Button onClick={fetchAggregateData} className="mt-4">Retry</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

  // Prepare chart data
  const revenueComparisonData = aggregateData ? [
    {
      name: 'Baseline Revenue',
      value: aggregateData.total_baseline_revenue,
      color: '#8884d8'
    },
    {
      name: 'Improved Revenue',
      value: aggregateData.total_improved_revenue,
      color: '#00C49F'
    }
  ] : []

  const subscriberImpactData = aggregateData?.subscriber_impacts?.map((impact, index) => ({
    name: `Subscriber ${impact.subscriber_id}`,
    baseline: impact.revenue_impact.baseline_annual_revenue,
    improved: impact.revenue_impact.improved_annual_revenue,
    lift: impact.revenue_impact.annual_revenue_lift,
    roi: impact.revenue_impact.roi_percentage
  })) || []

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue Lift</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${aggregateData?.total_revenue_lift?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">Annual additional revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average ROI</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {aggregateData?.average_roi_percentage || 0}%
            </div>
            <p className="text-xs text-muted-foreground">Return on investment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analyzed Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {aggregateData?.total_subscribers || 0}
            </div>
            <p className="text-xs text-muted-foreground">Total subscriber base</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Improvement</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {aggregateData ? 
                Math.round(((aggregateData.total_improved_revenue - aggregateData.total_baseline_revenue) / aggregateData.total_baseline_revenue) * 100) 
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Overall improvement</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Comparison</CardTitle>
            <CardDescription>Baseline vs. Improved Revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Individual Subscriber Impact</CardTitle>
            <CardDescription>Revenue lift per subscriber</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subscriberImpactData.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue Lift']} />
                <Bar dataKey="lift" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Subscriber Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Subscriber Analysis</CardTitle>
          <CardDescription>Click on a subscriber to view detailed revenue impact</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aggregateData?.subscriber_impacts?.map((impact) => (
              <div 
                key={impact.subscriber_id} 
                className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                onClick={() => fetchSubscriberImpact(impact.subscriber_id)}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-medium">Subscriber {impact.subscriber_id}</p>
                      <p className="text-sm text-gray-600">
                        Revenue Lift: ${impact.revenue_impact.annual_revenue_lift.toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={impact.revenue_impact.roi_percentage > 30 ? 'default' : 'secondary'}>
                      {impact.revenue_impact.roi_percentage}% ROI
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    ${impact.revenue_impact.baseline_annual_revenue.toLocaleString()} → 
                    ${impact.revenue_impact.improved_annual_revenue.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Subscriber Details */}
      {selectedSubscriber && (
        <Card>
          <CardHeader>
            <CardTitle>Subscriber {selectedSubscriber.subscriber_id} - Detailed Analysis</CardTitle>
            <CardDescription>Comprehensive revenue impact breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold">Baseline Metrics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Open Rate:</span>
                    <span>{selectedSubscriber.baseline_metrics.open_rate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Click Rate:</span>
                    <span>{selectedSubscriber.baseline_metrics.click_rate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Annual Revenue:</span>
                    <span>${selectedSubscriber.baseline_metrics.avg_revenue_per_subscriber.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Projected Improvements</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Open Rate Improvement</span>
                      <span>+{selectedSubscriber.improvements.open_rate_improvement}%</span>
                    </div>
                    <Progress value={selectedSubscriber.improvements.open_rate_improvement} className="mt-1" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Click Rate Improvement</span>
                      <span>+{selectedSubscriber.improvements.click_rate_improvement}%</span>
                    </div>
                    <Progress value={selectedSubscriber.improvements.click_rate_improvement} className="mt-1" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Churn Reduction</span>
                      <span>-{selectedSubscriber.improvements.churn_reduction}%</span>
                    </div>
                    <Progress value={selectedSubscriber.improvements.churn_reduction} className="mt-1" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900">Revenue Impact Summary</h4>
              <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-green-700">Annual Revenue Lift:</span>
                  <p className="font-bold text-green-900">
                    ${selectedSubscriber.revenue_impact.annual_revenue_lift.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-green-700">ROI Percentage:</span>
                  <p className="font-bold text-green-900">
                    {selectedSubscriber.revenue_impact.roi_percentage}%
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

