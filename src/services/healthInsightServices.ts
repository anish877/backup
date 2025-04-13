// src/services/healthInsightsService.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BACKEND || 'https://healthbackend-kd4p.onrender.com';

export interface TimeSeriesDataPoint {
  date: string;
  sleep: number;
  mood: number;
  water: number;
  nutrition: number;
}

export interface ProgressMetrics {
  sleep: number;
  mood: number;
  water: number;
  nutrition: number;
}

export interface HealthInsights {
  timeSeriesData: TimeSeriesDataPoint[];
  progress: ProgressMetrics;
  commonRecommendations: string[];
}

export const fetchHealthInsights = async (): Promise<HealthInsights> => {
  try {
    const response = await axios.get(`${API_URL}/insights/health-insights`, {
      withCredentials: true, // Important for sending cookies
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching health insights:', error);
    throw error;
  }
};