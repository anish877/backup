import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { customToast } from '@/components/CustomToast';
import { useAuth } from './AuthContext';
import { useWellness } from './WellnessContext';
import { Droplet, Moon, Smile, Utensils, ActivitySquare, Scale } from 'lucide-react';
import useLogStore from '@/store/manage';

interface DailyLogContextType {
  isDailyLogCompleted: boolean;
  openDailyLogForm: () => void;
  completeDailyLog: (logData: DailyLogData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  logNotifications: LogNotification[];
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

interface DailyProgress {
  nutrition?: boolean;
  mood?: boolean;
  sleep?: boolean;
  water?: boolean;
  completionPercentage?: number;
  dailyLogId?: string;
  exists?: boolean;
}

export interface LogNotification {
  id: number;
  title: string;
  description: string;
  type: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
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
    const { openWellnessModal } = useWellness();
    const { setLog, setMeal, setSleep, setMood, setWater, meal, water, mood, sleep } = useLogStore();
    const [isDailyLogCompleted, setIsDailyLogCompleted] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showToast, setShowToast] = useState<boolean>(false);
    const [dailyProgress, setDailyProgress] = useState<DailyProgress>({});
    const [activeNotifications, setActiveNotifications] = useState<LogNotification[]>([]);
    const Router = useRouter();
    const { isAuthenticated } = useAuth();

    const allLogNotifications: LogNotification[] = [
      {
        id: 1,
        title: "Water Intake",
        description: "Track your hydration for today",
        type: 'water',
        icon: Droplet,
        color: "text-black",
        bgColor: "bg-orange-100"
      },
      {
        id: 2,
        title: "Mood Check-in",
        description: "How are you feeling today?",
        type: 'mood',
        icon: Smile,
        color: "text-black",
        bgColor: "bg-orange-200"
      },
      {
        id: 3,
        title: "Sleep Tracker",
        description: "Log your sleep hours",
        type: 'sleep',
        icon: Moon,
        color: "text-black",
        bgColor: "bg-orange-100"
      },
      {
        id: 4,
        title: "Meal Quality",
        description: "Rate today's nutrition",
        type: 'meal',
        icon: Utensils,
        color: "text-black",
        bgColor: "bg-orange-200"
      }
    ];

    const openDailyLogForm = () => {
        Router.push('/');
        setShowToast(false);
    };

    const completeDailyLog = async (logData: DailyLogData) => {
        setIsLoading(true);
        try {
          await axios.post('https://healthbackend-production-157d.up.railway.app/dailLog', logData, {
              withCredentials: true
          });
          setIsDailyLogCompleted(true);
          customToast.success('Daily log completed successfully!');
          
          // Update our local state to reflect the completed items
          await fetchDailyProgress();
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to complete daily log';
          setError(errorMessage);
          toast.error(errorMessage);
        } finally {
          setIsLoading(false);
        }
    };

    // Update notifications based on daily progress
    useEffect(() => {
        if (dailyProgress) {
            const unfilled = allLogNotifications.filter(notification => {
                switch (notification.type) {
                    case 'water':
                        return !dailyProgress.water;
                    case 'mood':
                        return !dailyProgress.mood;
                    case 'sleep':
                        return !dailyProgress.sleep;
                    case 'meal':
                        return !dailyProgress.nutrition; // Map 'meal' notification to 'nutrition' field in API response
                    default:
                        return true;
                }
            });
            setActiveNotifications(unfilled);
            
            // If all required fields are filled, mark the daily log as completed
            const allCompleted = 
                dailyProgress.water === true &&
                dailyProgress.mood === true &&
                dailyProgress.sleep === true &&
                dailyProgress.nutrition === true;
                
            setIsDailyLogCompleted(allCompleted);
        }
    }, [dailyProgress]);

    const fetchDailyProgress = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(
                `https://healthbackend-production-157d.up.railway.app/daily-progress`,
                {
                    withCredentials: true,
                }
            );
            
            if (response.data && response.data.success) {
                const progressData = response.data.data;
                setDailyProgress({
                    exists: progressData.exists,
                    nutrition: progressData.progress.nutrition,
                    mood: progressData.progress.mood,
                    sleep: progressData.progress.sleep,
                    water: progressData.progress.water,
                    completionPercentage: progressData.completionPercentage,
                    dailyLogId: progressData.dailyLogId,
                });
                
                // Update Zustand store based on progress data
                setWater(progressData.progress.water || false);
                setMood(progressData.progress.mood || false);
                setSleep(progressData.progress.sleep || false);
                setMeal(progressData.progress.nutrition || false);
            }
            
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch daily progress';
            setError(errorMessage);
            console.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchDailyProgress();
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated && !isDailyLogCompleted && activeNotifications.length > 0 && !showToast) {
            setShowToast(true);
            toast((t) => (
                <div className="w-80 bg-white rounded-lg shadow-lg border border-gray-200">
                    <div className="bg-orange-500 text-white font-semibold px-4 py-2 rounded-t-lg">
                        Daily Log Reminder
                    </div>
                    <div className="p-4 space-y-3">
                        {activeNotifications.slice(0, 4).map(notification => (
                            <div key={notification.id} className="flex items-center justify-between bg-white p-3 rounded border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${notification.bgColor}`}>
                                        <notification.icon className="h-5 w-5 text-orange-500" />
                                    </div>
                                    <span className="text-black font-medium">{notification.title}</span>
                                </div>
                                <button 
                                    onClick={() => {
                                        if(notification.type === 'water'){
                                            openWellnessModal('water');
                                        } else if(notification.type === 'meal') {
                                            setLog('meal'); // Map 'meal' to 'nutrition' when setting log
                                        } else {
                                            //@ts-expect-error: no need here
                                            setLog(notification.type);
                                        }
                                        toast.dismiss(t.id);
                                    }}
                                    className="text-sm px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors font-medium"
                                >
                                    Log
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="px-4 pb-4">
                        <button 
                            onClick={() => {
                                openDailyLogForm();
                                toast.dismiss(t.id);
                            }}
                            className="w-full px-4 py-3 bg-black text-white rounded font-medium hover:bg-gray-800 transition-colors"
                        >
                            Complete Full Log
                        </button>
                    </div>
                </div>
            ), { duration: Infinity, position: 'bottom-right' });
        }
    }, [activeNotifications, isDailyLogCompleted, showToast]);

    useEffect(() => {
        if (isAuthenticated && !isDailyLogCompleted) {
            fetchDailyProgress();
        }
    }, [isAuthenticated, isDailyLogCompleted]);

    const value = {
        isDailyLogCompleted,
        openDailyLogForm,
        completeDailyLog,
        isLoading,
        error,
        logNotifications: activeNotifications
    };

    return (
        <DailyLogContext.Provider value={value}>
        {children}
        </DailyLogContext.Provider>
    );
};