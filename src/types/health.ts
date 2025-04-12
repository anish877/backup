// src/types/health.ts
// This file centralizes all type definitions related to health data

// User profile information
export interface UserProfile {
    age: number;
    weight: number;
    gender?: 'male' | 'female' | 'other';
    activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very active';
    avatarUrl?: string;
  }
  
  // Daily health log entry
  export interface HealthLog {
    date: string;
    mood: number;
    sleepHours: number;
    waterConsumed: number;
    meals: string[];
    exercise: string;
    exerciseDuration: number;
    symptoms: string[];
    stressLevel: number;
  }
  
  // Health plan based on user goals
  export interface HealthPlan {
    waterIntake: string;
    sleepHours: string;
    exercise: string;
    meals: string[];
    tips: string[];
  }
  
  // AI-generated feedback
  export interface Feedback {
    date: string;
    adherence: string;
    suggestions: string[];
    motivation: string;
  }
  
  // Health statistics derived from logs
  export interface HealthStats {
    avgSleep: string;
    avgWater: string;
    avgMood: string;
    totalExerciseMinutes: string;
    logsCount: number;
  }
  
  // Goals that users can select
  export type HealthGoal = 
    | 'Weight Loss'
    | 'Muscle Gain'
    | 'Better Sleep'
    | 'Increase Energy'
    | 'Reduce Stress'
    | 'Improve Fitness'
    | 'Better Nutrition'
    | 'Custom Goal';
  
  // Form schema for log entry (useful with react-hook-form)
  export interface LogFormValues {
    mood: number;
    sleepHours: number;
    waterConsumed: number;
    meals: string[];
    exercise: string;
    exerciseDuration: number;
    symptoms: string[];
    stressLevel: number;
    notes?: string;
  }