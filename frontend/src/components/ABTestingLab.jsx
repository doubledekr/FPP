import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { FlaskConical, Target, TrendingUp, Users, Copy, RefreshCw } from 'lucide-react'

const API_BASE_URL = 'https://77h9ikcwe13v.manus.space/api'

export default function ABTestingLab() {
  const [subjectLineTest, setSubjectLineTest] = useState({
    baseSubject: '',
    selectedSegments: [],
    variants: null,
    loading: false
  })

  const [contentTest, setContentTest] = useState({
    contentItem: {
      title: '',
      content_type: 'market_commentary',
      tags: []
    },
    targetSegments: [],
    predictions: null,
    loading: false
  })

  const availableSegments = [
    { id: 'high_engagement', label: 'High Engagement', description: 'Highly active subscribers' },
    { id: 'low_engagement', label: 'Low Engagement', description: 'Less active subscribers' },
    { id: 'stock_focused', label: 'Stock Focused', description: 'Interested in individual stocks' },
    { id: 'market_focused', label: 'Market Focused', description: 'Interested in market trends' },
    { id: 'news_focused', label: 'News Focused', description: 'Prefers breaking news content' }
  ]

  const contentTypes = [
    { value: 'market_commentary', label: 'Market Commentary' },
    { value: 'stock_analysis', label: 'Stock Analysis' },
    { value: 'stock_recommendation', label: 'Stock Recommendation' },
    { value: 'economic_analysis', label: 'Economic Analysis' },
    { value: 'news', label: 'News' },
    { value: 'breaking_news', label: 'Breaking News' },
    { value: 'educational', label: 'Educational' }
  ]

  const generateSubjectLineVariants = async () => {
    if (!subjectLineTest.baseSubject || subjectLineTest.selectedSegments.length === 0) {
      alert('Please enter a base subject line and select at least one segment')
      return
    }

    setSubjectLineTest(prev => ({ ...prev, loading: true }))

    try {
      const response = await fetch(`${API_BASE_URL}/advanced/ab-test/subject-lines`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          base_subject: subjectLineTest.baseSubject,
          segments: subjectLineTest.selectedSegments
        })
      })

      if (!response.ok) throw new Error('Failed to generate variants')
      const data = await response.json()
      
      setSubjectLineTest(prev => ({ ...prev, variants: data }))
    } catch (error) {
      alert(`Error: ${error.message}`)
    } finally {
      setSubjectLineTest(prev => ({ ...prev, loading: false }))
    }
  }

  const predictContentPerformance = async () => {
    if (!contentTest.contentItem.title || contentTest.targetSegments.length === 0) {
      alert('Please enter content details and select target segments')
      return
    }

    setContentTest(prev => ({ ...prev, loading: true }))

    try {
      const response = await fetch(`${API_BASE_URL}/advanced/predict-content-performance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content_item: contentTest.contentItem,
          target_segments: contentTest.targetSegments
        })
      })

      if (!response.ok) throw new Error('Failed to predict performance')
      const data = await response.json()
      
      setContentTest(prev => ({ ...prev, predictions: data }))
    } catch (error) {
      alert(`Error: ${error.message}`)
    } finally {
      setContentTest(prev => ({ ...prev, loading: false }))
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const handleSegmentToggle = (segmentId, isSubjectLine = true) => {
    if (isSubjectLine) {
      setSubjectLineTest(prev => ({
        ...prev,
        selectedSegments: prev.selectedSegments.includes(segmentId)
          ? prev.selectedSegments.filter(id => id !== segmentId)
          : [...prev.selectedSegments, segmentId]
      }))
    } else {
      setContentTest(prev => ({
        ...prev,
        targetSegments: prev.targetSegments.includes(segmentId)
          ? prev.targetSegments.filter(id => id !== segmentId)
          : [...prev.targetSegments, segmentId]
      }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <FlaskConical className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold">A/B Testing Lab</h2>
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          Advanced AI Testing
        </Badge>
      </div>

      <Tabs defaultValue="subject-lines" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="subject-lines">Subject Line Testing</TabsTrigger>
          <TabsTrigger value="content-performance">Content Performance</TabsTrigger>
        </TabsList>

        {/* Subject Line Testing */}
        <TabsContent value="subject-lines" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subject Line A/B Test Generator</CardTitle>
              <CardDescription>
                Generate personalized subject line variants for different subscriber segments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="base-subject">Base Subject Line</Label>
                <Input
                  id="base-subject"
                  placeholder="e.g., Weekly Market Update"
                  value={subjectLineTest.baseSubject}
                  onChange={(e) => setSubjectLineTest(prev => ({ ...prev, baseSubject: e.target.value }))}
                />
              </div>

              <div className="space-y-3">
                <Label>Target Segments</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableSegments.map((segment) => (
                    <div key={segment.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={segment.id}
                        checked={subjectLineTest.selectedSegments.includes(segment.id)}
                        onCheckedChange={() => handleSegmentToggle(segment.id, true)}
                      />
                      <div className="flex-1">
                        <Label htmlFor={segment.id} className="font-medium">
                          {segment.label}
                        </Label>
                        <p className="text-xs text-gray-600">{segment.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                onClick={generateSubjectLineVariants}
                disabled={subjectLineTest.loading}
                className="w-full"
              >
                {subjectLineTest.loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating Variants...
                  </>
                ) : (
                  <>
                    <Target className="mr-2 h-4 w-4" />
                    Generate A/B Test Variants
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Subject Line Results */}
          {subjectLineTest.variants && (
            <Card>
              <CardHeader>
                <CardTitle>Generated Variants</CardTitle>
                <CardDescription>
                  A/B test variants optimized for your selected segments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Control */}
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge variant="outline">Control</Badge>
                        <p className="mt-2 font-medium">{subjectLineTest.variants.control}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(subjectLineTest.variants.control)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Variants */}
                  <div className="grid grid-cols-1 gap-3">
                    {Object.entries(subjectLineTest.variants.variants).map(([variantName, variantText]) => (
                      <div key={variantName} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary">
                                {variantName.replace(/_/g, ' ').replace(/v\d+/, '').trim()}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {variantName.match(/v\d+/)?.[0] || 'v1'}
                              </Badge>
                            </div>
                            <p className="mt-2 font-medium">{variantText}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(variantText)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Content Performance Testing */}
        <TabsContent value="content-performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Performance Predictor</CardTitle>
              <CardDescription>
                Predict how your content will perform with different subscriber segments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="content-title">Content Title</Label>
                  <Input
                    id="content-title"
                    placeholder="e.g., Tesla Stock Analysis: Q3 Earnings Preview"
                    value={contentTest.contentItem.title}
                    onChange={(e) => setContentTest(prev => ({
                      ...prev,
                      contentItem: { ...prev.contentItem, title: e.target.value }
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content-type">Content Type</Label>
                  <Select
                    value={contentTest.contentItem.content_type}
                    onValueChange={(value) => setContentTest(prev => ({
                      ...prev,
                      contentItem: { ...prev.contentItem, content_type: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select content type" />
                    </SelectTrigger>
                    <SelectContent>
                      {contentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content-tags">Tags (comma-separated)</Label>
                <Input
                  id="content-tags"
                  placeholder="e.g., tesla, earnings, electric vehicles, stock analysis"
                  value={contentTest.contentItem.tags.join(', ')}
                  onChange={(e) => setContentTest(prev => ({
                    ...prev,
                    contentItem: {
                      ...prev.contentItem,
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                    }
                  }))}
                />
              </div>

              <div className="space-y-3">
                <Label>Target Segments</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableSegments.map((segment) => (
                    <div key={segment.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`content-${segment.id}`}
                        checked={contentTest.targetSegments.includes(segment.id)}
                        onCheckedChange={() => handleSegmentToggle(segment.id, false)}
                      />
                      <div className="flex-1">
                        <Label htmlFor={`content-${segment.id}`} className="font-medium">
                          {segment.label}
                        </Label>
                        <p className="text-xs text-gray-600">{segment.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                onClick={predictContentPerformance}
                disabled={contentTest.loading}
                className="w-full"
              >
                {contentTest.loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Performance...
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Predict Content Performance
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Content Performance Results */}
          {contentTest.predictions && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Predictions</CardTitle>
                <CardDescription>
                  AI-powered engagement predictions for your content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(contentTest.predictions.predictions).map(([segment, prediction]) => (
                    <div key={segment} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold capitalize">
                          {segment.replace(/_/g, ' ')}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={prediction.predicted_engagement > 70 ? 'default' : 
                                   prediction.predicted_engagement > 50 ? 'secondary' : 'outline'}
                          >
                            {prediction.predicted_engagement}% Engagement
                          </Badge>
                          <Badge variant="outline">
                            {prediction.confidence} Confidence
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Base Engagement:</span>
                          <p className="font-medium">{prediction.factors.base_segment_engagement}%</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Content Match:</span>
                          <p className="font-medium">+{prediction.factors.content_type_match}%</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Keyword Relevance:</span>
                          <p className="font-medium">+{prediction.factors.keyword_relevance}%</p>
                        </div>
                      </div>

                      {prediction.recommendations && prediction.recommendations.length > 0 && (
                        <div className="mt-3 p-3 bg-blue-50 rounded">
                          <h5 className="font-medium text-blue-900 mb-2">Recommendations:</h5>
                          <ul className="text-sm text-blue-800 space-y-1">
                            {prediction.recommendations.map((rec, index) => (
                              <li key={index}>• {rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

