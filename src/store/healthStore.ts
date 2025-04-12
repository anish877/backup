// src/store/useHealthStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types for our health data
export type HealthLog = {
  date: string;
  mood: number;
  sleepHours: number;
  waterConsumed: number;
  meals: string[];
  exercise: string;
  exerciseDuration: number;
  symptoms: string[];
  stressLevel: number;
};

export type HealthPlan = {
  waterIntake: string;
  sleepHours: string;
  exercise: string;
  meals: string[];
  tips: string[];
};

export type Feedback = {
  date: string;
  adherence: string;
  suggestions: string[];
  motivation: string;
};

export type UserProfile = {
  age: number;
  weight: number;
  gender?: 'male' | 'female' | 'other';
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very active';
  avatarUrl?: string;
  symptoms?: string[]
};

// The shape of our health store
interface HealthState {
  // State
  healthGoal: string;
  healthPlan: HealthPlan | null;
  dailyLogs: HealthLog[];
  feedback: Feedback[];
  isOnboarded: boolean;
  userProfile: UserProfile;

  // Actions
  setHealthGoal: (goal: string) => void;
  setHealthPlan: (plan: HealthPlan) => void;
  addDailyLog: (log: HealthLog) => void;
  updateDailyLog: (date: string, log: Partial<HealthLog>) => void;
  addFeedback: (feedback: Feedback) => void;
  completeOnboarding: () => void;
  resetHealthData: () => void;
  setUserProfile: (profile: UserProfile) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
}

// Create the store with persist middleware to save to localStorage
export const useHealthStore = create<HealthState>()(
  persist(
    (set) => ({
      // Initial state
      healthGoal: '',
      healthPlan: null,
      dailyLogs: [],
      feedback: [],
      isOnboarded: false,
      userProfile: {
        age: 0,
        weight: 0,
        gender: undefined,
        activityLevel: undefined,
        avatarUrl: undefined
      },

      // Actions
      setHealthGoal: (goal) => set({ healthGoal: goal }),
      
      setHealthPlan: (plan) => set({ healthPlan: plan }),
      
      addDailyLog: (log) => set((state) => ({
        dailyLogs: [...state.dailyLogs, log]
      })),
      
      updateDailyLog: (date, partialLog) => set((state) => ({
        dailyLogs: state.dailyLogs.map((log) => 
          log.date === date ? { ...log, ...partialLog } : log
        )
      })),
      
      addFeedback: (newFeedback) => set((state) => ({
        feedback: [...state.feedback, newFeedback]
      })),
      
      completeOnboarding: () => set({ isOnboarded: true }),
      
      resetHealthData: () => set({
        healthGoal: '',
        healthPlan: null,
        dailyLogs: [],
        feedback: [],
        isOnboarded: false,
        userProfile: {
          age: 0,
          weight: 0,
          gender: undefined,
          activityLevel: undefined,
          avatarUrl: undefined
        }
      }),
      
      setUserProfile: (profile) => set({ userProfile: profile }),
      
      updateUserProfile: (updates) => set((state) => ({
        userProfile: { ...state.userProfile, ...updates }
      }))
    }),
    {
      name: 'health-storage', // name for the localStorage key
    }
  )
);

// Optional: Helper functions that can be exported alongside the store
export const getHealthStats = (dailyLogs: HealthLog[]) => {
  if (dailyLogs.length === 0) {
    return {
      avgSleep: "-",
      avgWater: "-",
      avgMood: "-",
      totalExerciseMinutes: "-",
      logsCount: 0
    };
  }

  const totalSleep = dailyLogs.reduce((sum, log) => sum + log.sleepHours, 0);
  const totalWater = dailyLogs.reduce((sum, log) => sum + log.waterConsumed, 0);
  const totalMood = dailyLogs.reduce((sum, log) => sum + log.mood, 0);
  const totalExercise = dailyLogs.reduce((sum, log) => sum + log.exerciseDuration, 0);
  
  return {
    avgSleep: (totalSleep / dailyLogs.length).toFixed(1),
    avgWater: (totalWater / dailyLogs.length).toFixed(1),
    avgMood: (totalMood / dailyLogs.length).toFixed(1),
    totalExerciseMinutes: totalExercise.toString(),
    logsCount: dailyLogs.length
  };
};

export const formatActivityLevel = (level: string) => {
  return level.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};