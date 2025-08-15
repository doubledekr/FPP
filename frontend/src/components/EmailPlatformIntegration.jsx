import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { 
  Mail, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Zap, 
  Users, 
  Send, 
  BarChart3,
  RefreshCw,
  ExternalLink,
  Shield,
  Clock
} from 'lucide-react'

const API_BASE_URL = 'https://77h9ikcwe13v.manus.space/api'

export default function EmailPlatformIntegration() {
  const [platforms, setPlatforms] = useState(null)
  const [selectedPlatform, setSelectedPlatform] = useState('mailchimp')
  const [integrationStatus, setIntegrationStatus] = useState({})
  const [syncProgress, setSyncProgress] = useState(0)
  const [loading, setLoading] = useState(false)
  const [demoScenarios, setDemoScenarios] = useState(null)

  useEffect(() => {
    fetchSupportedPlatforms()
    fetchDemoScenarios()
  }, [])

  const fetchSupportedPlatforms = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/advanced/email-platforms`)
      if (!response.ok) throw new Error('Failed to fetch platforms')
      const data = await response.json()
      setPlatforms(data)
    } catch (error) {
      console.error('Error fetching platforms:', error)
    }
  }

  const fetchDemoScenarios = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/advanced/demo-scenarios`)
      if (!response.ok) throw new Error('Failed to fetch demo scenarios')
      const data = await response.json()
      setDemoScenarios(data)
    } catch (error) {
      console.error('Error fetching demo scenarios:', error)
    }
  }

  const simulateIntegration = async (platform, action) => {
    setLoading(true)
    setSyncProgress(0)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setSyncProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch(`${API_BASE_URL}/advanced/email-platform/${platform}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          demo_mode: true,
          client_name: 'Porter & Co'
        })
      })

      if (!response.ok) throw new Error('Integration failed')
      const data = await response.json()

      clearInterval(progressInterval)
      setSyncProgress(100)

      setIntegrationStatus(prev => ({
        ...prev,
        [platform]: {
          ...data.response,
          timestamp: data.timestamp,
          status: 'success'
        }
      }))

      setTimeout(() => setSyncProgress(0), 2000)
    } catch (error) {
      console.error('Integration error:', error)
      setIntegrationStatus(prev => ({
        ...prev,
        [platform]: {
          error: error.message,
          status: 'error'
        }
      }))
    } finally {
      setLoading(false)
    }
  }

  const platformIcons = {
    mailchimp: '🐵',
    convertkit: '📧',
    sendgrid: '📨'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600'
      case 'error': return 'text-red-600'
      case 'pending': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />
      default: return <Settings className="h-4 w-4 text-gray-600" />
    }
  }

  if (!platforms || !demoScenarios) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading email platform integrations...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Mail className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Email Platform Integration</h2>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            Live Demo Mode
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-600">Secure OAuth Integration</span>
        </div>
      </div>

      <Tabs defaultValue="platforms" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="platforms">Platform Setup</TabsTrigger>
          <TabsTrigger value="sync">Data Sync</TabsTrigger>
          <TabsTrigger value="scenarios">Demo Scenarios</TabsTrigger>
        </TabsList>

        {/* Platform Setup */}
        <TabsContent value="platforms" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Platform Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Supported Email Platforms</CardTitle>
                <CardDescription>
                  Connect PersonalizeAI with your existing email marketing platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(platforms.supported_platforms).map(([key, platform]) => (
                  <div 
                    key={key}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedPlatform === key ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedPlatform(key)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{platformIcons[key]}</span>
                        <div>
                          <h4 className="font-semibold">{platform.name}</h4>
                          <p className="text-sm text-gray-600">
                            {platform.features.join(', ')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(integrationStatus[key]?.status)}
                        <Badge 
                          variant={platform.integration_status === 'active' ? 'default' : 'secondary'}
                        >
                          {platform.integration_status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Integration Actions */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {platforms.supported_platforms[selectedPlatform]?.name} Integration
                </CardTitle>
                <CardDescription>
                  Simulate integration actions for demonstration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {platforms.supported_platforms[selectedPlatform]?.supported_actions.map((action) => (
                    <Button
                      key={action}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => simulateIntegration(selectedPlatform, action)}
                      disabled={loading}
                    >
                      {loading ? (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Zap className="mr-2 h-4 w-4" />
                      )}
                      {action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Button>
                  ))}
                </div>

                {syncProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Integration Progress</span>
                      <span>{syncProgress}%</span>
                    </div>
                    <Progress value={syncProgress} className="w-full" />
                  </div>
                )}

                {integrationStatus[selectedPlatform] && (
                  <div className="mt-4 p-3 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      {getStatusIcon(integrationStatus[selectedPlatform].status)}
                      <span className={`font-medium ${getStatusColor(integrationStatus[selectedPlatform].status)}`}>
                        Integration {integrationStatus[selectedPlatform].status === 'success' ? 'Successful' : 'Failed'}
                      </span>
                    </div>
                    {integrationStatus[selectedPlatform].status === 'success' && (
                      <div className="text-sm space-y-1">
                        <p><strong>Lists Found:</strong> {integrationStatus[selectedPlatform].lists_count || 'N/A'}</p>
                        <p><strong>Subscribers:</strong> {integrationStatus[selectedPlatform].subscribers_count || 'N/A'}</p>
                        <p><strong>Last Sync:</strong> {new Date(integrationStatus[selectedPlatform].timestamp).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Integration Capabilities */}
          <Card>
            <CardHeader>
              <CardTitle>PersonalizeAI Integration Capabilities</CardTitle>
              <CardDescription>
                What PersonalizeAI can do with your email platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {platforms.integration_capabilities.map((capability, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">{capability}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Sync */}
        <TabsContent value="sync" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Subscriber Data Sync</CardTitle>
                <CardDescription>
                  Real-time synchronization with your email platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>Subscriber Import</span>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4" />
                      <span>Engagement Tracking</span>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-2">
                      <Send className="h-4 w-4" />
                      <span>Campaign Optimization</span>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                </div>

                <Button 
                  className="w-full"
                  onClick={() => simulateIntegration(selectedPlatform, 'sync_subscribers')}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Start Full Sync
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sync Statistics</CardTitle>
                <CardDescription>
                  Current synchronization status and metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 border rounded">
                      <div className="text-2xl font-bold text-blue-600">1,247</div>
                      <div className="text-sm text-gray-600">Subscribers Synced</div>
                    </div>
                    <div className="text-center p-3 border rounded">
                      <div className="text-2xl font-bold text-green-600">98.5%</div>
                      <div className="text-sm text-gray-600">Sync Success Rate</div>
                    </div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-lg font-semibold">Last Sync</div>
                    <div className="text-sm text-gray-600">2 minutes ago</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Demo Scenarios */}
        <TabsContent value="scenarios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Demo Scenarios</CardTitle>
              <CardDescription>
                Pre-configured scenarios for client presentations and ROI demonstrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {Object.entries(demoScenarios.demo_scenarios).map(([key, scenario]) => (
                  <Card key={key} className="border-2 hover:border-blue-300 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-lg">{scenario.name}</CardTitle>
                      <CardDescription>{scenario.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Subscribers:</span>
                          <p className="font-semibold">{scenario.metrics.current_subscribers.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Timeline:</span>
                          <p className="font-semibold">{scenario.timeline}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Open Rate:</span>
                          <span>
                            {scenario.metrics.current_open_rate}% → 
                            <span className="text-green-600 font-semibold ml-1">
                              {scenario.metrics.projected_open_rate}%
                            </span>
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Click Rate:</span>
                          <span>
                            {scenario.metrics.current_click_rate}% → 
                            <span className="text-green-600 font-semibold ml-1">
                              {scenario.metrics.projected_click_rate}%
                            </span>
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Revenue Lift:</span>
                          <span className="text-lg font-bold text-green-600">
                            ${scenario.metrics.projected_revenue_lift.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm font-medium">ROI:</span>
                          <Badge variant="default" className="bg-green-600">
                            {scenario.roi}
                          </Badge>
                        </div>
                      </div>

                      <Button variant="outline" className="w-full" size="sm">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Use This Scenario
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usage Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">1</div>
                  <p><strong>Client Presentation:</strong> {demoScenarios.usage_instructions.client_presentation}</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">2</div>
                  <p><strong>Customization:</strong> {demoScenarios.usage_instructions.customization}</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">3</div>
                  <p><strong>Confidence Level:</strong> {demoScenarios.usage_instructions.confidence_level}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

