import React, { useEffect, useState } from 'react';
import { Droplet, Plus, Minus } from 'lucide-react';
import useLogStore from '@/store/manage';

const WaterGlassTracker = () => {
  const [waterIntake, setWaterIntake] = useState(3);
  const totalGlasses = 8;

  
  
  const incrementWater = () => {
    if (waterIntake < totalGlasses) {
      setWaterIntake(waterIntake + 1);
    }
  };
  
  const decrementWater = () => {
    if (waterIntake > 0) {
      setWaterIntake(waterIntake - 1);
    }
  };
  
  const progressPercentage = (waterIntake / totalGlasses) * 100;
  
  return (
    <div className="bg-gradient-to-r from-blue-800 to-blue-900 p-6 rounded-xl shadow-lg max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-medium text-white">Water Tracker</h2>
        <Droplet size={24} className="text-white opacity-80" />
      </div>
      
      {/* Glass Counter Display */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={decrementWater} 
          className="bg-transparent bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-2 transition-colors"
          disabled={waterIntake <= 0}
        >
          <Minus size={20} className={waterIntake <= 0 ? "opacity-50" : ""} />
        </button>
        
        <div className="text-center">
          <span className="text-4xl font-bold text-white">{waterIntake}</span>
          <span className="text-xl text-white opacity-80"> / {totalGlasses}</span>
        </div>
        
        <button 
          onClick={incrementWater} 
          className="bg-transparent bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-2 transition-colors"
          disabled={waterIntake >= totalGlasses}
        >
          <Plus size={20} className={waterIntake >= totalGlasses ? "opacity-50" : ""} />
        </button>
      </div>
      
      {/* Water Glasses Visualization */}
      <div className="flex justify-between mb-6">
        {Array.from({length: totalGlasses}).map((_, index) => (
          <div 
            key={index} 
            className={`w-8 h-12 rounded-lg flex items-end justify-center ${
              index < waterIntake 
                ? "bg-blue-300" 
                : "bg-white bg-opacity-20"
            }`}
          >
            <div className="w-6 h-8 rounded-md bg-white bg-opacity-20 mb-1" />
          </div>
        ))}
      </div>
      
      {/* Progress Bar */}
      <div className="mt-4 bg-white bg-opacity-20 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-blue-300 h-full rounded-full transition-all duration-300 ease-in-out" 
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      <div className="mt-4 text-white text-sm opacity-70 text-center">
        {waterIntake === totalGlasses ? 
          "Daily goal reached! 🎉" : 
          `${totalGlasses - waterIntake} more to reach your daily goal`
        }
      </div>
    </div>
  );
};

export default WaterGlassTracker;