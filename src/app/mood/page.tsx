"use client";
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Smile, 
  Calendar, 
  ArrowLeft, 
  Loader2, 
  Activity, 
  Brain, 
  Coffee, 
  Sun, 
  AlertTriangle 
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
import axios from 'axios';

interface CategoryData {
  Happiness: number;
  Energy: number;
  Focus: number;
  Calm: number;
  Optimism: number;
  [key: string]: number;
}

interface Assessment {
  id: string;
  date: string;
  finalScore: number;
  categories?: CategoryData;
  happiness: number;
  energy: number;
  focus: number;
  calm: number;
  optimism: number;
  dailyRecommndations?: string[];
  responses?: Record<number, string>;
  questions?: string[];
  dailyLog?: {
    date: string;
  };
}

const MoodAnalysisDetails = () => {
  const router = useRouter();
  const [assessmentHistory, setAssessmentHistory] = useState<Assessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch mood history from API
  useEffect(() => {
    const fetchMoodHistory = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3001/api/mood/history`,{withCredentials:true});
        
        if (response.data.success) {
          // Transform the data to match the expected format
          const transformedData = response.data.data.map((mood: any) => {
            // Create a categories object from individual category scores
            const categories = {
              Happiness: mood.happiness,
              Energy: mood.energy,
              Focus: mood.focus,
              Calm: mood.calm,
              Optimism: mood.optimism
            };
            
            return {
              ...mood,
              categories,
              // Use the mood's date or the daily log date
              date: mood.date || (mood.dailyLog ? mood.dailyLog.date : new Date().toISOString()),
              // Use finalScore as score
              score: mood.finalScore
            };
          });
          
          // Sort by date, newest first
          const sortedData = transformedData.sort((a: Assessment, b: Assessment) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          
          setAssessmentHistory(sortedData);
          
          // Set the most recent assessment as selected
          if (sortedData.length > 0) {
            setSelectedAssessment(sortedData[0]);
          }
        } else {
          setError('Failed to load mood history');
        }
      } catch (error) {
        console.error("Error fetching mood history:", error);
        setError('Failed to connect to the server');
      } finally {
        setLoading(false);
      }
    };

    fetchMoodHistory();
  }, []);

  // Get mood details by ID
  const fetchMoodDetails = async (id: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3001/api/mood/${id}`,{withCredentials:true});
      
      if (response.data.success) {
        const moodData = response.data.data;
        
        // Transform to match expected format
        const categories = {
          Happiness: moodData.happiness,
          Energy: moodData.energy,
          Focus: moodData.focus,
          Calm: moodData.calm,
          Optimism: moodData.optimism
        };
        
        const transformedMood = {
          ...moodData,
          categories,
          score: moodData.finalScore,
          date: moodData.date || (moodData.dailyLog ? moodData.dailyLog.date : new Date().toISOString())
        };
        
        setSelectedAssessment(transformedMood);
      } else {
        console.error('Failed to fetch mood details');
      }
    } catch (error) {
      console.error("Error fetching mood details:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get icon based on mood score
  const getMoodIcon = (score: number) => {
    if (score >= 80) return <Smile className="w-5 h-5 text-blue-500" />;
    if (score >= 65) return <Sun className="w-5 h-5 text-blue-500" />;
    if (score >= 50) return <Coffee className="w-5 h-5 text-yellow-500" />;
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

  // Get mood label based on score
  const getMoodLabel = (score: number): string => {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Fair";
    return "Needs attention";
  };

  // Prepare trend data for charts
  const prepareTrendData = () => {
    return assessmentHistory.slice(0, 10).reverse().map(assessment => {
      const date = new Date(assessment.date);
      return {
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        score: assessment.score || assessment.finalScore,
        Happiness: assessment.happiness,
        Energy: assessment.energy,
        Focus: assessment.focus,
        Calm: assessment.calm,
        Optimism: assessment.optimism
      };
    });
  };

  // Prepare pie data for selected assessment
  const preparePieData = () => {
    if (!selectedAssessment) return [];
    
    // Use either categories object or individual properties
    const categories = selectedAssessment.categories || {
      Happiness: selectedAssessment.happiness,
      Energy: selectedAssessment.energy,
      Focus: selectedAssessment.focus,
      Calm: selectedAssessment.calm,
      Optimism: selectedAssessment.optimism
    };
    
    return Object.entries(categories).map(([category, value]) => ({
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
    if (assessment.id) {
      fetchMoodDetails(assessment.id);
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Mood Analysis Dashboard</h1>
            <p className="text-gray-600">Detailed insights and historical trends of your emotional wellbeing</p>
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
              <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Data</h3>
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
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Assessment Data</h3>
              <p className="text-gray-600 mb-6">Complete your first mood assessment to see detailed analytics and trends.</p>
              <Button onClick={goBack} className="bg-blue-600 hover:bg-blue-700 text-white">
                Go Back to Take Assessment
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
                    <h2 className="text-lg font-semibold text-gray-900">Assessment History</h2>
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
                                selectedAssessment && selectedAssessment.id === assessment.id ? 'bg-blue-100' : ''
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="p-2 bg-blue-100 rounded-full">
                                    {getMoodIcon(assessment.score || assessment.finalScore)}
                                  </div>
                                  <div>
                                    <div className="flex items-center space-x-2">
                                      <Badge className="bg-blue-100 text-blue-800 border border-blue-200 text-xs">
                                        {getMoodLabel(assessment.score || assessment.finalScore)}
                                      </Badge>
                                      <span className="font-medium text-gray-900">{assessment.score || assessment.finalScore}</span>
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
                              <h3 className="text-xl font-bold text-gray-900">Current Mood Score</h3>
                              <p className="text-sm text-gray-600">{formatDate(selectedAssessment.date)}</p>
                            </div>
                            <div className="flex items-center">
                              <span className="text-3xl font-bold text-gray-900 mr-2">
                                {selectedAssessment.score || selectedAssessment.finalScore}
                              </span>
                              <Badge className="bg-blue-100 text-blue-800 border border-blue-200">
                                {getMoodLabel(selectedAssessment.score || selectedAssessment.finalScore)}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="bg-blue-50/50 p-4 rounded-lg mb-6">
                            <div className="flex items-center mb-2">
                              <Badge className="mr-2 bg-blue-100 text-blue-800 border border-blue-200">
                                Mood Check-in
                              </Badge>
                              <span className="text-sm text-gray-600">{formatDate(selectedAssessment.date)}</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-medium text-gray-700 mb-3">Category Breakdown</h4>
                              <div className="space-y-3">
                                {preparePieData().map(({ name, value }) => (
                                  <div key={name} className="space-y-1">
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm text-gray-700">{name}</span>
                                      <span className={`text-sm font-medium ${getCategoryColor(value)}`}>{value}/100</span>
                                    </div>
                                    <Progress value={value} className="h-2 bg-gray-200">
                                      <div className={`h-full ${getProgressColor(value)}`} style={{width: `${value}%`}}></div>
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
                          {selectedAssessment.dailyRecommndations && selectedAssessment.dailyRecommndations.length > 0 && (
                            <div className="mt-6">
                              <h4 className="font-medium text-gray-700 mb-3">Recommended Actions</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {selectedAssessment.dailyRecommndations.slice(0, 3).map((recommendation, index) => (
                                  <div key={index} className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                    <div className="flex-shrink-0 bg-blue-100 p-2 rounded-full mb-2">
                                      {index === 0 ? (
                                        <Brain className="h-4 w-4 text-blue-500" />
                                      ) : index === 1 ? (
                                        <Sun className="h-4 w-4 text-blue-500" />
                                      ) : (
                                        <Coffee className="h-4 w-4 text-blue-500" />
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-700">{recommendation}</p>
                                  </div>
                                ))}
                                
                                {/* Use default recommendations if we don't have enough */}
                                {[...Array(Math.max(0, 3 - (selectedAssessment.dailyRecommndations?.length || 0)))].map((_, index) => {
                                  const defaultRecommendations = [
                                    "Practice mindfulness meditation for 10 minutes",
                                    "Take a 15-minute walk in natural light",
                                    "Connect with a friend or family member today"
                                  ];
                                  const actualIndex = (selectedAssessment.dailyRecommndations?.length || 0) + index;
                                  
                                  return (
                                    <div key={`default-${index}`} className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                      <div className="flex-shrink-0 bg-blue-100 p-2 rounded-full mb-2">
                                        {actualIndex === 0 ? (
                                          <Brain className="h-4 w-4 text-blue-500" />
                                        ) : actualIndex === 1 ? (
                                          <Sun className="h-4 w-4 text-blue-500" />
                                        ) : (
                                          <Coffee className="h-4 w-4 text-blue-500" />
                                        )}
                                      </div>
                                      <p className="text-sm text-gray-700">{defaultRecommendations[actualIndex]}</p>
                                    </div>
                                  );
                                })}
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
                          <h3 className="text-xl font-bold text-gray-900 mb-4">Mood Score Trends</h3>
                          
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
                                <Line type="monotone" dataKey="Happiness" stroke="#3b82f6" strokeWidth={2} />
                                <Line type="monotone" dataKey="Energy" stroke="#eab308" strokeWidth={2} />
                                <Line type="monotone" dataKey="Calm" stroke="#0ea5e9" strokeWidth={2} />
                                <Line type="monotone" dataKey="Focus" stroke="#a855f7" strokeWidth={2} />
                                <Line type="monotone" dataKey="Optimism" stroke="#ec4899" strokeWidth={2} />
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
                                <Bar dataKey="Happiness" fill="#3b82f6" />
                                <Bar dataKey="Energy" fill="#eab308" />
                                <Bar dataKey="Calm" fill="#0ea5e9" />
                                <Bar dataKey="Focus" fill="#a855f7" />
                                <Bar dataKey="Optimism" fill="#ec4899" />
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
                          
                          {/* Display recommendations if available */}
                          {selectedAssessment.dailyRecommndations && selectedAssessment.dailyRecommndations.length > 0 && (
                            <div className="mt-6">
                              <h4 className="font-medium text-gray-700 mb-3">Recommended Actions</h4>
                              <div className="space-y-3">
                                {selectedAssessment.dailyRecommndations.map((recommendation, index) => (
                                  <div key={index} className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                    <p className="text-sm text-gray-700">{index + 1}. {recommendation}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
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

export default MoodAnalysisDetails;