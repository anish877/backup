import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { customToast } from '@/components/CustomToast';
import ProgressCard from './ProgressCard';

const DailyProgressContainer = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState({
    exists: false,
    progress: {
      nutrition: false,
      sleep: false,
      mood: false,
      water: false,
    },
    completionPercentage: 0,
    dailyLogId: null
  });

  useEffect(() => {
    fetchDailyProgress();
  }, []);

  const fetchDailyProgress = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://healthbackend-production-157d.up.railway.app/daily-progress`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setProgressData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching daily progress:', error);
      customToast.error('Failed to load your daily progress');
    } finally {
      setLoading(false);
    }
  };

  const handleLogEntry = (type: string) => {
    // Redirect to the appropriate form based on the type
    router.push(`/`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProgressCard progress={{
        nutrition: progressData.progress.nutrition,
        sleep: progressData.progress.sleep,
        mood: progressData.progress.mood,
        water: progressData.progress.water,
        completionPercentage: progressData.completionPercentage

      }} date={new Date()} />
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {!progressData.progress.nutrition && (
          <Button 
            onClick={() => handleLogEntry('nutrition')}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Log Nutrition
          </Button>
        )}
        
        {!progressData.progress.sleep && (
          <Button 
            onClick={() => handleLogEntry('sleep')}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Log Sleep
          </Button>
        )}
        
        {!progressData.progress.mood && (
          <Button 
            onClick={() => handleLogEntry('mood')}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Log Mood
          </Button>
        )}
        
        {!progressData.progress.water && (
          <Button 
            onClick={() => handleLogEntry('water')}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Log Water
          </Button>
        )}
      </div>
      
      {progressData.completionPercentage === 100 && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
          <p className="text-green-700 font-medium">Great job! You've completed all your daily logs.</p>
        </div>
      )}
    </div>
  );
};

export default DailyProgressContainer;