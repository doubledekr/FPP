import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  TrendingUp, 
  Users, 
  DollarSign,
  Target,
  Clock,
  Settings,
  Database,
  BarChart3,
  Zap
} from 'lucide-react';

const SalesforceIntegration = () => {
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [demoScenarios, setDemoScenarios] = useState(null);

  useEffect(() => {
    fetchSalesforceData();
  }, []);

  const fetchSalesforceData = async () => {
    try {
      setLoading(true);
      
      // Fetch connection status
      const statusResponse = await fetch('https://77h9ikcwe13v.manus.space/api/salesforce/connection/status');
      const statusData = await statusResponse.json();
      setConnectionStatus(statusData.connection);

      // Fetch dashboard data
      const dashboardResponse = await fetch('https://77h9ikcwe13v.manus.space/api/salesforce/dashboard/data');
      const dashboardResult = await dashboardResponse.json();
      setDashboardData(dashboardResult.dashboard_data);

      // Fetch demo scenarios
      const scenariosResponse = await fetch('https://77h9ikcwe13v.manus.space/api/salesforce/demo/scenarios');
      const scenariosResult = await scenariosResponse.json();
      setDemoScenarios(scenariosResult.demo_scenarios);

    } catch (error) {
      console.error('Error fetching Salesforce data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSync = async () => {
    try {
      setSyncing(true);
      const response = await fetch('https://77h9ikcwe13v.manus.space/api/salesforce/sync/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriber_ids: [1, 2, 3, 4, 5, 6, 7, 8] })
      });
      
      const result = await response.json();
      if (result.status === 'success') {
        await fetchSalesforceData(); // Refresh data
      }
    } catch (error) {
      console.error('Error syncing:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleCreateOpportunity = async (subscriberId) => {
    try {
      const response = await fetch('https://77h9ikcwe13v.manus.space/api/salesforce/opportunities/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriber_id: subscriberId })
      });
      
      const result = await response.json();
      if (result.status === 'success') {
        await fetchSalesforceData(); // Refresh data
      }
    } catch (error) {
      console.error('Error creating opportunity:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading Salesforce integration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Salesforce Connection
          </CardTitle>
          <CardDescription>
            CRM integration status and configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {connectionStatus?.connected ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              <div>
                <p className="font-medium">
                  {connectionStatus?.connected ? 'Connected' : 'Disconnected'}
                </p>
                <p className="text-sm text-gray-500">
                  {connectionStatus?.instance_url}
                </p>
              </div>
            </div>
            <Badge variant={connectionStatus?.connected ? 'default' : 'destructive'}>
              {connectionStatus?.sync_status || 'Inactive'}
            </Badge>
          </div>
          
          {connectionStatus?.demo_mode && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Demo Mode: Using simulated Salesforce data for demonstration purposes
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sync">Sync Status</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="scenarios">Demo Scenarios</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Contacts</p>
                    <p className="text-2xl font-bold">{dashboardData?.sync_statistics?.total_contacts || 0}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pipeline Value</p>
                    <p className="text-2xl font-bold">${(dashboardData?.performance_metrics?.total_pipeline_value || 0).toLocaleString()}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Opportunities</p>
                    <p className="text-2xl font-bold">{dashboardData?.performance_metrics?.opportunities_created || 0}</p>
                  </div>
                  <Target className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Conversion Rate</p>
                    <p className="text-2xl font-bold">{dashboardData?.performance_metrics?.conversion_rate || 0}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Field Mappings */}
          <Card>
            <CardHeader>
              <CardTitle>Field Mappings</CardTitle>
              <CardDescription>
                PersonalizeAI data fields mapped to Salesforce custom fields
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData?.field_mappings?.map((mapping, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{mapping.personalize_field}</Badge>
                      <span className="text-gray-400">→</span>
                      <Badge variant="secondary">{mapping.salesforce_field}</Badge>
                    </div>
                    <Badge variant={mapping.status === 'mapped' ? 'default' : 'destructive'}>
                      {mapping.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sync Status Tab */}
        <TabsContent value="sync" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Synchronization Status
                <Button 
                  onClick={handleBulkSync} 
                  disabled={syncing}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Syncing...' : 'Sync Now'}
                </Button>
              </CardTitle>
              <CardDescription>
                Recent synchronization activity and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {dashboardData?.sync_statistics?.synced_today || 0}
                    </p>
                    <p className="text-sm text-gray-600">Synced Today</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {dashboardData?.sync_statistics?.sync_success_rate || 0}%
                    </p>
                    <p className="text-sm text-gray-600">Success Rate</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      {dashboardData?.sync_statistics?.average_lead_score || 0}
                    </p>
                    <p className="text-sm text-gray-600">Avg Lead Score</p>
                  </div>
                </div>

                {/* Recent Syncs */}
                <div>
                  <h4 className="font-medium mb-3">Recent Synchronizations</h4>
                  <div className="space-y-2">
                    {dashboardData?.recent_syncs?.map((sync, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="font-medium">{sync.contact_name}</p>
                            <p className="text-sm text-gray-500">{sync.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">Score: {sync.lead_score}</p>
                          <p className="text-sm text-gray-500">
                            {sync.opportunity_created ? 'Opportunity Created' : 'Contact Updated'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Opportunities Tab */}
        <TabsContent value="opportunities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Opportunity Management</CardTitle>
              <CardDescription>
                Salesforce opportunities created from newsletter engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Create Opportunity Demo */}
                <div className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">High-Engagement Subscriber</h4>
                    <Button 
                      onClick={() => handleCreateOpportunity(1)}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Zap className="h-4 w-4" />
                      Create Opportunity
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Engagement Score</p>
                      <p className="font-medium">87.3%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Estimated Value</p>
                      <p className="font-medium">$18,500</p>
                    </div>
                  </div>
                </div>

                {/* Recent Opportunities */}
                <div>
                  <h4 className="font-medium mb-3">Recent Opportunities</h4>
                  <div className="space-y-3">
                    {dashboardData?.recent_opportunities?.map((opp, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{opp.name}</p>
                          <p className="text-sm text-gray-500">Stage: {opp.stage}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${opp.amount.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(opp.created_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Salesforce Integration Analytics
              </CardTitle>
              <CardDescription>
                Performance metrics and ROI analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Top Performing Segments */}
                <div>
                  <h4 className="font-medium mb-3">Top Performing Segments</h4>
                  <div className="space-y-3">
                    {dashboardData?.top_segments?.map((segment, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium capitalize">{segment.segment.replace('_', ' ')}</h5>
                          <Badge>{segment.opportunity_rate}% conversion</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Average Lead Score</p>
                            <p className="font-medium">{segment.avg_lead_score}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Opportunity Rate</p>
                            <Progress value={segment.opportunity_rate * 20} className="mt-1" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ROI Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">Lead Score Improvement</h4>
                      <p className="text-2xl font-bold text-green-600">
                        +{dashboardData?.performance_metrics?.average_lead_score_improvement || 0}%
                      </p>
                      <p className="text-sm text-gray-500">Average improvement per contact</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">Pipeline Impact</h4>
                      <p className="text-2xl font-bold text-blue-600">
                        ${(dashboardData?.performance_metrics?.total_pipeline_value || 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">Total pipeline value generated</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Demo Scenarios Tab */}
        <TabsContent value="scenarios" className="space-y-4">
          <div className="grid gap-6">
            {demoScenarios && Object.entries(demoScenarios).map(([key, scenario]) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle>{scenario.name}</CardTitle>
                  <CardDescription>{scenario.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Metrics */}
                    <div>
                      <h4 className="font-medium mb-3">Key Metrics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Newsletter Subscribers:</span>
                          <span className="font-medium">{scenario.metrics.newsletter_subscribers.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Salesforce Contacts:</span>
                          <span className="font-medium">{scenario.metrics.salesforce_contacts.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Monthly Opportunities:</span>
                          <span className="font-medium">{scenario.metrics.new_opportunities_monthly}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Avg Opportunity Value:</span>
                          <span className="font-medium">${scenario.metrics.average_opportunity_value.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Lead Score Improvement:</span>
                          <span className="font-medium text-green-600">+{scenario.metrics.lead_score_improvement}%</span>
                        </div>
                      </div>
                    </div>

                    {/* ROI */}
                    <div>
                      <h4 className="font-medium mb-3">ROI Analysis</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Setup Cost:</span>
                          <span className="font-medium">${scenario.roi.setup_cost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Monthly Cost:</span>
                          <span className="font-medium">${scenario.roi.monthly_cost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Annual Pipeline:</span>
                          <span className="font-medium text-blue-600">${scenario.roi.annual_pipeline_value.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Annual Closed:</span>
                          <span className="font-medium text-green-600">${scenario.roi.annual_closed_value.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-medium">ROI:</span>
                          <span className="font-bold text-green-600">{scenario.roi.roi_percentage}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Payback Period:</span>
                          <span className="font-medium">{scenario.roi.payback_months} months</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SalesforceIntegration;

