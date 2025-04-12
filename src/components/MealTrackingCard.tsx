"use client";
'use client'
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Utensils, Settings, ArrowRight, Loader2, BarChart, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useRouter } from 'next/navigation';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API client
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

const MealTrackingCard = () => {
  const router = useRouter();
  
  // States for UI
  const [showMealEntry, setShowMealEntry] = useState(false);
  const [showMealHistory, setShowMealHistory] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [mealType, setMealType] = useState<string>("");
  const [mealDescription, setMealDescription] = useState<string>("");
  const [mealTime, setMealTime] = useState<string>("");
  const [nutritionScore, setNutritionScore] = useState(72);
  const [entryComplete, setEntryComplete] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([
    "Add more leafy greens to increase vitamins A, C, and K intake",
    "Consider reducing added sugars in your afternoon snacks",
    "Include lean protein sources at every meal for muscle maintenance"
  ]);
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  const [lastAssessmentDate, setLastAssessmentDate] = useState("Today");
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [nutritionCategories, setNutritionCategories] = useState<{[key: string]: number}>({
    "Protein": 65,
    "Carbs": 78,
    "Fats": 70,
    "Vitamins": 75,
    "Hydration": 60
  });
  const [calorieIntake, setCalorieIntake] = useState(1850);
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [mealHistory, setMealHistory] = useState<Array<{
    id: string;
    date: string;
    type: string;
    time: string;
    description: string;
    score: number;
    calories: number;
    analysis: string;
    categories: {[key: string]: number};
  }>>([]);
  const [dailyCalories, setDailyCalories] = useState(1850);
  const [scoreHistory, setScoreHistory] = useState<number[]>([72]);

  // Prepare data for pie chart
  const pieData = [
    { name: 'Nutrition Score', value: nutritionScore, color: '#F97316' },
    { name: 'Remaining', value: 100 - nutritionScore, color: '#FED7AA' }
  ];

  // Function to call Gemini API directly
  const callGeminiAPI = async (prompt: string): Promise<string> => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      throw error;
    }
  };

  // Prepare meal history context for AI prompt
  const prepareMealHistoryContext = () => {
    if (mealHistory.length === 0) return "No previous meals logged today.";
    
    return mealHistory.map((meal, index) => {
      return `Meal #${index + 1}:
Type: ${meal.type}
Time: ${meal.time}
Description: ${meal.description}
Score: ${meal.score}
Calories: ${meal.calories}`;
    }).join("\n\n");
  };

  // Generate today's date in "Month Day, Year" format
  const getTodayDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  // Handle meal entry submission
  const handleMealSubmit = async () => {
    setEntryComplete(true);
    setIsGeneratingAnalysis(true);
    
    try {
      // Get meal history context
      const mealHistoryContext = prepareMealHistoryContext();
      
      // Prepare the prompt for the AI analysis
      const promptForAnalysis = `Analyze this meal entry for nutritional assessment, taking into account previous meals today:

PREVIOUS MEALS TODAY:
${mealHistoryContext}

CURRENT MEAL:
Meal Type: ${mealType}
Time: ${mealTime}
Meal Description: ${mealDescription}

Please provide:
1. A detailed nutritional analysis of this meal (2-3 sentences), mentioning how it complements or impacts the overall diet based on previous meals today
2. Exactly 3 specific, actionable recommendations to improve nutritional intake for next meals, considering what's already been consumed
3. An estimate of calories in this meal
4. A nutritional breakdown across these 5 categories, with scores between 0-100:
   - Protein (quality and quantity)
   - Carbs (complex vs simple, fiber content)
   - Fats (healthy vs unhealthy)
   - Vitamins/Minerals (variety and adequacy)
   - Hydration (if mentioned)
5. An updated overall nutrition score (0-100) considering all meals logged today

Format your response exactly like this:
ANALYSIS: [2-3 sentence personalized analysis]

RECOMMENDATIONS:
[First recommendation under 15 words]
[Second recommendation under 15 words]
[Third recommendation under 15 words]

CALORIES: [number]

CATEGORY_SCORES:
Protein: [score]
Carbs: [score]
Fats: [score]
Vitamins: [score]
Hydration: [score]

OVERALL_SCORE: [score]`;

      // Call Gemini API
      const aiResponse = await callGeminiAPI(promptForAnalysis);
      
      // Parse the response
      const analysisMatch = aiResponse.match(/ANALYSIS:(.*?)(?=\n\nRECOMMENDATIONS:|\n\nCALORIES:|\n\nCATEGORY_SCORES:|$)/s);
      const recommendationsMatch = aiResponse.match(/RECOMMENDATIONS:(.*?)(?=\n\nCALORIES:|\n\nCATEGORY_SCORES:|$)/s);
      const caloriesMatch = aiResponse.match(/CALORIES:\s*(\d+)/);
      const categoryScoresMatch = aiResponse.match(/CATEGORY_SCORES:(.*?)(?=\n\nOVERALL_SCORE:|$)/s);
      const overallScoreMatch = aiResponse.match(/OVERALL_SCORE:\s*(\d+)/);
      
      // Set AI analysis
      let mealAnalysis = "This meal provides a moderate nutritional profile with some key nutrients, but could be more balanced. The proportion of macronutrients is slightly carbohydrate-heavy with adequate protein content.";
      if (analysisMatch && analysisMatch[1]) {
        mealAnalysis = analysisMatch[1].trim();
        setAiAnalysis(mealAnalysis);
      } else {
        setAiAnalysis(mealAnalysis);
      }
      
      // Set recommendations
      if (recommendationsMatch && recommendationsMatch[1]) {
        const recLines = recommendationsMatch[1].trim().split('\n').filter(line => line.trim() !== '');
        if (recLines.length >= 3) {
          setRecommendations(recLines.slice(0, 3));
        }
      }
      
      // Set calorie intake for this meal
      let mealCalories = 550; // Default value
      if (caloriesMatch && caloriesMatch[1]) {
        mealCalories = parseInt(caloriesMatch[1]);
      }
      
      // Update total daily calories
      const newDailyCalories = dailyCalories + mealCalories;
      setDailyCalories(newDailyCalories);
      setCalorieIntake(newDailyCalories);
      
      // Set category scores
      let categoryScores: {[key: string]: number} = {
        "Protein": 65,
        "Carbs": 70,
        "Fats": 65,
        "Vitamins": 60,
        "Hydration": 55
      };
      
      if (categoryScoresMatch && categoryScoresMatch[1]) {
        const scoreLines = categoryScoresMatch[1].trim().split('\n');
        
        scoreLines.forEach(line => {
          const parts = line.split(':');
          if (parts.length === 2) {
            const [category, scoreStr] = parts.map(s => s.trim());
            if (category && scoreStr) {
              const score = parseInt(scoreStr);
              if (!isNaN(score)) {
                categoryScores[category] = score;
              }
            }
          }
        });
      }
      setNutritionCategories(categoryScores);
      
      // Set overall nutrition score
      let overallScore = 70; // Default value
      if (overallScoreMatch && overallScoreMatch[1]) {
        overallScore = parseInt(overallScoreMatch[1]);
      } else {
        // Calculate from category scores if not provided
        const avgScore = Math.round(Object.values(categoryScores).reduce((sum, s) => sum + s, 0) / Object.keys(categoryScores).length);
        overallScore = avgScore;
      }
      setNutritionScore(overallScore);
      
      // Update score history
      setScoreHistory(prev => [...prev, overallScore]);
      
      // Add to meal history
      const newMeal = {
        id: Date.now().toString(),
        date: getTodayDate(),
        type: mealType,
        time: mealTime,
        description: mealDescription,
        score: overallScore,
        calories: mealCalories,
        analysis: mealAnalysis,
        categories: categoryScores
      };

      try{

      } catch (error) {

      }
      
      setMealHistory(prev => [...prev, newMeal]);
      
      // Store in localStorage for details page
      const newMealData = {
        date: new Date().toISOString(),
        score: overallScore,
        categories: categoryScores,
        type: mealType,
        time: mealTime,
        description: mealDescription,
        calories: mealCalories,
        analysis: mealAnalysis,
        recommendations: recommendations
      };
      
      // Get existing data or initialize empty array
      const existingData = JSON.parse(localStorage.getItem('mealTrackingHistory') || '[]');
      localStorage.setItem('mealTrackingHistory', JSON.stringify([...existingData, newMealData]));
      
      // Set last assessment date
      setLastAssessmentDate("Just now");
      
    } catch (error) {
      console.error("Error generating meal analysis:", error);
      
      // Default values if AI fails
      setAiAnalysis("This meal provides a moderate nutritional profile with some key nutrients, but could be more balanced. Consider adding more vegetables and lean protein.");
      
      // Still add to history with default values
      const defaultMeal = {
        id: Date.now().toString(),
        date: getTodayDate(),
        type: mealType,
        time: mealTime,
        description: mealDescription,
        score: 70,
        calories: 550,
        analysis: "This meal provides a moderate nutritional profile with some key nutrients, but could be more balanced.",
        categories: {
          "Protein": 65,
          "Carbs": 70,
          "Fats": 65,
          "Vitamins": 60,
          "Hydration": 55
        }
      };
      
      setMealHistory(prev => [...prev, defaultMeal]);
      setDailyCalories(prev => prev + 550);
      setCalorieIntake(prev => prev + 550);
      
      // Still store in localStorage
      const defaultMealData = {
        date: new Date().toISOString(),
        score: 70,
        categories: defaultMeal.categories,
        type: mealType,
        time: mealTime,
        description: mealDescription,
        calories: 550,
        analysis: defaultMeal.analysis,
        recommendations: recommendations
      };
      
      const existingData = JSON.parse(localStorage.getItem('mealTrackingHistory') || '[]');
      localStorage.setItem('mealTrackingHistory', JSON.stringify([...existingData, defaultMealData]));
    } finally {
      setIsGeneratingAnalysis(false);
    }
  };

  // Handle starting a new meal entry
  const handleStartEntry = () => {
    setShowMealEntry(true);
    setCurrentStep(0);
    setEntryComplete(false);
    setMealType("");
    setMealDescription("");
    setMealTime("");
  };

  // Handle meal type selection
  const handleMealTypeSelect = (type: string) => {
    setMealType(type);
    setCurrentStep(1);
  };

  // Handle meal time selection
  const handleMealTimeSelect = (time: string) => {
    setMealTime(time);
    setCurrentStep(2);
  };

  // Get nutrition label based on score
  const getNutritionLabel = (score: number): string => {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Fair";
    return "Needs improvement";
  };
  
  // Navigate to detailed analysis page
  const goToDetailedAnalysis = () => {
    router.push('/meal');
  };

  return (
    <>
      <Card className="border-0 shadow-lg rounded-xl overflow-hidden h-full">
        <CardHeader className="p-4 md:p-5 bg-gradient-to-r from-orange-500 to-amber-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Utensils className="h-5 w-5 md:h-6 md:w-6 text-white" />
              <h2 className="text-lg md:text-xl font-semibold text-white">Nutrition Analysis</h2>
            </div>
            <div className="flex space-x-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/20"
                onClick={() => setShowMealHistory(true)}
              >
                <History className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <Settings className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-2 md:p-5">
          <div className="flex flex-col items-center justify-center mb-4">
            <div className="h-48 w-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="text-center mt-2">
              <div className="flex items-center justify-center">
                <span className="text-3xl md:text-4xl font-bold">{nutritionScore}</span>
                <span className="text-xs md:text-sm text-gray-500 ml-1">/100</span>
              </div>
              <Badge className="mt-1 bg-orange-100 text-orange-800 hover:bg-orange-200 text-xs">
                {getNutritionLabel(nutritionScore)}
              </Badge>
              <h3 className="text-xs md:text-sm text-gray-500 mt-1">
                Last assessed: {lastAssessmentDate}
                {mealHistory.length > 0 && ` • ${mealHistory.length} meals logged`}
              </h3>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Daily Calories</span>
              <span className="text-sm font-medium">{calorieIntake} / {calorieGoal} kcal</span>
            </div>
            <Progress value={(calorieIntake / calorieGoal) * 100} className="h-2">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500"
                style={{ width: `${Math.min(100, (calorieIntake / calorieGoal) * 100)}%` }}
              ></div>
            </Progress>
            <p className="text-xs text-gray-500 mt-1">{Math.max(0, calorieGoal - calorieIntake)} calories remaining today</p>
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex flex-col space-y-2">
            <Button 
              onClick={goToDetailedAnalysis}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs md:text-sm"
            >
              <BarChart className="mr-2 h-4 w-4" />
              View Detailed Analysis
            </Button>
            
            <Button 
              onClick={handleStartEntry} 
              className="bg-amber-500 hover:bg-amber-600 text-white text-xs md:text-sm"
            >
              Add Meal <ArrowRight className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Meal Entry Dialog */}
      <Dialog open={showMealEntry} onOpenChange={setShowMealEntry}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {entryComplete ? 
                "Your Meal Analysis Results" : 
                currentStep === 0 ? "What type of meal did you have?" :
                currentStep === 1 ? "When did you have this meal?" :
                "What did you eat and drink?"
              }
            </DialogTitle>
            <DialogDescription>
              {entryComplete 
                ? "Based on your meal details, we've generated a personalized nutritional analysis."
                : currentStep === 0 ? "Select the meal type to continue" :
                  currentStep === 1 ? "Select when you had this meal" :
                  "Describe what you ate and drank in as much detail as possible"
              }
            </DialogDescription>
          </DialogHeader>

          {entryComplete ? (
            <div className="space-y-4 py-4">
              <div className="text-center mb-6">
                <div className="inline-block p-4 rounded-full bg-orange-100 mb-2">
                  <Utensils className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold">Nutrition Score: {nutritionScore}</h3>
                <p className="text-gray-500">
                  {nutritionScore >= 85 ? "Excellent nutritional balance!" : 
                   nutritionScore >= 70 ? "Good nutrition with some room for improvement" : 
                   nutritionScore >= 50 ? "Your meal needs some nutritional adjustments" :
                   "This meal lacks key nutritional components"}
                </p>
              </div>
              
              {isGeneratingAnalysis ? (
                <div className="flex flex-col items-center justify-center py-4">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500 mb-2" />
                  <p className="text-center text-gray-500">
                    Analyzing your meal and generating nutritional insights...
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-orange-50 p-4 rounded-lg mb-4">
                    <h4 className="font-medium text-orange-800 mb-2">AI Analysis</h4>
                    <p className="text-sm text-gray-700">{aiAnalysis}</p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-gray-50 mb-4">
                    <div className="flex justify-between mb-2">
                      <h4 className="font-medium">Daily Calorie Intake</h4>
                      <span className="text-sm font-medium">{calorieIntake} / {calorieGoal} kcal</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-500"
                        style={{ width: `${Math.min(100, (calorieIntake / calorieGoal) * 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{Math.max(0, calorieGoal - calorieIntake)} calories remaining for today</p>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <h4 className="font-medium">Nutritional Breakdown</h4>
                    {Object.entries(nutritionCategories).map(([category, score]) => (
                      <div key={category} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">{category}</span>
                          <span className="text-sm font-medium text-orange-600">{score}/100</span>
                        </div>
                        <Progress value={score} className="h-2">
                          <div 
                            className="h-full bg-orange-500"
                            style={{ width: `${score}%` }}
                          ></div>
                        </Progress>
                      </div>
                    ))}
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Recommendations for Future Meals</h4>
                    {recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start bg-orange-50 p-3 rounded-lg mb-2">
                        <div className="flex-shrink-0 bg-orange-100 p-2 rounded-full mr-3">
                          <span className="flex items-center justify-center w-4 h-4 text-xs font-bold text-orange-700">{index + 1}</span>
                        </div>
                        <p className="text-sm text-gray-800">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="py-4">
              {currentStep === 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {["Breakfast", "Lunch", "Dinner", "Snack"].map((type) => (
                    <Button
                      key={type}
                      variant="outline"
                      className={`h-20 ${mealType === type ? 'border-orange-500 bg-orange-50' : ''}`}
                      onClick={() => handleMealTypeSelect(type)}
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              )}
              
              {currentStep === 1 && (
                <div className="grid grid-cols-2 gap-3">
                  {["Morning (6-9 AM)", "Mid-Morning (9-11 AM)", "Noon (11 AM-1 PM)", "Afternoon (1-4 PM)", 
                    "Evening (4-7 PM)", "Night (7-10 PM)", "Late Night (10 PM-6 AM)"].map((time) => (
                    <Button
                      key={time}
                      variant="outline"
                      className={`h-16 text-sm ${mealTime === time ? 'border-orange-500 bg-orange-50' : ''}`}
                      onClick={() => handleMealTimeSelect(time)}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              )}
              
              {currentStep === 2 && (
                <div className="space-y-4">
                  <textarea
                    className="w-full border rounded-lg p-3 h-36 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Describe your meal in detail, including all foods, beverages, and approximate quantities (e.g., 2 eggs, 1 slice whole wheat toast with 1 tbsp butter, 1 medium apple, 8oz black coffee)"
                    value={mealDescription}
                    onChange={(e) => setMealDescription(e.target.value)}
                  />
                  
                  {mealHistory.length > 0 && (
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <h4 className="text-sm font-medium text-blue-800 mb-1">Previous Meals Today:</h4>
                      <div className="max-h-32 overflow-y-auto">
                        {mealHistory.map((meal, index) => (
                          <div key={meal.id} className="text-xs text-blue-800 mb-1 border-b border-blue-100 pb-1">
                            {meal.type} ({meal.time}): {meal.description.substring(0, 80)}...
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-blue-800 mt-2">
                        Your new meal will be analyzed in context with these previous meals.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            {entryComplete ? (
              <div className="w-full space-y-2">
                <Button 
                  onClick={goToDetailedAnalysis} 
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                >
                  View Detailed Analysis
                </Button>
                <DialogClose asChild>
                  <Button variant="outline" className="w-full">
                    Close
                  </Button>
                </DialogClose>
              </div>
            ) : (
              <div className="w-full flex space-x-2">
                {currentStep > 0 ? (
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                ) : (
                  <DialogClose asChild>
                    <Button variant="outline" className="flex-1">
                      Cancel
                    </Button>
                  </DialogClose>
                )}
                
                {currentStep < 2 ? (
                  <Button 
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                    disabled={
                      (currentStep === 0 && !mealType) || 
                      (currentStep === 1 && !mealTime)
                    }
                    onClick={() => {
                      if (currentStep === 0 && mealType) setCurrentStep(1);
                      else if (currentStep === 1 && mealTime) setCurrentStep(2);
                    }}
                  >
                    Next
                  </Button>
                ) : (
                  <Button 
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                    disabled={!mealDescription.trim()}
                    onClick={handleMealSubmit}
                  >
                    {isGeneratingAnalysis ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : 'Submit and Analyze'}
                  </Button>
                )}
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Meal History Dialog */}
      <Dialog open={showMealHistory} onOpenChange={setShowMealHistory}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <History className="h-5 w-5 mr-2 text-orange-500" />
              Your Meal History
            </DialogTitle>
            <DialogDescription>
              View all your logged meals and their nutritional analysis
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {mealHistory.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">No meals logged yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(
                  mealHistory.reduce((acc, meal) => {
                    if (!acc[meal.date]) acc[meal.date] = [];
                    acc[meal.date].push(meal);
                    return acc;
                  }, {} as Record<string, typeof mealHistory>)
                ).map(([date, meals]) => (
                  <div key={date} className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 p-3 font-medium text-sm flex justify-between items-center">
                    <span className="text-orange-600 text-sm">
                        {meals.reduce((sum, meal) => sum + meal.calories, 0)} kcal
                      </span>
                    </div>
                    <div className="divide-y">
                      {meals.map((meal) => (
                        <div key={meal.id} className="p-3">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center">
                              <Badge className="mr-2 bg-orange-100 text-orange-800">
                                {meal.type}
                              </Badge>
                              <span className="text-sm text-gray-500">{meal.time}</span>
                            </div>
                            <Badge className={`${
                              meal.score >= 85 ? "bg-green-100 text-green-800" :
                              meal.score >= 70 ? "bg-yellow-100 text-yellow-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              Score: {meal.score}
                            </Badge>
                          </div>
                          <p className="text-sm mb-2 line-clamp-2">{meal.description}</p>
                          <p className="text-xs text-gray-500 line-clamp-2">{meal.analysis}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              onClick={goToDetailedAnalysis} 
              className="mr-2 bg-orange-600 hover:bg-orange-700 text-white"
            >
              Detailed Analysis
            </Button>
            <DialogClose asChild>
              <Button variant="outline">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MealTrackingCard;