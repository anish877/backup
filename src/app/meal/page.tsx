"use client";
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Utensils, 
  Calendar, 
  ArrowLeft, 
  Loader2,
  Apple, 
  Coffee, 
  Flame, 
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useRouter } from 'next/navigation';

interface MealAssessment {
  date: string;
  score: number;
  categories: {[key: string]: number};
  type: string;
  time: string;
  description: string;
  calories: number;
  analysis: string;
  recommendations: string[];
}

const NutritionAnalysisDetails = () => {
  const router = useRouter();
  const [mealHistory, setMealHistory] = useState<MealAssessment[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<MealAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState(2000);
  const [dailyProteinGoal, setDailyProteinGoal] = useState(120);

  // Theme colors
  const themeColors = {
    primary: '#4f46e5',
    primaryLight: '#6366f1',
    secondary: '#ec4899',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    neutral: '#6b7280',
    background: '#ffffff',
    card: '#f9fafb',
    cardHeader: '#f3f4f6',
    text: '#1f2937',
    textLight: '#4b5563',
    border: '#e5e7eb',
    chartColors: ['#4f46e5', '#f59e0b', '#10b981', '#ec4899', '#6366f1', '#8b5cf6']
  };

  useEffect(() => {
    // Load meal history from localStorage
    const loadHistory = () => {
      try {
        const historyData = localStorage.getItem('mealTrackingHistory');
        if (historyData) {
          const parsedData = JSON.parse(historyData) as MealAssessment[];
          setMealHistory(parsedData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
          
          // Set the most recent assessment as selected
          if (parsedData.length > 0) {
            setSelectedMeal(parsedData[0]);
          }
        }
      } catch (error) {
        console.error("Error loading meal history:", error);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  // Get icon based on nutrition score
  const getNutritionIcon = (score: number) => {
    if (score >= 80) return <Heart className="w-5 h-5 text-indigo-600" />;
    if (score >= 65) return <Apple className="w-5 h-5 text-amber-500" />;
    if (score >= 50) return <Coffee className="w-5 h-5 text-emerald-500" />;
    return <Flame className="w-5 h-5 text-rose-500" />;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get color for category score
  const getCategoryColor = (score: number): string => {
    if (score >= 80) return 'text-indigo-600';
    if (score >= 65) return 'text-amber-500';
    if (score >= 50) return 'text-emerald-500';
    return 'text-rose-500';
  };

  // Get background color for progress bar
  const getProgressColor = (score: number): string => {
    if (score >= 80) return 'bg-indigo-600';
    if (score >= 65) return 'bg-amber-500';
    if (score >= 50) return 'bg-emerald-500';
    return 'bg-rose-500';
  };

  // Get nutrition label based on score
  const getNutritionLabel = (score: number): string => {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Fair";
    return "Needs improvement";
  };

  // Calculate total calories for a day from meals
  const calculateDailyCalories = (date: string): number => {
    const dayMeals = mealHistory.filter(meal => {
      const mealDate = new Date(meal.date);
      const compareDate = new Date(date);
      return mealDate.toDateString() === compareDate.toDateString();
    });
    
    return dayMeals.reduce((sum, meal) => sum + meal.calories, 0);
  };

  // Prepare trend data for charts - group by day
  const prepareTrendData = () => {
    const dailyData: { [key: string]: { date: string, score: number, calories: number, categories: {[key: string]: number} } } = {};
    
    mealHistory.forEach(meal => {
      const date = new Date(meal.date);
      const dateKey = `${date.getMonth() + 1}/${date.getDate()}`;
      
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          date: dateKey,
          score: 0,
          calories: 0,
          categories: {
            Protein: 0,
            Carbs: 0,
            Fats: 0,
            Vitamins: 0,
            Hydration: 0
          }
        };
      }
      
      // Add this meal's data to the daily totals
      dailyData[dateKey].calories += meal.calories;
      
      // Average the scores
      const mealsForDay = Object.keys(dailyData[dateKey].categories).length;
      dailyData[dateKey].score = (dailyData[dateKey].score * (mealsForDay - 1) + meal.score) / mealsForDay;
      
      // Average the category scores
      Object.entries(meal.categories).forEach(([category, score]) => {
        if (dailyData[dateKey].categories[category] !== undefined) {
          dailyData[dateKey].categories[category] = (dailyData[dateKey].categories[category] * (mealsForDay - 1) + score) / mealsForDay;
        }
      });
    });
    
    return Object.values(dailyData).slice(0, 10).reverse();
  };

  // Prepare pie data for selected meal
  const preparePieData = () => {
    if (!selectedMeal) return [];
    
    return Object.entries(selectedMeal.categories).map(([category, value], index) => ({
      name: category,
      value,
      color: themeColors.chartColors[index % themeColors.chartColors.length]
    }));
  };

  // Navigate back to dashboard
  const goBack = () => {
    router.push('/');
  };

  // Handle selecting a meal from history
  const handleSelectMeal = (meal: MealAssessment) => {
    setSelectedMeal(meal);
  };

  // Group meals by date
  const groupMealsByDate = () => {
    const grouped: { [key: string]: MealAssessment[] } = {};
    
    mealHistory.forEach(meal => {
      const date = new Date(meal.date).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(meal);
    });
    
    return grouped;
  };

  // Custom Tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-md">
          <p className="font-medium text-gray-700">{label}</p>
          {payload.map((item: any, index: number) => (
            <p key={index} style={{ color: item.color }} className="text-sm">
              {item.name}: {item.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={goBack} className="mr-4 text-gray-500 hover:text-gray-800">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Nutrition Analysis Dashboard</h1>
            <p className="text-gray-500">Detailed insights and historical trends of your nutritional intake</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : mealHistory.length === 0 ? (
          <Card className="shadow-md rounded-xl overflow-hidden bg-white border border-gray-200">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-4 p-4 rounded-full bg-gray-100 inline-block">
                <Utensils className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Meal Data</h3>
              <p className="text-gray-500 mb-6">Log your first meal to see detailed nutrition analytics and trends.</p>
              <Button onClick={goBack} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Go Back to Log Meal
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Meal history */}
            <div className="lg:col-span-1">
              <Card className="shadow-md rounded-xl overflow-hidden bg-white border border-gray-200 h-full">
                <CardHeader className="p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-indigo-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Meal History</h2>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[calc(100vh-280px)]">
                    <div className="divide-y divide-gray-200">
                      {Object.entries(groupMealsByDate()).map(([date, meals]) => (
                        <div key={date} className="p-0">
                          <div className="p-3 bg-gray-50">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-700">{new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                              <span className="text-sm text-indigo-600 font-medium">{meals.reduce((sum, meal) => sum + meal.calories, 0)} kcal</span>
                            </div>
                          </div>
                          
                          {meals.map((meal, mealIndex) => (
                            <div 
                              key={mealIndex}
                              onClick={() => handleSelectMeal(meal)}
                              className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                                selectedMeal && selectedMeal.date === meal.date ? 'bg-indigo-50' : ''
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="p-2 bg-gray-100 rounded-full">
                                    {getNutritionIcon(meal.score)}
                                  </div>
                                  <div>
                                    <div className="flex items-center space-x-2">
                                      <Badge className="bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs">
                                        {meal.type}
                                      </Badge>
                                      <span className="font-medium text-gray-800">{meal.score}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">{meal.time}</p>
                                    <p className="text-xs text-gray-500 line-clamp-1 mt-1">{meal.description}</p>
                                  </div>
                                </div>
                                <span className="text-sm text-indigo-600 font-medium">{meal.calories} kcal</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Right column - Analysis content */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full bg-white border-b border-gray-200 rounded-t-xl p-0">
                  <TabsTrigger value="overview" className="flex-1 py-3 rounded-none data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="trends" className="flex-1 py-3 rounded-none data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                    Trends
                  </TabsTrigger>
                  <TabsTrigger value="details" className="flex-1 py-3 rounded-none data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                    Details
                  </TabsTrigger>
                </TabsList>
                
                {selectedMeal ? (
                  <>
                    {/* Overview Tab */}
                    <TabsContent value="overview" className="mt-4 space-y-4">
                      <Card className="shadow-md rounded-xl overflow-hidden bg-white border border-gray-200">
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">Selected Meal</h3>
                              <p className="text-sm text-gray-500">{formatDate(selectedMeal.date)}</p>
                            </div>
                            <div className="flex items-center">
                              <span className="text-3xl font-bold text-gray-900 mr-2">{selectedMeal.score}</span>
                              <Badge className={`bg-${selectedMeal.score >= 80 ? 'indigo' : selectedMeal.score >= 65 ? 'amber' : selectedMeal.score >= 50 ? 'emerald' : 'rose'}-100 text-${selectedMeal.score >= 80 ? 'indigo' : selectedMeal.score >= 65 ? 'amber' : selectedMeal.score >= 50 ? 'emerald' : 'rose'}-700 border border-${selectedMeal.score >= 80 ? 'indigo' : selectedMeal.score >= 65 ? 'amber' : selectedMeal.score >= 50 ? 'emerald' : 'rose'}-200`}>
                                {getNutritionLabel(selectedMeal.score)}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <div className="flex items-center mb-2">
                              <Badge className="mr-2 bg-indigo-100 text-indigo-700 border border-indigo-200">
                                {selectedMeal.type}
                              </Badge>
                              <span className="text-sm text-gray-500">{selectedMeal.time}</span>
                            </div>
                            <p className="text-sm text-gray-700 mb-3">{selectedMeal.description}</p>
                            <div className="flex items-center">
                              <Flame className="h-4 w-4 text-indigo-600 mr-1" />
                              <span className="text-sm text-indigo-600 font-medium">{selectedMeal.calories} calories</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-medium text-gray-800 mb-3">Nutritional Breakdown</h4>
                              <div className="space-y-3">
                                {Object.entries(selectedMeal.categories).map(([category, score]) => (
                                  <div key={category} className="space-y-1">
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm text-gray-700">{category}</span>
                                      <span className={`text-sm font-medium ${getCategoryColor(score)}`}>{score}/100</span>
                                    </div>
                                    <Progress value={score} className="h-2 bg-gray-200">
                                      <div className={`h-full ${getProgressColor(score)}`} style={{width: `${score}%`}}></div>
                                    </Progress>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-gray-800 mb-3">Distribution</h4>
                              <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                    <Pie
                                      data={preparePieData()}
                                      cx="50%"
                                      cy="50%"
                                      labelLine={true}
                                      outerRadius={80}
                                      fill="#8884d8"
                                      dataKey="value"
                                      label={({ name, value }) => `${name}: ${value}`}
                                    >
                                      {preparePieData().map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                      ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                  </PieChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          </div>
                          
                          {/* Show Analysis */}
                          {selectedMeal.analysis && (
                            <div className="mt-6">
                              <h4 className="font-medium text-gray-800 mb-3">AI Analysis</h4>
                              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                <p className="text-sm text-gray-700">{selectedMeal.analysis}</p>
                              </div>
                            </div>
                          )}
                          
                          {/* Show Recommendations */}
                          {selectedMeal.recommendations && (
                            <div className="mt-4">
                              <h4 className="font-medium text-gray-800 mb-3">Recommendations</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {selectedMeal.recommendations.map((recommendation, index) => (
                                  <div key={index} className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                                    <div className="flex-shrink-0 bg-indigo-100 p-2 rounded-full mb-2">
                                      <Apple className="h-4 w-4 text-indigo-600" />
                                    </div>
                                    <p className="text-sm text-gray-700">{recommendation}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Trends Tab */}
                    <TabsContent value="trends" className="mt-4 space-y-4">
                      <Card className="shadow-md rounded-xl overflow-hidden bg-white border border-gray-200">
                        <CardContent className="p-5">
                          <h3 className="text-xl font-bold text-gray-900 mb-4">Nutrition Score Trends</h3>
                          
                          <div className="h-72 mb-6">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={prepareTrendData()} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis 
                                  dataKey="date" 
                                  stroke="#6b7280"
                                  tick={{ fill: '#4b5563' }}
                                  axisLine={{ stroke: '#d1d5db' }}
                                  tickLine={{ stroke: '#d1d5db' }}
                                />
                                <YAxis 
                                  domain={[0, 100]} 
                                  stroke="#6b7280"
                                  tick={{ fill: '#4b5563' }}
                                  axisLine={{ stroke: '#d1d5db' }}
                                  tickLine={{ stroke: '#d1d5db' }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                <Line 
                                  type="monotone" 
                                  dataKey="score" 
                                  stroke={themeColors.primary} 
                                  strokeWidth={3}
                                  dot={{ fill: themeColors.primary, r: 4 }}
                                  activeDot={{ r: 6, stroke: themeColors.primary, strokeWidth: 2 }}
                                  name="Overall Score" 
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                          
                          <Separator className="my-6 bg-gray-200" />
                          
                          <h3 className="text-xl font-bold text-gray-900 mb-4">Daily Calorie Intake</h3>
                          
                          <div className="h-72 mb-6">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={prepareTrendData()} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis 
                                  dataKey="date" 
                                  stroke="#6b7280"
                                  tick={{ fill: '#4b5563' }}
                                  axisLine={{ stroke: '#d1d5db' }}
                                  tickLine={{ stroke: '#d1d5db' }}
                                />
                                <YAxis 
                                  stroke="#6b7280"
                                  tick={{ fill: '#4b5563' }}
                                  axisLine={{ stroke: '#d1d5db' }}
                                  tickLine={{ stroke: '#d1d5db' }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                <Bar 
                                  dataKey="calories" 
                                  fill={themeColors.primary}
                                  radius={[4, 4, 0, 0]} 
                                  name="Calories" 
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                          
                          <Separator className="my-6 bg-gray-200" />
                          
                          <h3 className="text-xl font-bold text-gray-900 mb-4">Nutrient Category Trends</h3>
                          
                          <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={prepareTrendData()} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis 
                                  dataKey="date" 
                                  stroke="#6b7280"
                                  tick={{ fill: '#4b5563' }}
                                  axisLine={{ stroke: '#d1d5db' }}
                                  tickLine={{ stroke: '#d1d5db' }}
                                />
                                <YAxis 
                                  domain={[0, 100]} 
                                  stroke="#6b7280"
                                  tick={{ fill: '#4b5563' }}
                                  axisLine={{ stroke: '#d1d5db' }}
                                  tickLine={{ stroke: '#d1d5db' }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                <Line type="monotone" dataKey="categories.Protein" stroke={themeColors.chartColors[0]} strokeWidth={2} dot={{ fill: themeColors.chartColors[0], r: 3 }} name="Protein" />
                                <Line type="monotone" dataKey="categories.Carbs" stroke={themeColors.chartColors[1]} strokeWidth={2} dot={{ fill: themeColors.chartColors[1], r: 3 }} name="Carbs" />
                                <Line type="monotone" dataKey="categories.Fats" stroke={themeColors.chartColors[2]} strokeWidth={2} dot={{ fill: themeColors.chartColors[2], r: 3 }} name="Fats" />
                                <Line type="monotone" dataKey="categories.Vitamins" stroke={themeColors.chartColors[3]} strokeWidth={2} dot={{ fill: themeColors.chartColors[3], r: 3 }} name="Vitamins" />
                                <Line type="monotone" dataKey="categories.Hydration" stroke={themeColors.chartColors[4]} strokeWidth={2} dot={{ fill: themeColors.chartColors[4], r: 3 }} name="Hydration" />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Details Tab */}
                    <TabsContent value="details" className="mt-4">
                      <Card className="shadow-md rounded-xl overflow-hidden bg-white border border-gray-200">
                        <CardContent className="p-5">
                          <h3 className="text-xl font-bold text-gray-900 mb-4">Meal Details</h3>
                          <p className="text-sm text-gray-500 mb-4">{formatDate(selectedMeal.date)}</p>
                          
                          <div className="space-y-4">
                            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                              <h4 className="font-medium text-gray-800 mb-2">Meal Type</h4>
                              <div className="bg-white p-3 rounded-lg shadow-sm">
                                <p className="text-sm text-gray-700">{selectedMeal.type}</p>
                              </div>
                            </div>
                            
                            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                              <h4 className="font-medium text-gray-800 mb-2">Time</h4>
                              <div className="bg-white p-3 rounded-lg shadow-sm">
                                <p className="text-sm text-gray-700">{selectedMeal.time}</p>
                              </div>
                            </div>
                            
                            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                              <h4 className="font-medium text-gray-800 mb-2">Description</h4>
                              <div className="bg-white p-3 rounded-lg shadow-sm">
                                <p className="text-sm text-gray-700">{selectedMeal.description}</p>
                              </div>
                            </div>
                            
                            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                              <h4 className="font-medium text-gray-800 mb-2">Calories</h4>
                              <div className="bg-white p-3 rounded-lg shadow-sm">
                                <p className="text-sm text-gray-700">{selectedMeal.calories} kcal</p>
                              </div>
                            </div>
                            
                            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                              <h4 className="font-medium text-gray-800 mb-2">Nutrition Score</h4>
                              <div className="bg-white p-3 rounded-lg shadow-sm">
                              <p className="text-sm text-gray-700">{selectedMeal.score}/100 - {getNutritionLabel(selectedMeal.score)}</p>
                              </div>
                            </div>
                            
                            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                              <h4 className="font-medium text-gray-800 mb-2">Category Scores</h4>
                              <div className="bg-white p-3 rounded-lg shadow-sm space-y-2">
                                {Object.entries(selectedMeal.categories).map(([category, score]) => (
                                  <div key={category} className="flex justify-between">
                                    <span className="text-sm text-gray-700">{category}</span>
                                    <span className={`text-sm font-medium ${getCategoryColor(score)}`}>{score}/100</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                              <h4 className="font-medium text-gray-800 mb-2">Analysis</h4>
                              <div className="bg-white p-3 rounded-lg shadow-sm">
                                <p className="text-sm text-gray-700">{selectedMeal.analysis}</p>
                              </div>
                            </div>
                            
                            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                              <h4 className="font-medium text-gray-800 mb-2">Recommendations</h4>
                              <div className="bg-white p-3 rounded-lg shadow-sm space-y-3">
                                {selectedMeal.recommendations.map((recommendation, index) => (
                                  <div key={index} className="text-sm text-gray-700">
                                    <span className="inline-block w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-center mr-2">
                                      {index + 1}
                                    </span>
                                    {recommendation}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </>
                ) : (
                  <TabsContent value="overview" className="mt-4">
                    <Card className="shadow-md rounded-xl overflow-hidden bg-white border border-gray-200">
                      <CardContent className="p-8 text-center">
                        <div className="mx-auto mb-4 p-4 rounded-full bg-gray-100 inline-block">
                          <Utensils className="h-8 w-8 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Meal</h3>
                        <p className="text-gray-500">Please select a meal from the history to view detailed analysis.</p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}
              </Tabs>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NutritionAnalysisDetails;