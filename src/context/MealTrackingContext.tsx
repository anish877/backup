// src/contexts/MealTrackingContext.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import MealTrackingCard from '@/components/MealTrackingCard'; // Adjust the import path as needed

// Define the context type
type MealTrackingContextType = {
  openMealTrackingModal: () => void;
  closeMealTrackingModal: () => void;
};

// Create the context with default values
const MealTrackingContext = createContext<MealTrackingContextType>({
  openMealTrackingModal: () => {},
  closeMealTrackingModal: () => {},
});

// Hook to use the meal tracking context
export const useMealTracking = () => useContext(MealTrackingContext);

// Provider component
export const MealTrackingProvider = ({ children }: { children: ReactNode }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openMealTrackingModal = () => setIsModalOpen(true);
  const closeMealTrackingModal = () => setIsModalOpen(false);

  return (
    <MealTrackingContext.Provider 
      value={{ openMealTrackingModal, closeMealTrackingModal }}
    >
      {children}
      
      {/* Modal that can be triggered from anywhere */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          <MealTrackingCard />
        </DialogContent>
      </Dialog>
    </MealTrackingContext.Provider>
  );
};