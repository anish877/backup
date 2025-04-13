// src/store/healthStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BACKEND || 'http://localhost:3001';

// Types for health data
export interface NutritionLog {
  id?: string;
  finalScore: number;
  protein: number;
  fats: number;
  carbs: number;
  vitamins: number;
  calories: number;
  dailyRecommendations?: string[];
  date: Date;
}

export interface SleepLog {
  id?: string;
  finalScore: number;
  quality: number;
  duration: number;
  consistency: number;
  environment: number;
  habits: number;
  dailyRecommendations?: string[];
  date: Date;
}

export interface MoodLog {
  id?: string;
  finalScore: number;
  happiness: number;
  energy: number;
  focus: number;
  calm: number;
  optimism: number;
  dailyRecommendations?: string[];
  date: Date;
}

export interface WaterLog {
  id?: string;
  finalScore: number;
  dailyRecommendations?: string[];
  date: Date;
}

export interface DailyLog {
  id?: string;
  date: Date;
  nutrition?: NutritionLog;
  sleep?: SleepLog;
  mood?: MoodLog;
  water?: WaterLog;
  metadata?: {
    age?: number;
    weight?: number;
    gender?: 'male' | 'female' | 'other';
    activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very active';
  };
}

export interface UserProfile {
  age: number;
  weight: number;
  gender?: 'male' | 'female' | 'other';
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very active';
  avatarUrl?: string;
  symptoms?: string[];
}

export interface HealthStats {
  avgSleep: number | string;
  avgWater: number | string;
  avgMood: number | string;
  totalExerciseMinutes: number | string;
  logsCount: number;
}

// Health store interface
interface HealthState {
  // State
  healthGoal: string;
  dailyLogs: DailyLog[];
  isOnboarded: boolean;
  userProfile: UserProfile;
  isLoading: boolean;
  error: string | null;

  // Actions
  setHealthGoal: (goal: string) => void;
  addDailyLog: (log: DailyLog) => void;
  setDailyLogs: (logs: DailyLog[]) => void;
  updateDailyLog: (id: string, log: Partial<DailyLog>) => void;
  completeOnboarding: () => void;
  resetHealthData: () => void;
  setUserProfile: (profile: UserProfile) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  
  // Profile page specific functions
  fetchUserProfile: () => Promise<void>;
  updateProfile: (updatedProfile: Partial<UserProfile> & { username?: string, goal?: string }) => Promise<void>;
  deleteAccount: () => Promise<void>;
  exportHealthData: () => string;
}

