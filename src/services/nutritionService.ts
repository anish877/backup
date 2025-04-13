// src/services/nutritionService.js
import axios from 'axios';

// Base URL - adjust this based on your environment configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://healthbackend-kd4p.onrender.com/api';

const nutritionService = {
  // Get all nutrition logs
  getNutritionLogs: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/nutrition/logs`,{withCredentials:true});
      return response.data;
    } catch (error) {
      console.error('Error fetching nutrition logs:', error);
      throw error;
    }
  },

  // Get a specific nutrition log
  getNutritionLog: async (logId: any) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/nutrition/logs/${logId}`,{withCredentials:true});
      return response.data;
    } catch (error) {
      console.error('Error fetching nutrition log:', error);
      throw error;
    }
  },

  // Add a new meal entry
  addMealEntry: async (mealData: any) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/nutrition/meal`, mealData,{withCredentials:true});
      return response.data;
    } catch (error) {
      console.error('Error adding meal entry:', error);
      throw error;
    }
  },

  // Get nutrition statistics
  getNutritionStats: async (days = 7) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/nutrition/stats?days=${days}`,{withCredentials:true});
      return response.data;
    } catch (error) {
      console.error('Error fetching nutrition stats:', error);
      throw error;
    }
  }
};

export default nutritionService;