"use client";
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  BatteryFull, 
  Calendar, 
  ArrowLeft, 
  Loader2, 
  Activity, 
  BedDouble, 
  Clock,
  AlertTriangle,
  Moon,
  Coffee
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useRouter } from 'next/navigation';
import axios from 'axios'; // Make sure to install axios

interface Sleep {
  id: string;
  dailyLogId: string;
  finalScore: number;
  quality: number;
  duration: number;
  consistency: number;
  environment: number;
  habits: number;
  dailyRecommendations?: string[];
  date: string;
}

interface Assessment {
  date: string;
  score: number;
  categories: {[key: string]: number};
  responses?: Record<number, string>;
  questions?: string[];
  analysis?: string;
  insights?: string[];
}

const SleepAnalysisDetails = () => {
  const router = useRouter();
  const [sleepData, setSleepData] = useState<Sleep[]>([]);
  const [assessmentHistory, setAssessmentHistory] = useState<Assessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch sleep data from backend API
    const fetchSleepData = async () => {
      try {
        setLoading(true);
        
        // Get last 30 days of sleep data
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const startDate = thirtyDaysAgo.toISOString().split('T')[0];
        const endDate = new Date().toISOString().split('T')[0];
        
        const response = await axios.get('http://localhost:3001'+`/api/sleep`,{withCredentials:true});
        
        if (response.data && response.data.sleep) {
          const sleepEntries = response.data.sleep;
          setSleepData(sleepEntries);
          
          // Convert sleep data to assessment format
          const assessments = sleepEntries.map((sleep: Sleep) => convertToAssessment(sleep));
          setAssessmentHistory(assessments.sort((a: { date: string | number | Date; }, b: { date: string | number | Date; }) => new Date(b.date).getTime() - new Date(a.date).getTime()));
          
          // Set the most recent assessment as selected
          if (assessments.length > 0) {
            setSelectedAssessment(assessments[0]);
          }
        } else {
          // If no data exists, we'll show empty state
          setAssessmentHistory([]);
          setSelectedAssessment(null);
        }
      } catch (err) {
        console.error("Error loading sleep data:", err);
        setError("Failed to fetch sleep data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSleepData();
  }, []);

  // Convert sleep data to assessment format
  const convertToAssessment = (sleep: Sleep): Assessment => {
    return {
      date: sleep.date,
      score: sleep.finalScore,
      categories: {
        "Quality": sleep.quality,
        "Duration": sleep.duration,
        "Consistency": sleep.consistency,
        "Environment": sleep.environment,
        "Habits": sleep.habits
      },
      analysis: "Your sleep patterns show varying quality with some room for improvement. Consider following the recommendations to improve your sleep health.",
      insights: sleep.dailyRecommendations || [
        "Dim lights 1 hour before bedtime",
        "Keep bedroom temperature between 60-67°F",
        "Avoid caffeine after 2pm"
      ],
      // These would come from a separate assessment API in a real application
      questions: [
        "How many hours did you sleep last night?",
        "How long did it take you to fall asleep last night?",
        "Did you wake up during the night?",
        "How did you feel when you woke up this morning?",
        "Did you use electronic devices before sleeping?"
      ],
      responses: {
        0: "7-8 hours (optimal sleep duration)",
        1: "15-30 minutes (slightly delayed)",
        2: "Once briefly (minimal disruption)",
        3: "Somewhat tired (incomplete recovery)",
        4: "30-60 minutes (significant exposure)"
      }
    };
  };

  // Fetch specific sleep entry details
  const fetchSleepDetails = async (id: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/sleep/${id}`);
      
      if (response.data && response.data.sleep) {
        const sleep = response.data.sleep;
        const assessment = convertToAssessment(sleep);
        setSelectedAssessment(assessment);
      }
    } catch (err) {
      console.error("Error fetching sleep details:", err);
      setError("Failed to fetch sleep details. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Get icon based on sleep score
  const getSleepIcon = (score: number) => {
    if (score >= 80) return <BatteryFull className="w-5 h-5 text-blue-500" />;
    if (score >= 65) return <BedDouble className="w-5 h-5 text-blue-500" />;
    if (score >= 50) return <Clock className="w-5 h-5 text-yellow-500" />;
    return <AlertTriangle className="w-5 h-5 text-red-500" />;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get color for category score
  const getCategoryColor = (score: number): string => {
    if (score >= 80) return 'text-blue-500';
    if (score >= 65) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Get background color for progress bar
  const getProgressColor = (score: number): string => {
    if (score >= 80) return 'bg-blue-500';
    if (score >= 65) return 'bg-blue-600';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Get sleep quality label based on score
  const getSleepQualityLabel = (score: number): string => {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Fair";
    return "Needs improvement";
  };

  // Prepare trend data for charts
  const prepareTrendData = () => {
    return assessmentHistory.slice(0, 10).reverse().map(assessment => {
      const date = new Date(assessment.date);
      return {
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        score: assessment.score,
        ...assessment.categories
      };
    });
  };

  // Prepare pie data for selected assessment
  const preparePieData = () => {
    if (!selectedAssessment) return [];
    
    return Object.entries(selectedAssessment.categories).map(([category, value]) => ({
      name: category,
      value,
      color: value >= 80 ? '#3b82f6' : value >= 65 ? '#2563eb' : value >= 50 ? '#eab308' : '#ef4444'
    }));
  };

  // Navigate back to dashboard
  const goBack = () => {
    router.push('/');
  };

  // Handle selecting an assessment from history
  const handleSelectAssessment = (assessment: Assessment) => {
    // Find the sleep entry ID for this assessment
    const sleepEntry = sleepData.find(sleep => 
      new Date(sleep.date).toISOString() === new Date(assessment.date).toISOString()
    );
    
    if (sleepEntry && sleepEntry.id) {
      fetchSleepDetails(sleepEntry.id);
    } else {
      setSelectedAssessment(assessment);
    }
  };

  // Group assessments by date
  const groupAssessmentsByDate = () => {
    const grouped: { [key: string]: Assessment[] } = {};
    
    assessmentHistory.forEach(assessment => {
      const date = new Date(assessment.date).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(assessment);
    });
    
    return grouped;
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button variant="outline" onClick={goBack} className="mr-4 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Sleep Analysis Dashboard</h1>
            <p className="text-gray-600">Detailed insights and historical trends of your sleep patterns</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <Card className="border shadow-lg rounded-xl overflow-hidden">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-4 p-4 rounded-full bg-red-50 inline-block">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Error</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700 text-white">
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : assessmentHistory.length === 0 ? (
          <Card className="border shadow-lg rounded-xl overflow-hidden">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-4 p-4 rounded-full bg-blue-50 inline-block">
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Sleep Data</h3>
              <p className="text-gray-600 mb-6">Track your sleep to see detailed analytics and trends.</p>
              <Button onClick={goBack} className="bg-blue-600 hover:bg-blue-700 text-white">
                Go Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Assessment history */}
            <div className="lg:col-span-1">
              <Card className="border shadow-lg rounded-xl overflow-hidden h-full">
                <CardHeader className="p-4 bg-blue-50 border-b border-blue-100">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    <h2 className="text-lg font-semibold text-gray-900">Sleep History</h2>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[calc(100vh-280px)]">
                    <div className="divide-y divide-gray-200">
                      {Object.entries(groupAssessmentsByDate()).map(([date, assessments]) => (
                        <div key={date} className="p-0">
                          <div className="p-3 bg-blue-50/50">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-600">{new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                              <span className="text-sm text-blue-600">{assessments.length} check-in{assessments.length !== 1 ? 's' : ''}</span>
                            </div>
                          </div>
                          
                          {assessments.map((assessment, assessmentIndex) => (
                            <div 
                              key={assessmentIndex}
                              onClick={() => handleSelectAssessment(assessment)}
                              className={`p-4 cursor-pointer hover:bg-blue-50/50 transition-colors ${
                                selectedAssessment && selectedAssessment.date === assessment.date ? 'bg-blue-100' : ''
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="p-2 bg-blue-100 rounded-full">
                                    {getSleepIcon(assessment.score)}
                                  </div>
                                  <div>
                                    <div className="flex items-center space-x-2">
                                      <Badge className="bg-blue-100 text-blue-800 border border-blue-200 text-xs">
                                        {getSleepQualityLabel(assessment.score)}
                                      </Badge>
                                      <span className="font-medium text-gray-900">{assessment.score}</span>
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1">{formatDate(assessment.date)}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Right column - Analysis content */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full bg-white border-b rounded-t-xl p-0">
                  <TabsTrigger value="overview" className="flex-1 py-3 rounded-none data-[state=active]:bg-blue-50">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="trends" className="flex-1 py-3 rounded-none data-[state=active]:bg-blue-50">
                    Trends
                  </TabsTrigger>
                  <TabsTrigger value="details" className="flex-1 py-3 rounded-none data-[state=active]:bg-blue-50">
                    Details
                  </TabsTrigger>
                </TabsList>
                
                {selectedAssessment ? (
                  <>
                    {/* Overview Tab */}
                    <TabsContent value="overview" className="mt-4 space-y-4">
                      <Card className="border shadow-lg rounded-xl overflow-hidden">
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">Sleep Score</h3>
                              <p className="text-sm text-gray-600">{formatDate(selectedAssessment.date)}</p>
                            </div>
                            <div className="flex items-center">
                              <span className="text-3xl font-bold text-gray-900 mr-2">{selectedAssessment.score}</span>
                              <Badge className="bg-blue-100 text-blue-800 border border-blue-200">
                                {getSleepQualityLabel(selectedAssessment.score)}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="bg-blue-50/50 p-4 rounded-lg mb-6">
                            <div className="flex items-center mb-2">
                              <Badge className="mr-2 bg-blue-100 text-blue-800 border border-blue-200">
                                Sleep Check-in
                              </Badge>
                              <span className="text-sm text-gray-600">{formatDate(selectedAssessment.date)}</span>
                            </div>
                            
                            {selectedAssessment.analysis && (
                              <p className="text-sm text-gray-700 mt-2">{selectedAssessment.analysis}</p>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-medium text-gray-700 mb-3">Category Breakdown</h4>
                              <div className="space-y-3">
                                {Object.entries(selectedAssessment.categories).map(([category, score]) => (
                                  <div key={category} className="space-y-1">
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm text-gray-700">{category}</span>
                                      <span className={`text-sm font-medium ${getCategoryColor(score)}`}>{score}/100</span>
                                    </div>
                                    <Progress value={score} className="h-2 bg-gray-200">
                                      <div className={`h-full ${getProgressColor(score)}`} style={{width: `${score}%`}}></div>
                                    </Progress>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-gray-700 mb-3">Distribution</h4>
                              <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                    <Pie
                                      data={preparePieData()}
                                      cx="50%"
                                      cy="50%"
                                      labelLine={false}
                                      outerRadius={80}
                                      fill="#8884d8"
                                      dataKey="value"
                                      label={({ name, value }) => `${name}: ${value}`}
                                    >
                                      {preparePieData().map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                      ))}
                                    </Pie>
                                    <Tooltip />
                                  </PieChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          </div>
                          
                          {/* Show AI Generated Recommendations if available */}
                          {selectedAssessment.insights && selectedAssessment.insights.length > 0 && (
                            <div className="mt-6">
                              <h4 className="font-medium text-gray-700 mb-3">Recommended Actions</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {selectedAssessment.insights.slice(0, 3).map((insight, index) => (
                                  <div key={index} className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                    <div className="flex-shrink-0 bg-blue-100 p-2 rounded-full mb-2">
                                      {index === 0 ? <Moon className="h-4 w-4 text-blue-500" /> : 
                                       index === 1 ? <BedDouble className="h-4 w-4 text-blue-500" /> :
                                       <Coffee className="h-4 w-4 text-blue-500" />}
                                    </div>
                                    <p className="text-sm text-gray-700">{insight}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Trends Tab */}
                    <TabsContent value="trends" className="mt-4 space-y-4">
                      <Card className="border shadow-lg rounded-xl overflow-hidden">
                        <CardContent className="p-5">
                          <h3 className="text-xl font-bold text-gray-900 mb-4">Sleep Score Trends</h3>
                          
                          <div className="h-72 mb-6">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={prepareTrendData()} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                                <XAxis dataKey="date" stroke="#666" />
                                <YAxis domain={[0, 100]} stroke="#666" />
                                <Tooltip contentStyle={{ backgroundColor: '#eee', borderColor: '#999' }} />
                                <Legend />
                                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} name="Overall Score" />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                          
                          <Separator className="my-6 bg-gray-200" />
                          
                          <h3 className="text-xl font-bold text-gray-900 mb-4">Category Trends</h3>
                          
                          <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={prepareTrendData()} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                                <XAxis dataKey="date" stroke="#666" />
                                <YAxis domain={[0, 100]} stroke="#666" />
                                <Tooltip contentStyle={{ backgroundColor: '#eee', borderColor: '#999' }} />
                                <Legend />
                                <Line type="monotone" dataKey="Quality" stroke="#3b82f6" strokeWidth={2} />
                                <Line type="monotone" dataKey="Duration" stroke="#eab308" strokeWidth={2} />
                                <Line type="monotone" dataKey="Consistency" stroke="#0ea5e9" strokeWidth={2} />
                                <Line type="monotone" dataKey="Environment" stroke="#a855f7" strokeWidth={2} />
                                <Line type="monotone" dataKey="Habits" stroke="#ec4899" strokeWidth={2} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="border shadow-lg rounded-xl overflow-hidden">
                        <CardContent className="p-5">
                          <h3 className="text-xl font-bold text-gray-900 mb-4">Category Comparison</h3>
                          
                          <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={prepareTrendData().slice(-3)} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                                <XAxis dataKey="date" stroke="#666" />
                                <YAxis domain={[0, 100]} stroke="#666" />
                                <Tooltip contentStyle={{ backgroundColor: '#eee', borderColor: '#999' }} />
                                <Legend />
                                <Bar dataKey="Quality" fill="#3b82f6" />
                                <Bar dataKey="Duration" fill="#eab308" />
                                <Bar dataKey="Consistency" fill="#0ea5e9" />
                                <Bar dataKey="Environment" fill="#a855f7" />
                                <Bar dataKey="Habits" fill="#ec4899" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Details Tab */}
                    <TabsContent value="details" className="mt-4">
                      <Card className="border shadow-lg rounded-xl overflow-hidden">
                        <CardContent className="p-5">
                          <h3 className="text-xl font-bold text-gray-900 mb-4">Assessment Details</h3>
                          <p className="text-sm text-gray-600 mb-4">{formatDate(selectedAssessment.date)}</p>
                          
                          {selectedAssessment.questions && selectedAssessment.responses ? (
                            <div className="space-y-4">
                              {selectedAssessment.questions.map((question, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-blue-50/50">
                                  <h4 className="font-medium text-gray-700 mb-2">Question {index + 1}</h4>
                                  <p className="text-sm text-gray-600 mb-3">{question}</p>
                                  <div className="bg-blue-50 p-3 rounded-lg">
                                    <p className="text-sm text-gray-700">
                                      {/* @ts-expect-error: no need here */}
                                      {selectedAssessment.responses[index] || "No response provided"}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center p-6 bg-blue-50/50 rounded-lg border border-blue-100">
                              <p className="text-gray-600">
                                Detailed responses are not available for this assessment.
                              </p>
                            </div>
                          )}
                          
                          {/* Sleep Stage Analysis - This would be in a real app if sleep stage data was available */}
                          <div className="mt-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Sleep Stages</h3>
                            <div className="bg-blue-50/50 rounded-lg p-4 text-center border border-blue-100">
                              <p className="text-gray-600 mb-4">
                                Sleep stage data is not available for this assessment. Connect a compatible sleep tracking device to see detailed sleep stage analysis.
                              </p>
                              <div className="grid grid-cols-4 gap-2 text-center">
                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                  <p className="text-xs text-gray-600">Awake</p>
                                  <p className="text-lg font-bold text-gray-700">--</p>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                  <p className="text-xs text-gray-600">Light</p>
                                  <p className="text-lg font-bold text-gray-700">--</p>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                  <p className="text-xs text-gray-600">Deep</p>
                                  <p className="text-lg font-bold text-gray-700">--</p>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                  <p className="text-xs text-gray-600">REM</p>
                                  <p className="text-lg font-bold text-gray-700">--</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </>
                ) : (
                  <div className="mt-4 p-8 text-center bg-blue-50 rounded-xl">
                    <p className="text-gray-600">
                      Select an assessment from the history to view details
                    </p>
                  </div>
                )}
              </Tabs>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SleepAnalysisDetails;