// Create the store with persist middleware
export const useHealthStore = create<HealthState>()(
  persist(
    (set, get) => ({
      // Initial state
      healthGoal: '',
      dailyLogs: [],
      isOnboarded: false,
      userProfile: {
        age: 0,
        weight: 0,
        gender: undefined,
        activityLevel: undefined,
        avatarUrl: undefined,
      },
      isLoading: false,
      error: null,

      // Basic actions
      setHealthGoal: (goal) => set({ healthGoal: goal }),
      
      addDailyLog: (log) => set((state) => ({
        dailyLogs: [...state.dailyLogs, log]
      })),
      
      setDailyLogs: (logs) => set({ dailyLogs: logs }),
      
      updateDailyLog: (id, partialLog) => set((state) => ({
        dailyLogs: state.dailyLogs.map((log) => 
          log.id === id ? { ...log, ...partialLog } : log
        )
      })),
      
      completeOnboarding: () => set({ isOnboarded: true }),
      
      resetHealthData: () => set({
        healthGoal: '',
        dailyLogs: [],
        isOnboarded: false,
        userProfile: {
          age: 0,
          weight: 0,
          gender: undefined,
          activityLevel: undefined,
          avatarUrl: undefined
        },
        isLoading: false,
        error: null
      }),
      
      setUserProfile: (profile) => set({ userProfile: profile }),
      
      updateUserProfile: (updates) => set((state) => ({
        userProfile: { ...state.userProfile, ...updates }
      })),
      
      // Profile page specific functions
      fetchUserProfile: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await axios.get(`${API_URL}/users/profile`, {
            withCredentials: true, // Important for sending cookies
          });
          
          const userData = response.data;
          
          // Update store with user data
          set({
            userProfile: {
              age: userData.age || get().userProfile.age,
              weight: userData.weight || get().userProfile.weight,
              gender: userData.gender || get().userProfile.gender,
              activityLevel: userData.activityLevel || get().userProfile.activityLevel,
              avatarUrl: userData.avatarUrl || get().userProfile.avatarUrl,
              symptoms: userData.symptoms || get().userProfile.symptoms,
            },
            healthGoal: userData.goal || get().healthGoal,
            dailyLogs: userData.dailyLogs || get().dailyLogs,
            isLoading: false
          });
          
        } catch (err) {
          console.error('Error fetching user profile:', err);
          set({ 
            isLoading: false, 
            error: err.response?.data?.message || 'Failed to load user profile' 
          });
          throw err;
        }
      },
      
      updateProfile: async (updatedProfile) => {
        try {
          set({ isLoading: true, error: null });
          
          // Update user profile in API
          const response = await axios.put(`${API_URL}/users/profile`, {
            username: updatedProfile.username,
            goal: updatedProfile.goal,
            age: updatedProfile.age ? Number(updatedProfile.age) : undefined,
            weight: updatedProfile.weight ? Number(updatedProfile.weight) : undefined,
            gender: updatedProfile.gender,
            activityLevel: updatedProfile.activityLevel
          }, {
            withCredentials: true
          });
          
          // Update local store with updated values
          set((state) => ({
            userProfile: {
              ...state.userProfile,
              age: updatedProfile.age !== undefined ? Number(updatedProfile.age) : state.userProfile.age,
              weight: updatedProfile.weight !== undefined ? Number(updatedProfile.weight) : state.userProfile.weight,
              gender: updatedProfile.gender !== undefined ? updatedProfile.gender : state.userProfile.gender,
              activityLevel: updatedProfile.activityLevel !== undefined ? updatedProfile.activityLevel : state.userProfile.activityLevel,
            },
            healthGoal: updatedProfile.goal || state.healthGoal,
            isLoading: false
          }));
          
          return response.data;
        } catch (err) {
          console.error('Error updating profile:', err);
          set({ 
            isLoading: false, 
            error: err.response?.data?.message || 'Failed to update profile' 
          });
          throw err;
        }
      },
      
      deleteAccount: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // Call delete API endpoint
          await axios.delete(`${API_URL}/users/profile`, {
            withCredentials: true,
          });
          
          // Reset local store
          get().resetHealthData();
          
          set({ isLoading: false });
        } catch (err) {
          console.error('Error deleting account:', err);
          set({ 
            isLoading: false, 
            error: err.response?.data?.message || 'Failed to delete account' 
          });
          throw err;
        }
      },
      
      exportHealthData: () => {
        // Create a downloadable JSON with health data
        const exportData = {
          profile: {
            ...get().userProfile,
            goal: get().healthGoal
          },
          logs: get().dailyLogs
        };
        
        return JSON.stringify(exportData, null, 2);
      }
    }),
    {
      name: 'health-storage', // name for the localStorage key
    }
  )
);

// Helper functions
export const getHealthStats = (dailyLogs: DailyLog[]): HealthStats => {
  if (dailyLogs.length === 0) {
    return {
      avgSleep: 0,
      avgWater: 0,
      avgMood: 0,
      totalExerciseMinutes: 0,
      logsCount: 0
    };
  }

  let totalSleep = 0;
  let sleepCount = 0;
  let totalWater = 0;
  let waterCount = 0;
  let totalMood = 0;
  let moodCount = 0;
  let totalExerciseMinutes = 0;
  
  dailyLogs.forEach(log => {
    if (log.sleep) {
      totalSleep += log.sleep.duration;
      sleepCount++;
    }
    
    if (log.water) {
      totalWater += log.water.finalScore;
      waterCount++;
    }
    
    if (log.mood) {
      totalMood += log.mood.finalScore;
      moodCount++;
    }
    
    // Assuming exercise data is stored somewhere in the log
    // This would need to be adjusted based on actual data structure
    if (log.metadata?.exerciseMinutes) {
      totalExerciseMinutes += log.metadata.exerciseMinutes;
    }
  });
  
  return {
    avgSleep: sleepCount > 0 ? +(totalSleep / sleepCount).toFixed(1) : 0,
    avgWater: waterCount > 0 ? +(totalWater / waterCount).toFixed(1) : 0,
    avgMood: moodCount > 0 ? +(totalMood / moodCount).toFixed(1) : 0,
    totalExerciseMinutes: totalExerciseMinutes,
    logsCount: dailyLogs.length
  };
};

export const formatActivityLevel = (level: string): string => {
  return level.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};