
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus } from 'lucide-react';

const LifestyleCard = () => {
  // Helper function to generate random colored dots
  const generateDots = (count: number) => {
    const colors = ['#FF5500', '#4CAF50', '#2196F3', '#9C27B0'];
    return Array.from({ length: count }, (_, i) => (
      <span 
        key={i} 
        className="health-metric-dot inline-block mx-0.5"
        style={{ backgroundColor: colors[Math.floor(Math.random() * colors.length)] }}
      ></span>
    ));
  };

  return (
    <div className="bg-white p-6 rounded-3xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-5 h-5 rounded bg-brandOrange mr-2"></div>
          <h2 className="text-lg font-semibold">Lifestyle and Behaviour</h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex space-x-1">
            {['•', '•', '•'].map((dot, i) => (
              <span key={i} className="text-xl">{dot}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-4xl font-bold">9,365.29</h3>
            <p className="text-sm text-gray-500">KCAL Totally</p>
          </div>
          <Badge className="bg-brandOrange text-white">+16%</Badge>
        </div>

        <div className="flex items-center mt-4 space-x-0.5">
          {generateDots(25)}
        </div>
      </div>

      <div className="text-xs text-gray-600 mb-4">
        <p>Perfect wellness metrics</p>
        <p>Based on data from <span className="underline">BLOCKCHAIN</span></p>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t pt-4">
        <div className="border-r pr-4">
          <h3 className="text-3xl font-bold">265</h3>
          <p className="text-xs text-gray-500">Mg/dL</p>
        </div>
        
        <div className="flex flex-col">
          <div className="flex justify-between">
            <div>
              <h3 className="text-3xl font-bold">8k</h3>
              <p className="text-xs text-gray-500">Steps</p>
            </div>
            <div className="self-end">
              <span className="text-xs text-gray-500">2d</span>
              <span className="ml-2 text-xs text-green-500">↑ 24%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-6 border-t pt-4">
        <div className="flex space-x-2">
          {[1,2,3].map((i) => (
            <div key={i} className="w-8 h-8 rounded-full bg-brandOrange flex items-center justify-center text-white">
              👤
            </div>
          ))}
        </div>
        
        <div className="text-right">
          <p className="text-sm">Workouts</p>
          <p className="text-xs text-gray-500">Completed</p>
        </div>
        
        <div className="flex flex-col items-center space-y-1">
          <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center">
            <Plus className="w-3 h-3" />
          </div>
          <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center">
            <Minus className="w-3 h-3" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LifestyleCard;