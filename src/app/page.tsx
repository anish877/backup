'use client';
import React from 'react';
import NavBar from '../components/NavBar';
import HealthImprovementChart from '../components/HealthImprovementChart';
import WaterTracker from '../components/WaterTracker';
import MealTrackingCard from '../components/MealTrackingCard';
import MoodAnalysisCard from '../components/MoodAnalysisCard';
import SleepTrackingCard from '../components/SleepTrackingCard';

const Index = () => {
  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col">
      
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          <div className="md:col-span-3">
            <HealthImprovementChart />
          </div>
          <div className="md:col-span-2">
            <WaterTracker />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
          <div>
            <MealTrackingCard />
          </div>
          <div>
            <MoodAnalysisCard />
          </div>
          <div>
            <SleepTrackingCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;