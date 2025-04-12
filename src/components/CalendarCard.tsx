import React from 'react';
import { cn } from '@/lib/utils';

const CalendarCard = () => {
  const days = Array.from({length: 11}, (_, i) => i + 1);
  
  return (
    <div className="bg-orange-400 p-6 rounded-3xl relative min-h-full">
      {/* <img 
        src="/api/placeholder/400/600" 
        alt="Profile" 
        className="absolute right-0 top-0 h-full object-cover opacity-60"
      /> */}
      <div className="relative z-10">
        <h2 className="text-4xl font-bold text-white">August <span className="opacity-60">Work</span></h2>
        
        <div className="flex space-x-2 mt-4 mb-8">
          {days.map((day) => (
            <div key={day} className="text-white text-xs text-center w-6">
              {day}
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {[
            { label: 'Fitness Goals', selected: true },
            { label: 'My Check-ups', selected: false },
            { label: 'Body Mass (BMI)', selected: false }
          ].map((item) => (
            <div key={item.label} className="flex items-center">
              <div className={cn("h-2 w-2 rounded-full bg-white", item.selected ? "mr-3" : "mr-5")}></div>
              <div className={cn(
                "px-3 py-1 rounded-full", 
                item.selected ? "bg-white text-orange-500" : "border border-white text-white"
              )}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarCard;