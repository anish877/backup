import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

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

  // Function to open daily log form (could trigger a modal or redirect)
  const openDailyLogForm = () => {
    Router.push('/log')
    setShowToast(false);
  };

  // Function to submit daily log data
  const completeDailyLog = async (logData: DailyLogData) => {
    setIsLoading(true);
    try {
      await axios.post('/api/daily-logs', logData);
      setIsDailyLogCompleted(true);
      toast.success('Daily log completed successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete daily log';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if the daily log has been completed for today
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
        console.log(response)
        setIsDailyLogCompleted(response.data.completed);
        
        // If daily log isn't completed, show the toast notification
        if (!response.data.sucess && !showToast) {
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
    
    // Check every hour if the page remains open
    const intervalId = setInterval(checkDailyLogStatus, 60 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

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