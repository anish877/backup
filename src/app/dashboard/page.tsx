'use client'
import React from 'react';
import NavBar from '@/components/NavBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO, subDays } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Check, Clock, Droplet, Dumbbell, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useHealthStore } from '@/store/healthStore';

const Dashboard = () => {
  // Use our Zustand store instead of the custom hook
  const { 
    healthGoal, 
    healthPlan, 
    dailyLogs, 
    feedback, 
    isOnboarded 
  } = useHealthStore();
  
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

  // Rest of the component remains the same
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Component JSX remains the same */}
      {/* ... */}
    </div>
  );
};

export default Dashboard;