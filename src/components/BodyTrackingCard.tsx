
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Settings } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const BodyTrackingCard = () => {
  return (
    <div className="bg-white p-6 rounded-3xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-5 h-5 rounded bg-brandOrange mr-2"></div>
          <h2 className="text-lg font-semibold">Body Health Tracking</h2>
        </div>
        <MoreHorizontal className="w-5 h-5 text-gray-500" />
      </div>

      <div className="flex mb-8">
        <div className="flex-1">
          <div className="mb-1">
            <Badge className="bg-brandOrange text-white">+40%</Badge>
          </div>
          <h3 className="text-sm text-gray-500">Breathing</h3>
          <div className="flex items-baseline mt-1">
            <span className="text-4xl font-bold">139</span>
            <span className="text-sm text-gray-500 ml-1">/150h</span>
            <span className="text-xs text-gray-400 ml-2">2min</span>
          </div>
          
          <div className="flex space-x-1 mt-4">
            {[...Array(10)].map((_, i) => (
              <span 
                key={i} 
                className="inline-block w-2 h-2 rounded-full" 
                style={{ 
                  backgroundColor: i < 5 ? '#FF5500' : (i < 8 ? '#9C27B0' : '#4CAF50')
                }}
              ></span>
            ))}
          </div>
        </div>
        
        <div className="flex items-center">
          <img 
            src="/lovable-uploads/a6ceadf4-1747-4ad6-a0c6-d78ff8e109e3.png" 
            alt="Body tracking" 
            className="h-32"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm">Check</span>
          <div className="flex items-center">
            <span className="text-sm">60% Mammograms, 50% Colonoscopies</span>
            <Avatar className="w-6 h-6 ml-2">
              <AvatarFallback>⚪</AvatarFallback>
            </Avatar>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm">Check</span>
          <div className="flex items-center">
            <span className="text-sm">Breath Level is Normal 139/150h (2min)</span>
            <Avatar className="w-6 h-6 ml-2">
              <AvatarImage src="/lovable-uploads/a6ceadf4-1747-4ad6-a0c6-d78ff8e109e3.png" />
              <AvatarFallback>👤</AvatarFallback>
            </Avatar>
          </div>
        </div>
        
        <div className="mt-4 py-2">
          <div className="flex items-center justify-between">
            <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">Checking</span>
            <div className="flex items-center">
              <span className="text-sm">70% Annual, 20% Bi-annual, 10% None</span>
              <div className="ml-2">
                <Settings className="w-5 h-5" />
              </div>
            </div>
          </div>
          
          <div className="w-full h-2 bg-gradient-to-r from-gray-300 via-brandOrange to-brandOrange rounded-full mt-2"></div>
        </div>
      </div>
    </div>
  );
};

export default BodyTrackingCard;