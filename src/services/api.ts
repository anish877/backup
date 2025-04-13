// src/services/api.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BACKEND || 'https://healthbackend-kd4p.onrender.com';

// Create axios instance with credentials support
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

// Nutrition API functions
export const nutritionApi = {
  // Get all nutrition logs
  getNutritionLogs: async () => {
    try {
      const response = await apiClient.get('/nutrition/logs');
      return response.data;
    } catch (error) {
      console.error('Error fetching nutrition logs:', error);
      throw error;
    }
  },

  // Get specific nutrition log
  getNutritionLog: async (logId: string) => {
    try {
      const response = await apiClient.get(`/nutrition/logs/${logId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching nutrition log ${logId}:`, error);
      throw error;
    }
  },

  // Add a new meal
  addMeal: async (mealData: {
    mealType: string;
    mealTime: string;
    mealDescription: string;
    score: number;
    calories: number;
    analysis: string;
    recommendations: string[];
    protein: number;
    carbs: number;
    fats: number;
    vitamins: number;
  }) => {
    try {
      const response = await apiClient.post('/nutrition/meal', mealData);
      return response.data;
    } catch (error) {
      console.error('Error adding meal:', error);
      throw error;
    }
  },

  // Get nutrition statistics
  getNutritionStats: async (days = 7) => {
    try {
      const response = await apiClient.get(`/nutrition/stats?days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching nutrition stats:', error);
      throw error;
    }
  }
};

export default apiClient;