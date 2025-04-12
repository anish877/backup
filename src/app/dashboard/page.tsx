'use client'
import React, { useEffect } from 'react';
import NavBar from '@/components/NavBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO, subDays } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Calendar, Check, Clock, Droplet, Dumbbell, Heart } from 'lucide-react';
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

  // Prepare data for mood chart
  const moodData = React.useMemo(() => {
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
            meals: [],
            exercise: '',
            exerciseDuration: 0,
            symptoms: [],
            stressLevel: 0
          });
        }
      }
    }
    
    return last7Logs.map(log => ({
      date: log.date ? format(parseISO(log.date), 'MMM dd') : '',
      mood: log.mood || 0,
      sleep: log.sleepHours || 0,
      stress: log.stressLevel || 0
    }));
  }, [dailyLogs]);

  // Compute adherence stats
  const adherenceStats = React.useMemo(() => {
    if (!healthPlan || dailyLogs.length === 0) return { water: 0, sleep: 0, exercise: 0 };
    
    let waterAdherenceSum = 0;
    let sleepAdherenceSum = 0;
    let exerciseAdherenceSum = 0;
    
    dailyLogs.forEach(log => {
      // Water adherence
      const targetWater = parseFloat(healthPlan.waterIntake);
      waterAdherenceSum += Math.min(log.waterConsumed / targetWater, 1);
      
      // Sleep adherence (assuming the format is like "7-8 hours")
      const sleepRange = healthPlan.sleepHours.split('-');
      const minSleep = parseFloat(sleepRange[0]);
      const maxSleep = parseFloat(sleepRange[1]);
      const optimalSleep = (minSleep + maxSleep) / 2;
      const sleepDeviation = Math.abs(log.sleepHours - optimalSleep) / optimalSleep;
      sleepAdherenceSum += Math.max(0, 1 - sleepDeviation);
      
      // Exercise adherence - simplified
      exerciseAdherenceSum += log.exerciseDuration > 20 ? 1 : log.exerciseDuration / 20;
    });
    
    const count = dailyLogs.length;
    return {
      water: Math.round((waterAdherenceSum / count) * 100),
      sleep: Math.round((sleepAdherenceSum / count) * 100),
      exercise: Math.round((exerciseAdherenceSum / count) * 100)
    };
  }, [healthPlan, dailyLogs]);

  if (!isOnboarded) {
    return null; // This will prevent flash before redirect
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      
      <div className="container mx-auto px-4 py-6">
        {/* Health Plan Summary */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
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
          
          <div className="md:col-span-2">
            <Card className="h-full border border-gray-100 shadow-sm">
              <CardHeader className="bg-white">
                <CardTitle className="text-lg font-semibold text-gray-900">Adherence to Plan</CardTitle>
                <CardDescription className="text-gray-600">How well you're following your health plan</CardDescription>
              </CardHeader>
              <CardContent className="bg-white">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-800">Water Intake</span>
                      <span className="text-gray-800">{adherenceStats.water}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-400 rounded-full" 
                        style={{ width: `${adherenceStats.water}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-800">Sleep Quality</span>
                      <span className="text-gray-800">{adherenceStats.sleep}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-300 rounded-full" 
                        style={{ width: `${adherenceStats.sleep}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-800">Exercise</span>
                      <span className="text-gray-800">{adherenceStats.exercise}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-500 rounded-full" 
                        style={{ width: `${adherenceStats.exercise}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Charts and AI Feedback */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="border border-gray-100 shadow-sm">
              <CardHeader className="bg-white">
                <CardTitle className="text-lg font-semibold text-gray-900">Weekly Trends</CardTitle>
                <CardDescription className="text-gray-600">Your mood and sleep patterns over the past week</CardDescription>
              </CardHeader>
              <CardContent className="bg-white">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={moodData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                      <XAxis dataKey="date" stroke="#333" />
                      <YAxis stroke="#333" />
                      <Tooltip contentStyle={{ backgroundColor: 'white', borderColor: '#e2e8f0' }} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="mood" 
                        stroke="#FF5500" 
                        activeDot={{ r: 8 }} 
                        name="Mood" 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="sleep" 
                        stroke="#FF9D80" 
                        name="Sleep (hours)" 
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
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="h-full border border-gray-100 shadow-sm">
              <CardHeader className="bg-white">
                <CardTitle className="text-lg font-semibold text-gray-900">AI Feedback</CardTitle>
                <CardDescription className="text-gray-600">Personalized analysis of your health data</CardDescription>
              </CardHeader>
              <CardContent className="bg-white">
                {latestFeedback ? (
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium text-gray-900">Adherence</p>
                      <p className="text-sm text-gray-700">{latestFeedback.adherence}</p>
                    </div>
                    
                    <div>
                      <p className="font-medium text-gray-900">Suggestions</p>
                      <ul className="list-disc pl-5 space-y-1">
                        {latestFeedback.suggestions.map((suggestion, i) => (
                          <li key={i} className="text-sm text-gray-700">{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <p className="font-medium text-gray-900">Motivation</p>
                      <p className="text-sm italic text-gray-700">{latestFeedback.motivation}</p>
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
                    <p className="text-gray-500">No feedback yet.</p>
                    <p className="text-sm text-gray-600">Log your daily activities to get AI insights.</p>
                    <div className="mt-4">
                      <Button 
                        onClick={() => router.push('/log')} 
                        variant="default" 
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        Start Logging
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;