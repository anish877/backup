
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Settings, Heart } from 'lucide-react';

const MetricItem = ({ 
  title, 
  subtitle, 
  date, 
  icon 
}: { 
  title: string; 
  subtitle: string; 
  date: string; 
  icon: React.ReactNode;
}) => {
  // Generate random dots
  const generateDots = (count: number) => {
    return Array.from({ length: count }, (_, i) => (
      <span 
        key={i} 
        className="inline-block w-1.5 h-1.5 rounded-full bg-brandOrange mx-0.5"
      ></span>
    ));
  };

  return (
    <div className="p-4 bg-gray-100 rounded-xl mb-3">
      <div className="flex justify-between mb-2">
        <div>
          <h4 className="font-medium">{title}</h4>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">{date}</span>
          <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
            {icon}
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {generateDots(5)}
        </div>
        <svg width="80" height="20">
          <path
            d="M0,10 C20,5 40,15 60,10 S80,5 100,10"
            fill="none"
            stroke="#4CAF50"
            strokeWidth="2"
          />
        </svg>
      </div>
      
      <div className="w-full bg-gray-200 h-1 rounded-full mt-2">
        <div className="relative w-full">
          <div className="absolute h-2 w-2 bg-gray-600 rounded-full -top-0.5" style={{ left: '20%' }}></div>
          <div className="absolute h-2 w-2 bg-gray-600 rounded-full -top-0.5" style={{ left: '60%' }}></div>
        </div>
      </div>
    </div>
  );
};

const HealthMetricsCard = () => {
  return (
    <div className="bg-[#1E3B33] p-6 rounded-3xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-5 h-5 rounded bg-brandOrange mr-2"></div>
          <h2 className="text-lg font-semibold text-white">Health Improvement</h2>
        </div>
        <div>
          <Settings className="text-white w-5 h-5" />
        </div>
      </div>

      <MetricItem 
        title="Medication" 
        subtitle="90% Up-to-date" 
        date="Sun, 29" 
        icon={<Heart className="w-3 h-3" />}
      />
      
      <MetricItem 
        title="Stress Levels" 
        subtitle="Now it's 4/10" 
        date="Mon, 30" 
        icon={<span className="text-xs">⚡</span>}
      />
      
      <MetricItem 
        title="Fitness Goals" 
        subtitle="Yoga 30 mins" 
        date="Tue, 31" 
        icon={<span className="text-xs">💪</span>}
      />
      
      <MetricItem 
        title="Vaccination" 
        subtitle="Number 3, 4 ?" 
        date="Wed, 01" 
        icon={<span className="text-xs">💉</span>}
      />

      <div className="mt-6 bg-[#0E1F1A] p-4 rounded-xl">
        <div className="flex justify-between mb-2">
          <div>
            <p className="text-xs text-gray-300">Diet and Nutrition</p>
            <h3 className="text-3xl font-bold text-white">2390<span className="text-sm">/kcal</span></h3>
          </div>
          <div className="relative w-16 h-16">
            <svg className="progress-ring" width="64" height="64">
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="#333"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="url(#orangeGradient)"
                strokeWidth="6"
                strokeDasharray="163.4"
                strokeDashoffset="40"
                fill="transparent"
              />
              <defs>
                <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FF5500" />
                  <stop offset="100%" stopColor="#FF8C00" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-brandOrange font-bold">
              89<span className="text-xs">%</span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-1 mt-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="w-2 h-2 bg-blue-400 rounded-full"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HealthMetricsCard;