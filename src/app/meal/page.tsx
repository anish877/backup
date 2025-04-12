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
    if (score >= 80) return <Heart className="w-5 h-5 text-orange-500" />;
    if (score >= 65) return <Apple className="w-5 h-5 text-orange-500" />;
    if (score >= 50) return <Coffee className="w-5 h-5 text-yellow-500" />;
    return <Flame className="w-5 h-5 text-red-500" />;
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
    if (score >= 80) return 'text-orange-500';
    if (score >= 65) return 'text-orange-600';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Get background color for progress bar
  const getProgressColor = (score: number): string => {
    if (score >= 80) return 'bg-orange-500';
    if (score >= 65) return 'bg-orange-600';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
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
    
    return Object.entries(selectedMeal.categories).map(([category, value]) => ({
      name: category,
      value,
      color: value >= 80 ? '#f97316' : value >= 65 ? '#ea580c' : value >= 50 ? '#eab308' : '#ef4444'
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

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={goBack} className="mr-4 text-zinc-400 hover:text-zinc-100">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-zinc-100">Nutrition Analysis Dashboard</h1>
            <p className="text-zinc-400">Detailed insights and historical trends of your nutritional intake</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : mealHistory.length === 0 ? (
          <Card className="border-0 shadow-lg rounded-xl overflow-hidden bg-zinc-900">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-4 p-4 rounded-full bg-zinc-800 inline-block">
                <Utensils className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-zinc-100 mb-2">No Meal Data</h3>
              <p className="text-zinc-400 mb-6">Log your first meal to see detailed nutrition analytics and trends.</p>
              <Button onClick={goBack} className="bg-orange-700 hover:bg-orange-600 text-white">
                Go Back to Log Meal
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Meal history */}
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-lg rounded-xl overflow-hidden bg-zinc-900 h-full">
                <CardHeader className="p-4 bg-gradient-to-r from-orange-900 to-orange-700 border-b border-orange-800">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-orange-300" />
                    <h2 className="text-lg font-semibold text-white">Meal History</h2>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[calc(100vh-280px)]">
                    <div className="divide-y divide-zinc-800">
                      {Object.entries(groupMealsByDate()).map(([date, meals]) => (
                        <div key={date} className="p-0">
                          <div className="p-3 bg-zinc-800/40">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-zinc-300">{new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                              <span className="text-sm text-orange-500">{meals.reduce((sum, meal) => sum + meal.calories, 0)} kcal</span>
                            </div>
                          </div>
                          
                          {meals.map((meal, mealIndex) => (
                            <div 
                              key={mealIndex}
                              onClick={() => handleSelectMeal(meal)}
                              className={`p-4 cursor-pointer hover:bg-zinc-800/50 transition-colors ${
                                selectedMeal && selectedMeal.date === meal.date ? 'bg-zinc-800' : ''
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="p-2 bg-zinc-800 rounded-full">
                                    {getNutritionIcon(meal.score)}
                                  </div>
                                  <div>
                                    <div className="flex items-center space-x-2">
                                      <Badge className="bg-orange-900/50 text-orange-300 border border-orange-800 text-xs">
                                        {meal.type}
                                      </Badge>
                                      <span className="font-medium text-zinc-100">{meal.score}</span>
                                    </div>
                                    <p className="text-xs text-zinc-400 mt-1">{meal.time}</p>
                                    <p className="text-xs text-zinc-400 line-clamp-1 mt-1">{meal.description}</p>
                                  </div>
                                </div>
                                <span className="text-sm text-orange-500">{meal.calories} kcal</span>
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
                <TabsList className="w-full bg-zinc-900 border-b border-zinc-800 rounded-t-xl p-0">
                  <TabsTrigger value="overview" className="flex-1 py-3 rounded-none data-[state=active]:bg-zinc-800">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="trends" className="flex-1 py-3 rounded-none data-[state=active]:bg-zinc-800">
                    Trends
                  </TabsTrigger>
                  <TabsTrigger value="details" className="flex-1 py-3 rounded-none data-[state=active]:bg-zinc-800">
                    Details
                  </TabsTrigger>
                </TabsList>
                
                {selectedMeal ? (
                  <>
                    {/* Overview Tab */}
                    <TabsContent value="overview" className="mt-4 space-y-4">
                      <Card className="border-0 shadow-lg rounded-xl overflow-hidden bg-zinc-900">
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-zinc-100">Selected Meal</h3>
                              <p className="text-sm text-zinc-400">{formatDate(selectedMeal.date)}</p>
                            </div>
                            <div className="flex items-center">
                              <span className="text-3xl font-bold text-zinc-100 mr-2">{selectedMeal.score}</span>
                              <Badge className="bg-orange-900/50 text-orange-300 border border-orange-700">
                                {getNutritionLabel(selectedMeal.score)}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="bg-zinc-800/30 p-4 rounded-lg mb-6">
                            <div className="flex items-center mb-2">
                              <Badge className="mr-2 bg-orange-900/50 text-orange-300 border border-orange-800">
                                {selectedMeal.type}
                              </Badge>
                              <span className="text-sm text-zinc-400">{selectedMeal.time}</span>
                            </div>
                            <p className="text-sm text-zinc-300 mb-3">{selectedMeal.description}</p>
                            <div className="flex items-center">
                              <Flame className="h-4 w-4 text-orange-500 mr-1" />
                              <span className="text-sm text-orange-500">{selectedMeal.calories} calories</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-medium text-zinc-300 mb-3">Nutritional Breakdown</h4>
                              <div className="space-y-3">
                                {Object.entries(selectedMeal.categories).map(([category, score]) => (
                                  <div key={category} className="space-y-1">
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm text-zinc-300">{category}</span>
                                      <span className={`text-sm font-medium ${getCategoryColor(score)}`}>{score}/100</span>
                                    </div>
                                    <Progress value={score} className="h-2 bg-zinc-800">
                                      <div className={`h-full ${getProgressColor(score)}`} style={{width: `${score}%`}}></div>
                                    </Progress>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-zinc-300 mb-3">Distribution</h4>
                              <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                    <Pie
                                      data={preparePieData()}
                                      cx="50%"
                                      cy="50%"
                                      labelLine={false}
                                      outerRadius={80}
                                      fill="#8884d8"
                                      dataKey="value"
                                      label={({ name, value }) => `${name}: ${value}`}
                                    >
                                      {preparePieData().map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                      ))}
                                    </Pie>
                                    <Tooltip />
                                  </PieChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          </div>
                          
                          {/* Show Analysis */}
                          {selectedMeal.analysis && (
                            <div className="mt-6">
                              <h4 className="font-medium text-zinc-300 mb-3">AI Analysis</h4>
                              <div className="bg-zinc-800/30 p-4 rounded-lg mb-4">
                                <p className="text-sm text-zinc-300">{selectedMeal.analysis}</p>
                              </div>
                            </div>
                          )}
                          
                          {/* Show Recommendations */}
                          {selectedMeal.recommendations && (
                            <div className="mt-4">
                              <h4 className="font-medium text-zinc-300 mb-3">Recommendations</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {selectedMeal.recommendations.map((recommendation, index) => (
                                  <div key={index} className="bg-orange-900/20 p-3 rounded-lg border border-orange-900/50">
                                    <div className="flex-shrink-0 bg-orange-800/70 p-2 rounded-full mb-2">
                                      <Apple className="h-4 w-4 text-orange-300" />
                                    </div>
                                    <p className="text-sm text-zinc-300">{recommendation}</p>
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
                      <Card className="border-0 shadow-lg rounded-xl overflow-hidden bg-zinc-900">
                        <CardContent className="p-5">
                          <h3 className="text-xl font-bold text-zinc-100 mb-4">Nutrition Score Trends</h3>
                          
                          <div className="h-72 mb-6">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={prepareTrendData()} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="date" stroke="#888" />
                                <YAxis domain={[0, 100]} stroke="#888" />
                                <Tooltip contentStyle={{ backgroundColor: '#222', borderColor: '#444' }} />
                                <Legend />
                                <Line type="monotone" dataKey="score" stroke="#f97316" strokeWidth={2} name="Overall Score" />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                          
                          <Separator className="my-6 bg-zinc-800" />
                          
                          <h3 className="text-xl font-bold text-zinc-100 mb-4">Daily Calorie Intake</h3>
                          
                          <div className="h-72 mb-6">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={prepareTrendData()} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="date" stroke="#888" />
                                <YAxis stroke="#888" />
                                <Tooltip contentStyle={{ backgroundColor: '#222', borderColor: '#444' }} />
                                <Legend />
                                <Bar dataKey="calories" fill="#f97316" name="Calories" />
                                {/* Reference line for daily goal */}
                                <Line type="horizontal" dataKey={dailyCalorieGoal} stroke="#888" strokeDasharray="3 3" name="Daily Goal" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                          
                          <Separator className="my-6 bg-zinc-800" />
                          
                          <h3 className="text-xl font-bold text-zinc-100 mb-4">Nutrient Category Trends</h3>
                          
                          <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={prepareTrendData()} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="date" stroke="#888" />
                                <YAxis domain={[0, 100]} stroke="#888" />
                                <Tooltip contentStyle={{ backgroundColor: '#222', borderColor: '#444' }} />
                                <Legend />
                                <Line type="monotone" dataKey="categories.Protein" stroke="#f97316" strokeWidth={2} name="Protein" />
                                <Line type="monotone" dataKey="categories.Carbs" stroke="#eab308" strokeWidth={2} name="Carbs" />
                                <Line type="monotone" dataKey="categories.Fats" stroke="#3b82f6" strokeWidth={2} name="Fats" />
                                <Line type="monotone" dataKey="categories.Vitamins" stroke="#a855f7" strokeWidth={2} name="Vitamins" />
                                <Line type="monotone" dataKey="categories.Hydration" stroke="#ec4899" strokeWidth={2} name="Hydration" />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Details Tab */}
                    <TabsContent value="details" className="mt-4">
                      <Card className="border-0 shadow-lg rounded-xl overflow-hidden bg-zinc-900">
                        <CardContent className="p-5">
                          <h3 className="text-xl font-bold text-zinc-100 mb-4">Meal Details</h3>
                          <p className="text-sm text-zinc-400 mb-4">{formatDate(selectedMeal.date)}</p>
                          
                          <div className="space-y-4">
                            <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-800/30">
                              <h4 className="font-medium text-zinc-300 mb-2">Meal Type</h4>
                              <div className="bg-zinc-800 p-3 rounded-lg">
                                <p className="text-sm text-zinc-300">{selectedMeal.type}</p>
                              </div>
                            </div>
                            
                            <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-800/30">
                              <h4 className="font-medium text-zinc-300 mb-2">Time</h4>
                              <div className="bg-zinc-800 p-3 rounded-lg">
                                <p className="text-sm text-zinc-300">{selectedMeal.time}</p>
                              </div>
                            </div>
                            
                            <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-800/30">
                              <h4 className="font-medium text-zinc-300 mb-2">Description</h4>
                              <div className="bg-zinc-800 p-3 rounded-lg">
                                <p className="text-sm text-zinc-300">{selectedMeal.description}</p>
                              </div>
                            </div>
                            
                            <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-800/30">
                              <h4 className="font-medium text-zinc-300 mb-2">Calories</h4>
                              <div className="bg-zinc-800 p-3 rounded-lg">
                                <p className="text-sm text-zinc-300">{selectedMeal.calories} kcal</p>
                              </div>
                            </div>
                            
                            <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-800/30">
                              <h4 className="font-medium text-zinc-300 mb-2">Nutrition Score</h4>
                              <div className="bg-zinc-800 p-3 rounded-lg">
                                <p className="text-sm text-zinc-300">
                                  {selectedMeal.score}/100 - {getNutritionLabel(selectedMeal.score)}
                                </p>
                              </div>
                            </div>
                            
                            <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-800/30">
                              <h4 className="font-medium text-zinc-300 mb-2">Nutritional Breakdown</h4>
                              <div className="bg-zinc-800 p-3 rounded-lg">
                                {Object.entries(selectedMeal.categories).map(([category, score]) => (
                                  <div key={category} className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-zinc-300">{category}</span>
                                    <span className={`text-sm font-medium ${getCategoryColor(score)}`}>{score}/100</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            {selectedMeal.analysis && (
                              <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-800/30">
                                <h4 className="font-medium text-zinc-300 mb-2">Analysis</h4>
                                <div className="bg-zinc-800 p-3 rounded-lg">
                                  <p className="text-sm text-zinc-300">{selectedMeal.analysis}</p>
                                </div>
                              </div>
                            )}
                            
                            {selectedMeal.recommendations && (
                              <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-800/30">
                                <h4 className="font-medium text-zinc-300 mb-2">Recommendations</h4>
                                <div className="bg-zinc-800 p-3 rounded-lg">
                                  <ul className="list-disc pl-5 space-y-1">
                                    {selectedMeal.recommendations.map((rec, index) => (
                                      <li key={index} className="text-sm text-zinc-300">{rec}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </>
                ) : (
                  <div className="mt-4 p-8 text-center bg-zinc-900 rounded-xl">
                    <p className="text-zinc-400">
                      Select a meal from the history to view details
                    </p>
                  </div>
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