"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import MealTrackingCard from '@/components/MealTrackingCard';
import SleepTrackingCard from '@/components/SleepTrackingCard';
import MoodAnalysisCard from '@/components/MoodAnalysisCard';
import WaterGlassTracker from '@/components/WaterTracker';


export type WellnessComponentType = 'sleep' | 'mood' | 'water' | 'meal' | null;


type WellnessContextType = {
  openWellnessModal: (componentType: WellnessComponentType) => void;
  closeWellnessModal: () => void;
};


const WellnessContext = createContext<WellnessContextType | undefined>(undefined);


export const useWellness = () => {
  const context = useContext(WellnessContext);
  if (!context) {
    throw new Error("useWellness must be used within a WellnessProvider");
  }
  return context;
};


type WellnessProviderProps = {
  children: ReactNode;
};


export const WellnessProvider = ({ children }: WellnessProviderProps) => {
  const [activeComponent, setActiveComponent] = useState<WellnessComponentType>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openWellnessModal = (componentType: WellnessComponentType) => {
    setActiveComponent(componentType);
    setIsModalOpen(true);
  };

  const closeWellnessModal = () => {
    setIsModalOpen(false);
  };


  const getModalTitle = () => {
    switch (activeComponent) {
      case 'sleep':
        return 'Sleep Tracking';
      case 'meal':
        return 'Meal Analysis';
      case 'mood':
        return 'Mood Analysis';
      case 'water':
        return 'Water Tracker';
      default:
        return 'Wellness Tracker';
    }
  };

  // Get modal description based on active component
  const getModalDescription = () => {
    switch (activeComponent) {
      case 'sleep':
        return 'Track and improve your sleep quality';
      case 'mood':
        return 'Monitor and enhance your emotional well-being';
      case 'water':
        return 'Stay hydrated throughout the day';
      default:
        return '';
    }
  };

  // Render the component based on the active type
  const renderComponent = () => {
    switch (activeComponent) {
      case 'sleep':
        return <SleepTrackingCard />;
      case 'meal':
        return <MealTrackingCard />;
      case 'mood':
        return <MoodAnalysisCard />;
      case 'water':
        return <WaterGlassTracker />;
      default:
        return null;
    }
  };

  return (
    <WellnessContext.Provider value={{ openWellnessModal, closeWellnessModal }}>
      {children}
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle>{getModalTitle()}</DialogTitle>
              <DialogClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
            <DialogDescription>{getModalDescription()}</DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {renderComponent()}
          </div>
        </DialogContent>
      </Dialog>
    </WellnessContext.Provider>
  );
};