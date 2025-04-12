import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { customToast } from '@/components/CustomToast';
import { useAuth } from './AuthContext';

interface DailyLogContextType {
  isDailyLogCompleted: boolean;
  openDailyLogForm: () => void;
  completeDailyLog: (logData: DailyLogData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export interface DailyLogData {
  waterIntake: number;
  mood: string;
  weight: number;
  sleepHours: number;
  steps: number;
  mealQuality: string;
  symptoms?: string;
}

const DailyLogContext = createContext<DailyLogContextType | undefined>(undefined);

export const useDailyLog = () => {
  const context = useContext(DailyLogContext);
  if (context === undefined) {
    throw new Error('useDailyLog must be used within a DailyLogProvider');
  }
  return context;
};

interface DailyLogProviderProps {
  children: ReactNode;
}

export const DailyLogProvider: React.FC<DailyLogProviderProps> = ({ children }) => {
  const [isDailyLogCompleted, setIsDailyLogCompleted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<boolean>(false);
  const Router = useRouter()
  const { isAuthenticated } = useAuth()


  const openDailyLogForm = () => {
    Router.push('/log')
    setShowToast(false);
  };


  const completeDailyLog = async (logData: DailyLogData) => {
    setIsLoading(true);
    try {
      await axios.post('/dailLog', logData, {
        withCredentials: true
      });
      setIsDailyLogCompleted(true);
      customToast.success('Daily log completed successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete daily log';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    const checkDailyLogStatus = async () => {
      setIsLoading(true);
      try {
        console.log(process.env.NEXT_PUBLIC_BACKEND)
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND}/dailyLog/today`,
            {
              withCredentials: true,
            }
          );
        setIsDailyLogCompleted(response.data.success);
        
        // If daily log isn't completed, show the toast notification
        if (!response.data.success && !showToast) {
          setShowToast(true);
          toast((t) => (
            <div>
              <p>You haven't completed your daily log yet!</p>
              <button 
                onClick={() => {
                  openDailyLogForm();
                  toast.dismiss(t.id);
                }}
                className="mt-2 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
              >
                Complete Now
              </button>
            </div>
          ), { duration: Infinity });
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to check daily log status';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    checkDailyLogStatus();
    
    const intervalId = setInterval(checkDailyLogStatus, 60 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [isAuthenticated]);

  const value = {
    isDailyLogCompleted,
    openDailyLogForm,
    completeDailyLog,
    isLoading,
    error
  };

  return (
    <DailyLogContext.Provider value={value}>
      {children}
    </DailyLogContext.Provider>
  );
};