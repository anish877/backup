'use client'
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO, subDays } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Check, Clock, Droplet, Dumbbell, Heart, Brain, AlertCircle, Coffee, Moon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useHealthStore } from '@/store/healthStore';

const Dashboard = () => {
  const { healthGoal, healthPlan, dailyLogs, feedback, isOnboarded } = useHealthStore();
  const router = useRouter();

  // Redirect to goal setup if not onboarded
  useEffect(() => {
    if (!isOnboarded) {
      router.push('/goal');
    }
  }, [isOnboarded, router]);

  // Get the most recent log and feedback
  const latestLog = dailyLogs.length > 0 ? dailyLogs[dailyLogs.length - 1] : null;
  const latestFeedback = feedback.length > 0 ? feedback[feedback.length - 1] : null;

  // Prepare data for health metrics chart
  const healthMetricsData = React.useMemo(() => {
    // Take the last 7 logs or less if there aren't enough
    const last7Logs = dailyLogs.slice(-7);
    
    // If there are fewer than 7 logs, add placeholder data
    if (last7Logs.length < 7) {
      const today = new Date();
      for (let i = last7Logs.length; i < 7; i++) {
        const date = format(subDays(today, 7 - i - 1), 'yyyy-MM-dd');
        // Check if this date already exists in the logs
        if (!last7Logs.some(log => log.date === date)) {
          last7Logs.unshift({ 
            date, 
            mood: 0,
            sleepHours: 0,
            waterConsumed: 0,
            nutrition: 0,
            stressLevel: 0
          });
        }
      }
    }
    
    return last7Logs.map(log => ({
      date: log.date ? format(parseISO(log.date), 'MMM dd') : '',
      mood: log.mood || 0,
      sleep: log.sleepHours || 0,
      water: log.waterConsumed || 0,
      nutrition: log.nutrition || 0,
      stress: log.stressLevel || 0
    }));
  }, [dailyLogs]);

  // Prepare data for health breakdown pie chart
  const healthBreakdownData = React.useMemo(() => {
    if (!latestLog) return [];
    
    return [
      { name: 'Nutrition', value: latestLog.nutrition || 0, color: '#FF5500' },
      { name: 'Sleep', value: latestLog.sleepHours ? (latestLog.sleepHours / 10) * 100 : 0, color: '#9333EA' },
      { name: 'Mood', value: latestLog.mood || 0, color: '#22C55E' },
      { name: 'Water', value: latestLog.waterConsumed ? (latestLog.waterConsumed / 8) * 100 : 0, color: '#3B82F6' },
      { name: 'Activity', value: latestLog.exerciseDuration ? (latestLog.exerciseDuration / 60) * 100 : 0, color: '#F59E0B' }
    ];
  }, [latestLog]);

  // Compute health score
  const healthScore = React.useMemo(() => {
    if (!latestLog) return 0;
    
    // Calculate weighted average of all health metrics
    const nutritionWeight = 0.3;
    const sleepWeight = 0.25;
    const moodWeight = 0.15;
    const waterWeight = 0.15;
    const activityWeight = 0.15;
    
    const normalizedSleep = latestLog.sleepHours ? Math.min((latestLog.sleepHours / 8) * 100, 100) : 0;
    const normalizedWater = latestLog.waterConsumed ? Math.min((latestLog.waterConsumed / 8) * 100, 100) : 0;
    const normalizedActivity = latestLog.exerciseDuration ? Math.min((latestLog.exerciseDuration / 30) * 100, 100) : 0;
    
    return Math.round(
      (latestLog.nutrition || 0) * nutritionWeight +
      normalizedSleep * sleepWeight +
      (latestLog.mood || 0) * moodWeight +
      normalizedWater * waterWeight +
      normalizedActivity * activityWeight
    );
  }, [latestLog]);

  // Generate insights based on the logs
  const generateInsights = () => {
    if (dailyLogs.length < 2) return [];
    
    const insights = [];
    const recentLogs = dailyLogs.slice(-7);
    
    // Check sleep patterns
    const avgSleep = recentLogs.reduce((sum, log) => sum + (log.sleepHours || 0), 0) / recentLogs.length;
    if (avgSleep < 7) {
      insights.push("You're averaging less than 7 hours of sleep. Aim for 7-9 hours for optimal health.");
    }
    
    // Check water intake
    const avgWater = recentLogs.reduce((sum, log) => sum + (log.waterConsumed || 0), 0) / recentLogs.length;
    if (avgWater < 6) {
      insights.push("Your water intake is below recommended levels. Try to increase to at least 8 glasses daily.");
    }
    
    // Check mood trends
    const moodScores = recentLogs.map(log => log.mood || 0);
    const moodTrend = moodScores[moodScores.length - 1] - moodScores[0];
    if (moodTrend < -10) {
      insights.push("Your mood has been declining. Consider activities that boost your mental wellbeing.");
    }
    
    // Check exercise consistency
    const exerciseDays = recentLogs.filter(log => (log.exerciseDuration || 0) > 15).length;
    if (exerciseDays < 3) {
      insights.push("You've exercised fewer than 3 days recently. Aim for at least 150 minutes per week.");
    }
    
    return insights.length > 0 ? insights : ["Your health metrics look balanced. Keep up the good work!"];
  };

  // Get recommendations based on health metrics
  const getRecommendations = () => {
    if (!latestLog) return [];
    
    const recommendations = [];
    
    if ((latestLog.nutrition || 0) < 70) {
      recommendations.push("Include more whole foods and reduce processed items in your diet.");
    }
    
    if ((latestLog.sleepHours || 0) < 7) {
      recommendations.push("Work on improving your sleep hygiene for better rest quality.");
    }
    
    if ((latestLog.mood || 0) < 70) {
      recommendations.push("Try mindfulness practices to improve your mood and mental wellbeing.");
    }
    
    if ((latestLog.waterConsumed || 0) < 6) {
      recommendations.push("Set reminders to drink water throughout the day to stay hydrated.");
    }
    
    if ((latestLog.exerciseDuration || 0) < 20) {
      recommendations.push("Even short exercise sessions can help - aim for at least 20 minutes daily.");
    }
    
    return recommendations.length > 0 ? recommendations : ["Continue with your current health plan for sustained results."];
  };

  if (!isOnboarded) {
    return null; // This will prevent flash before redirect
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="container mx-auto px-4 py-6">
        {/* Health Overview Section */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          {/* Health Plan Summary Card */}
          <div className="md:col-span-3">
            <Card className="border border-gray-100 shadow-sm">
              <CardHeader className="pb-2 bg-white">
                <CardTitle className="text-lg font-semibold text-gray-900">Your Health Goal: {healthGoal}</CardTitle>
                <CardDescription className="text-gray-600">
                  Personal health plan created based on your information
                </CardDescription>
              </CardHeader>
              <CardContent className="bg-white">
                {healthPlan && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Droplet className="h-5 w-5 text-orange-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-800">Water Intake</p>
                          <p className="text-lg">{healthPlan.waterIntake}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-orange-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-800">Sleep</p>
                          <p className="text-lg">{healthPlan.sleepHours}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Dumbbell className="h-5 w-5 text-orange-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-800">Exercise</p>
                          <p className="text-lg">{healthPlan.exercise}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <p className="font-medium mb-2 text-gray-900">Recommended Meals</p>
                      <ul className="list-disc pl-5 space-y-1">
                        {healthPlan.meals.map((meal, i) => (
                          <li key={i} className="text-sm text-gray-700">{meal}</li>
                        ))}
                      </ul>
                      
                      <p className="font-medium mt-4 mb-2 text-gray-900">Tips</p>
                      <ul className="list-disc pl-5 space-y-1">
                        {healthPlan.tips.map((tip, i) => (
                          <li key={i} className="text-sm text-gray-700">{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0 bg-white">
                <Button 
                  onClick={() => router.push('/log')} 
                  variant="default" 
                  className="bg-orange-500 hover:bg-orange-600 text-white w-full"
                >
                  Log Today's Activities
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Health Score Card */}
          <div className="md:col-span-2">
            <Card className="h-full border border-gray-100 shadow-sm">
              <CardHeader className="bg-white">
                <CardTitle className="text-lg font-semibold text-gray-900">Your Health Score</CardTitle>
                <CardDescription className="text-gray-600">
                  Overall assessment based on your recent logs
                </CardDescription>
              </CardHeader>
              <CardContent className="bg-white flex flex-col items-center justify-center">
                <div className="relative w-32 h-32 mb-4">
                  {/* Circular progress indicator */}
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle 
                      className="text-gray-200" 
                      strokeWidth="8" 
                      stroke="currentColor" 
                      fill="transparent" 
                      r="40" 
                      cx="50" 
                      cy="50" 
                    />
                    <circle 
                      className="text-orange-500" 
                      strokeWidth="8" 
                      strokeLinecap="round" 
                      stroke="currentColor" 
                      fill="transparent" 
                      r="40" 
                      cx="50" 
                      cy="50" 
                      strokeDasharray={`${healthScore * 2.51}, 251`} 
                      strokeDashoffset="0" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-gray-900">{healthScore}</span>
                  </div>
                </div>
                
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600">
                    {healthScore >= 80 ? "Excellent" : 
                     healthScore >= 70 ? "Very Good" :
                     healthScore >= 60 ? "Good" :
                     healthScore >= 50 ? "Fair" : "Needs Improvement"}
                  </p>
                </div>
                
                <div className="w-full grid grid-cols-5 gap-2 mt-2">
                  <div className="flex flex-col items-center">
                    <Coffee className="h-5 w-5 text-orange-500 mb-1" />
                    <span className="text-xs text-gray-600">Nutrition</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Moon className="h-5 w-5 text-purple-600 mb-1" />
                    <span className="text-xs text-gray-600">Sleep</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Brain className="h-5 w-5 text-green-600 mb-1" />
                    <span className="text-xs text-gray-600">Mood</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Droplet className="h-5 w-5 text-blue-500 mb-1" />
                    <span className="text-xs text-gray-600">Water</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Dumbbell className="h-5 w-5 text-yellow-500 mb-1" />
                    <span className="text-xs text-gray-600">Activity</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Health Trends and Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Health Metrics Trends Chart */}
          <div className="md:col-span-2">
            <Card className="border border-gray-100 shadow-sm">
              <CardHeader className="bg-white">
                <CardTitle className="text-lg font-semibold text-gray-900">Health Metrics Trends</CardTitle>
                <CardDescription className="text-gray-600">Your key health indicators over the past week</CardDescription>
              </CardHeader>
              <CardContent className="bg-white">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={healthMetricsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                      <XAxis dataKey="date" stroke="#333" />
                      <YAxis stroke="#333" />
                      <Tooltip contentStyle={{ backgroundColor: 'white', borderColor: '#e2e8f0' }} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="mood" 
                        stroke="#22C55E" 
                        activeDot={{ r: 8 }} 
                        name="Mood" 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="sleep" 
                        stroke="#9333EA" 
                        name="Sleep (hours)" 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="water" 
                        stroke="#3B82F6" 
                        name="Water (glasses)" 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="nutrition" 
                        stroke="#FF5500" 
                        name="Nutrition" 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="stress" 
                        stroke="#121212" 
                        name="Stress" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                {latestLog && (
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                      <div className="flex justify-center mb-1">
                        <Brain className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="text-2xl font-semibold text-gray-900">{latestLog.mood || 0}</div>
                      <div className="text-xs text-gray-600">Mood Score</div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                      <div className="flex justify-center mb-1">
                        <Moon className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="text-2xl font-semibold text-gray-900">{latestLog.sleepHours || 0}</div>
                      <div className="text-xs text-gray-600">Hours Sleep</div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                      <div className="flex justify-center mb-1">
                        <Droplet className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="text-2xl font-semibold text-gray-900">{latestLog.waterConsumed || 0}</div>
                      <div className="text-xs text-gray-600">Glasses Water</div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                      <div className="flex justify-center mb-1">
                        <Coffee className="h-5 w-5 text-orange-500" />
                      </div>
                      <div className="text-2xl font-semibold text-gray-900">{latestLog.nutrition || 0}</div>
                      <div className="text-xs text-gray-600">Nutrition Score</div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                      <div className="flex justify-center mb-1">
                        <Dumbbell className="h-5 w-5 text-yellow-500" />
                      </div>
                      <div className="text-2xl font-semibold text-gray-900">{latestLog.exerciseDuration || 0}</div>
                      <div className="text-xs text-gray-600">Minutes Exercise</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* AI Health Insights Card */}
          <div className="md:col-span-1">
            <Card className="h-full border border-gray-100 shadow-sm">
              <CardHeader className="bg-white">
                <CardTitle className="text-lg font-semibold text-gray-900">AI Health Insights</CardTitle>
                <CardDescription className="text-gray-600">Personalized analysis of your health data</CardDescription>
              </CardHeader>
              <CardContent className="bg-white">
                {dailyLogs.length > 0 ? (
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium text-gray-900">Health Breakdown</p>
                      {latestLog && (
                        <div className="h-40 mt-2">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={healthBreakdownData}
                                cx="50%"
                                cy="50%"
                                innerRadius={30}
                                outerRadius={60}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {healthBreakdownData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip 
                                formatter={(value) => [`${value}%`, null]}
                                labelFormatter={(index) => healthBreakdownData[index].name}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <p className="font-medium text-gray-900">Recent Insights</p>
                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        {generateInsights().map((insight, i) => (
                          <li key={i} className="text-sm text-gray-700">{insight}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <p className="font-medium text-gray-900">Recommendations</p>
                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        {getRecommendations().map((recommendation, i) => (
                          <li key={i} className="text-sm text-gray-700">{recommendation}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="pt-2">
                      <Button 
                        onClick={() => router.push('/chat')} 
                        variant="outline" 
                        className="w-full border-orange-300 text-gray-800 hover:bg-orange-50"
                      >
                        Ask AI Assistant
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                    <p className="text-gray-700">No health data yet.</p>
                    <p className="text-sm text-gray-600 mb-4">Log your daily activities to get AI insights.</p>
                    <Button 
                      onClick={() => router.push('/log')} 
                      variant="default" 
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      Start Logging
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Additional Health Analytics */}
        {dailyLogs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Sleep Quality Analysis */}
            <Card className="border border-gray-100 shadow-sm">
              <CardHeader className="bg-white">
                <CardTitle className="text-lg font-semibold text-gray-900">Sleep Quality</CardTitle>
                <CardDescription className="text-gray-600">Analysis of your sleep patterns</CardDescription>
              </CardHeader>
              <CardContent className="bg-white">
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={healthMetricsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                      <XAxis dataKey="date" stroke="#333" />
                      <YAxis stroke="#333" />
                      <Tooltip contentStyle={{ backgroundColor: 'white', borderColor: '#e2e8f0' }} />
                      <Legend />
                      <Bar dataKey="sleep" name="Sleep Hours" fill="#9333EA" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 bg-purple-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Sleep insight: </span>
                    {dailyLogs.length >= 3 ? 
                      `Your average sleep over the past ${Math.min(dailyLogs.length, 7)} days is ${(dailyLogs.slice(-7).reduce((sum, log) => sum + (log.sleepHours || 0), 0) / Math.min(dailyLogs.length, 7)).toFixed(1)} hours.` : 
                      "Log at least 3 days of sleep data to get personalized insights."}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* Nutrition & Hydration Analysis */}
            <Card className="border border-gray-100 shadow-sm">
              <CardHeader className="bg-white">
                <CardTitle className="text-lg font-semibold text-gray-900">Nutrition & Hydration</CardTitle>
                <CardDescription className="text-gray-600">Analysis of your diet and water intake</CardDescription>
              </CardHeader>
              <CardContent className="bg-white">
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={healthMetricsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                      <XAxis dataKey="date" stroke="#333" />
                      <YAxis stroke="#333" />
                      <Tooltip contentStyle={{ backgroundColor: 'white', borderColor: '#e2e8f0' }} />
                      <Legend />
                      <Line type="monotone" dataKey="nutrition" name="Nutrition Score" stroke="#FF5500" />
                      <Line type="monotone" dataKey="water" name="Water Glasses" stroke="#3B82F6" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 bg-orange-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Nutrition insight: </span>
                    {dailyLogs.length >= 3 ? 
                      `Your nutrition scores are ${dailyLogs.slice(-3).every(log => (log.nutrition || 0) > 70) ? 'consistently good' : 'showing room for improvement'}. Focus on ${getRecommendations()[0].toLowerCase()}` : 
                      "Log at least 3 days of nutrition data to get personalized insights."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;