
import React from 'react';
import NavBar from '@/components/NavBar';
import { useHealth } from '@/context/HealthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO, subDays } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Calendar, Check, Clock, Droplet, Dumbbell, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';

const Dashboard = () => {
  const { healthGoal, healthPlan, dailyLogs, feedback, isOnboarded } = useHealth();
  const router = useRouter();

  // Redirect to goal setup if not onboarded
  React.useEffect(() => {
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
            mood: null,
            sleepHours: null,
            waterConsumed: null,
            meals: [],
            exercise: '',
            exerciseDuration: null,
            symptoms: [],
            stressLevel: null
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
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="bg-white p-4 rounded-b-3xl shadow-md">
        <NavBar />
      </div>
      
      <div className="container mx-auto px-4 py-6">
        {/* Health Plan Summary */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          <div className="md:col-span-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Your Health Goal: {healthGoal}</CardTitle>
                <CardDescription>
                  Personal health plan created based on your information
                </CardDescription>
              </CardHeader>
              <CardContent>
                {healthPlan && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Droplet className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium">Water Intake</p>
                          <p className="text-lg">{healthPlan.waterIntake}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-indigo-500" />
                        <div>
                          <p className="text-sm font-medium">Sleep</p>
                          <p className="text-lg">{healthPlan.sleepHours}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Dumbbell className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="text-sm font-medium">Exercise</p>
                          <p className="text-lg">{healthPlan.exercise}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <p className="font-medium mb-2">Recommended Meals</p>
                      <ul className="list-disc pl-5 space-y-1">
                        {healthPlan.meals.map((meal, i) => (
                          <li key={i} className="text-sm">{meal}</li>
                        ))}
                      </ul>
                      
                      <p className="font-medium mt-4 mb-2">Tips</p>
                      <ul className="list-disc pl-5 space-y-1">
                        {healthPlan.tips.map((tip, i) => (
                          <li key={i} className="text-sm">{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0">
                <Button 
                  onClick={() => router.push('/log')} 
                  variant="default" 
                  className="bg-brandOrange hover:bg-brandOrange/90 w-full"
                >
                  Log Today's Activities
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Adherence to Plan</CardTitle>
                <CardDescription>How well you're following your health plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Water Intake</span>
                      <span>{adherenceStats.water}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full" 
                        style={{ width: `${adherenceStats.water}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Sleep Quality</span>
                      <span>{adherenceStats.sleep}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full" 
                        style={{ width: `${adherenceStats.sleep}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Exercise</span>
                      <span>{adherenceStats.exercise}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full" 
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
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Weekly Trends</CardTitle>
                <CardDescription>Your mood and sleep patterns over the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={moodData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
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
                        stroke="#2196F3" 
                        name="Sleep (hours)" 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="stress" 
                        stroke="#9C27B0" 
                        name="Stress" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">AI Feedback</CardTitle>
                <CardDescription>Personalized analysis of your health data</CardDescription>
              </CardHeader>
              <CardContent>
                {latestFeedback ? (
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium">Adherence</p>
                      <p className="text-sm">{latestFeedback.adherence}</p>
                    </div>
                    
                    <div>
                      <p className="font-medium">Suggestions</p>
                      <ul className="list-disc pl-5 space-y-1">
                        {latestFeedback.suggestions.map((suggestion, i) => (
                          <li key={i} className="text-sm">{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <p className="font-medium">Motivation</p>
                      <p className="text-sm italic">{latestFeedback.motivation}</p>
                    </div>
                    
                    <div className="pt-2">
                      <Button 
                        onClick={() => router.push('/chat')} 
                        variant="outline" 
                        className="w-full"
                      >
                        Ask AI Assistant
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No feedback yet.</p>
                    <p className="text-sm">Log your daily activities to get AI insights.</p>
                    <div className="mt-4">
                      <Button 
                        onClick={() => router.push('/log')} 
                        variant="default" 
                        className="bg-brandOrange hover:bg-brandOrange/90"
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