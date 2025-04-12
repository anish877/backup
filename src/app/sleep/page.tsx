"use client";
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Moon, 
  Calendar, 
  ArrowLeft, 
  Loader2, 
  Activity, 
  Coffee, 
  BedDouble, 
  Clock,
  AlertTriangle,
  BatteryFull
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
  const [assessmentHistory, setAssessmentHistory] = useState<Assessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load assessment history from localStorage
    const loadHistory = () => {
      try {
        const historyData = localStorage.getItem('sleepAssessmentHistory');
        if (historyData) {
          const parsedData = JSON.parse(historyData) as Assessment[];
          setAssessmentHistory(parsedData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
          
          // Set the most recent assessment as selected
          if (parsedData.length > 0) {
            setSelectedAssessment(parsedData[0]);
          }
        } else {
          // For demo purposes, create sample data if none exists
          const sampleData = generateSampleData();
          setAssessmentHistory(sampleData);
          if (sampleData.length > 0) {
            setSelectedAssessment(sampleData[0]);
          }
        }
      } catch (error) {
        console.error("Error loading assessment history:", error);
        // For demo purposes, create sample data if there's an error
        const sampleData = generateSampleData();
        setAssessmentHistory(sampleData);
        if (sampleData.length > 0) {
          setSelectedAssessment(sampleData[0]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  // Generate sample data for demo purposes
  const generateSampleData = (): Assessment[] => {
    const today = new Date();
    const data: Assessment[] = [];
    
    for (let i = 0; i < 10; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      const baseScore = 65 + Math.floor(Math.random() * 25);
      const variability = Math.floor(Math.random() * 15) - 7; // -7 to +7
      
      data.push({
        date: date.toISOString(),
        score: Math.min(100, Math.max(0, baseScore + variability)),
        categories: {
          "Quality": Math.min(100, Math.max(0, baseScore + Math.floor(Math.random() * 15) - 7)),
          "Duration": Math.min(100, Math.max(0, baseScore + Math.floor(Math.random() * 15) - 7)),
          "Consistency": Math.min(100, Math.max(0, baseScore + Math.floor(Math.random() * 15) - 7)),
          "Environment": Math.min(100, Math.max(0, baseScore + Math.floor(Math.random() * 15) - 7)),
          "Habits": Math.min(100, Math.max(0, baseScore + Math.floor(Math.random() * 15) - 7))
        },
        analysis: "Your sleep patterns show moderate quality with some room for improvement. Your sleep duration was adequate, but environmental factors may be affecting your deep sleep phases.",
        insights: [
          "Dim lights 1 hour before bedtime",
          "Keep bedroom temperature between 60-67°F",
          "Avoid caffeine after 2pm"
        ],
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
      });
    }
    
    return data;
  };

  // Get icon based on sleep score
  const getSleepIcon = (score: number) => {
    if (score >= 80) return <BatteryFull className="w-5 h-5 text-indigo-500" />;
    if (score >= 65) return <BedDouble className="w-5 h-5 text-indigo-500" />;
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
    if (score >= 80) return 'text-indigo-500';
    if (score >= 65) return 'text-indigo-600';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Get background color for progress bar
  const getProgressColor = (score: number): string => {
    if (score >= 80) return 'bg-indigo-500';
    if (score >= 65) return 'bg-indigo-600';
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
      color: value >= 80 ? '#4338CA' : value >= 65 ? '#6366F1' : value >= 50 ? '#eab308' : '#ef4444'
    }));
  };

  // Navigate back to dashboard
  const goBack = () => {
    router.push('/');
  };

  // Handle selecting an assessment from history
  const handleSelectAssessment = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={goBack} className="mr-4 text-zinc-400 hover:text-zinc-100">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-zinc-100">Sleep Analysis Dashboard</h1>
            <p className="text-zinc-400">Detailed insights and historical trends of your sleep patterns</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : assessmentHistory.length === 0 ? (
          <Card className="border-0 shadow-lg rounded-xl overflow-hidden bg-zinc-900">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-4 p-4 rounded-full bg-zinc-800 inline-block">
                <Moon className="h-8 w-8 text-indigo-500" />
              </div>
              <h3 className="text-xl font-bold text-zinc-100 mb-2">No Assessment Data</h3>
              <p className="text-zinc-400 mb-6">Complete your first sleep assessment to see detailed analytics and trends.</p>
              <Button onClick={goBack} className="bg-indigo-700 hover:bg-indigo-600 text-white">
                Go Back to Take Assessment
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Assessment history */}
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-lg rounded-xl overflow-hidden bg-zinc-900 h-full">
                <CardHeader className="p-4 bg-gradient-to-r from-indigo-900 to-indigo-700 border-b border-indigo-800">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-indigo-300" />
                    <h2 className="text-lg font-semibold text-white">Assessment History</h2>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[calc(100vh-280px)]">
                    <div className="divide-y divide-zinc-800">
                      {assessmentHistory.map((assessment, index) => (
                        <div 
                          key={index}
                          onClick={() => handleSelectAssessment(assessment)}
                          className={`p-4 cursor-pointer hover:bg-zinc-800/50 transition-colors ${
                            selectedAssessment && selectedAssessment.date === assessment.date ? 'bg-zinc-800' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-zinc-800 rounded-full">
                                {getSleepIcon(assessment.score)}
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-zinc-100">{assessment.score}</span>
                                  <Badge className="bg-zinc-800 text-zinc-300 text-xs">
                                    {getSleepQualityLabel(assessment.score)}
                                  </Badge>
                                </div>
                                <p className="text-xs text-zinc-400">{formatDate(assessment.date)}</p>
                              </div>
                            </div>
                          </div>
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
                <TabsList className="w-full bg-zinc-900 border-b border-zinc-800 rounded-t-xl p-0">
                  <TabsTrigger value="overview" className="flex-1 py-3 rounded-none data-[state=active]:bg-zinc-800">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="trends" className="flex-1 py-3 rounded-none data-[state=active]:bg-zinc-800">
                    Trends
                  </TabsTrigger>
                  <TabsTrigger value="details" className="flex-1 py-3 rounded-none data-[state=active]:bg-zinc-800">
                    Details
                  </TabsTrigger>
                </TabsList>
                
                {selectedAssessment ? (
                  <>
                    {/* Overview Tab */}
                    <TabsContent value="overview" className="mt-4 space-y-4">
                      <Card className="border-0 shadow-lg rounded-xl overflow-hidden bg-zinc-900">
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-zinc-100">Sleep Score</h3>
                              <p className="text-sm text-zinc-400">{formatDate(selectedAssessment.date)}</p>
                            </div>
                            <div className="flex items-center">
                              <span className="text-3xl font-bold text-zinc-100 mr-2">{selectedAssessment.score}</span>
                              <Badge className="bg-indigo-900/50 text-indigo-300 border border-indigo-700">
                                {getSleepQualityLabel(selectedAssessment.score)}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-medium text-zinc-300 mb-3">Category Breakdown</h4>
                              <div className="space-y-3">
                                {Object.entries(selectedAssessment.categories).map(([category, score]) => (
                                  <div key={category} className="space-y-1">
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm text-zinc-300">{category}</span>
                                      <span className={`text-sm font-medium ${getCategoryColor(score)}`}>{score}/100</span>
                                    </div>
                                    <Progress value={score} className="h-2 bg-zinc-800">
                                      <div className={`h-full ${getProgressColor(score)}`} style={{width: `${score}%`}}></div>
                                    </Progress>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-zinc-300 mb-3">Distribution</h4>
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
                          {selectedAssessment.insights && (
                            <div className="mt-6">
                              <h4 className="font-medium text-zinc-300 mb-3">Recommended Actions</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {selectedAssessment.insights.map((insight, index) => (
                                  <div key={index} className="bg-indigo-900/20 p-3 rounded-lg border border-indigo-900/50">
                                    <div className="flex-shrink-0 bg-indigo-800/70 p-2 rounded-full mb-2">
                                      {index === 0 ? <Moon className="h-4 w-4 text-indigo-300" /> : 
                                       index === 1 ? <BedDouble className="h-4 w-4 text-indigo-300" /> :
                                       <Coffee className="h-4 w-4 text-indigo-300" />}
                                    </div>
                                    <p className="text-sm text-zinc-300">{insight}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* AI Analysis */}
                          {selectedAssessment.analysis && (
                            <div className="mt-6 bg-indigo-900/20 p-4 rounded-lg border border-indigo-900/50">
                              <h4 className="font-medium text-zinc-300 mb-2">AI Analysis</h4>
                              <p className="text-sm text-zinc-300">{selectedAssessment.analysis}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Trends Tab */}
                    <TabsContent value="trends" className="mt-4 space-y-4">
                      <Card className="border-0 shadow-lg rounded-xl overflow-hidden bg-zinc-900">
                        <CardContent className="p-5">
                          <h3 className="text-xl font-bold text-zinc-100 mb-4">Sleep Score Trends</h3>
                          
                          <div className="h-72 mb-6">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={prepareTrendData()} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="date" stroke="#888" />
                                <YAxis domain={[0, 100]} stroke="#888" />
                                <Tooltip contentStyle={{ backgroundColor: '#222', borderColor: '#444' }} />
                                <Legend />
                                <Line type="monotone" dataKey="score" stroke="#4338CA" strokeWidth={2} name="Overall Score" />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                          
                          <Separator className="my-6 bg-zinc-800" />
                          
                          <h3 className="text-xl font-bold text-zinc-100 mb-4">Category Trends</h3>
                          
                          <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={prepareTrendData()} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="date" stroke="#888" />
                                <YAxis domain={[0, 100]} stroke="#888" />
                                <Tooltip contentStyle={{ backgroundColor: '#222', borderColor: '#444' }} />
                                <Legend />
                                <Line type="monotone" dataKey="Quality" stroke="#4338CA" strokeWidth={2} />
                                <Line type="monotone" dataKey="Duration" stroke="#eab308" strokeWidth={2} />
                                <Line type="monotone" dataKey="Consistency" stroke="#3b82f6" strokeWidth={2} />
                                <Line type="monotone" dataKey="Environment" stroke="#a855f7" strokeWidth={2} />
                                <Line type="monotone" dataKey="Habits" stroke="#ec4899" strokeWidth={2} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-0 shadow-lg rounded-xl overflow-hidden bg-zinc-900">
                        <CardContent className="p-5">
                          <h3 className="text-xl font-bold text-zinc-100 mb-4">Category Comparison</h3>
                          
                          <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={prepareTrendData().slice(-3)} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="date" stroke="#888" />
                                <YAxis domain={[0, 100]} stroke="#888" />
                                <Tooltip contentStyle={{ backgroundColor: '#222', borderColor: '#444' }} />
                                <Legend />
                                <Bar dataKey="Quality" fill="#4338CA" />
                                <Bar dataKey="Duration" fill="#eab308" />
                                <Bar dataKey="Consistency" fill="#3b82f6" />
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
                      <Card className="border-0 shadow-lg rounded-xl overflow-hidden bg-zinc-900">
                        <CardContent className="p-5">
                          <h3 className="text-xl font-bold text-zinc-100 mb-4">Assessment Details</h3>
                          <p className="text-sm text-zinc-400 mb-4">{formatDate(selectedAssessment.date)}</p>
                          
                          {selectedAssessment.questions && selectedAssessment.responses ? (
                            <div className="space-y-4">
                              {selectedAssessment.questions.map((question, index) => (
                                <div key={index} className="border border-zinc-800 rounded-lg p-4 bg-zinc-800/30">
                                  <h4 className="font-medium text-zinc-300 mb-2">Question {index + 1}</h4>
                                  <p className="text-sm text-zinc-400 mb-3">{question}</p>
                                  <div className="bg-zinc-800 p-3 rounded-lg">
                                    <p className="text-sm text-zinc-300">
                                      {selectedAssessment.responses[index] || "No response provided"}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center p-6 bg-zinc-800/30 rounded-lg">
                              <p className="text-zinc-400">
                                Detailed responses are not available for this assessment.
                              </p>
                            </div>
                          )}
                          
                          {/* Sleep Stage Analysis - This would be in a real app if sleep stage data was available */}
                          <div className="mt-6">
                            <h3 className="text-xl font-bold text-zinc-100 mb-4">Sleep Stages</h3>
                            <div className="bg-zinc-800/30 rounded-lg p-4 text-center">
                              <p className="text-zinc-400 mb-4">
                                Sleep stage data is not available for this assessment. Connect a compatible sleep tracking device to see detailed sleep stage analysis.
                              </p>
                              <div className="grid grid-cols-4 gap-2 text-center">
                                <div className="p-3 bg-indigo-900/20 rounded-lg border border-indigo-900/50">
                                  <p className="text-xs text-zinc-400">Awake</p>
                                  <p className="text-lg font-bold text-zinc-200">--</p>
                                </div>
                                <div className="p-3 bg-indigo-900/20 rounded-lg border border-indigo-900/50">
                                  <p className="text-xs text-zinc-400">Light</p>
                                  <p className="text-lg font-bold text-zinc-200">--</p>
                                </div>
                                <div className="p-3 bg-indigo-900/20 rounded-lg border border-indigo-900/50">
                                  <p className="text-xs text-zinc-400">Deep</p>
                                  <p className="text-lg font-bold text-zinc-200">--</p>
                                </div>
                                <div className="p-3 bg-indigo-900/20 rounded-lg border border-indigo-900/50">
                                  <p className="text-xs text-zinc-400">REM</p>
                                  <p className="text-lg font-bold text-zinc-200">--</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </>
                ) : (
                  <div className="mt-4 p-8 text-center bg-zinc-900 rounded-xl">
                    <p className="text-zinc-400">
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