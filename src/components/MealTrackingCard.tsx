import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Utensils, ArrowRight, Loader2, AlertTriangle, Calendar, History } from 'lucide-react';
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
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API client
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

const MealTrackingCard = () => {
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
      //@ts-expect-error: no need here
      const analysisMatch = aiResponse.match(/ANALYSIS:(.*?)(?=\n\nRECOMMENDATIONS:|\n\nCALORIES:|\n\nCATEGORY_SCORES:|$)/s);
      //@ts-expect-error: no need here
      const recommendationsMatch = aiResponse.match(/RECOMMENDATIONS:(.*?)(?=\n\nCALORIES:|\n\nCATEGORY_SCORES:|$)/s);
      const caloriesMatch = aiResponse.match(/CALORIES:\s*(\d+)/);
      //@ts-expect-error: no need here
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
      
      setMealHistory(prev => [...prev, newMeal]);
      
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

  // Get color for category score
  const getCategoryColor = (score: number): string => {
    if (score >= 80) return 'text-green-500';
    if (score >= 65) return 'text-blue-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Get background color for progress bar
  const getProgressColor = (score: number): string => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 65) return 'bg-blue-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Calculate calories percentage
  const caloriePercentage = Math.min(100, Math.round((calorieIntake / calorieGoal) * 100));
  
  // Format date for display
  const formatDate = (dateStr: string) => {
    if (dateStr === getTodayDate()) return "Today";
    return dateStr;
  };

  return (
    <>
      <Card className="border-0 shadow-lg rounded-3xl overflow-hidden h-full">
        <CardHeader className="p-4 md:p-6 bg-gradient-to-r from-orange-500 to-amber-600">
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
                <MoreHorizontal className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 md:p-6">
          <div className="flex items-start justify-between mb-4 md:mb-6">
            <div>
              <div className="flex items-baseline">
                <span className="text-3xl md:text-4xl font-bold">{nutritionScore}</span>
                <span className="text-xs md:text-sm text-gray-500 ml-1">/100</span>
                {mealHistory.length > 1 && (
                  <Badge className="ml-2 md:ml-3 bg-orange-100 text-orange-800 hover:bg-orange-200 text-xs">
                    {nutritionScore > mealHistory[mealHistory.length - 2]?.score ? '+' : ''}
                    {nutritionScore - (mealHistory[mealHistory.length - 2]?.score || nutritionScore)} from prev
                  </Badge>
                )}
              </div>
              <h3 className="text-xs md:text-sm text-gray-500 mt-1">
                Nutrition Score • Last assessed: {lastAssessmentDate}
                {mealHistory.length > 0 && ` • ${mealHistory.length} meals logged`}
              </h3>
              
              <div className="flex space-x-1 mt-2 md:mt-3">
                {[...Array(10)].map((_, i) => (
                  <span 
                    key={i} 
                    className="inline-block w-6 md:w-8 h-1.5 rounded-full" 
                    style={{ 
                      backgroundColor: i < (nutritionScore / 10) ? '#F97316' : '#FED7AA'
                    }}
                  ></span>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-5">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Daily Calories</span>
              <span className="text-sm font-medium">{calorieIntake} / {calorieGoal} kcal</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500"
                style={{ width: `${caloriePercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{Math.max(0, calorieGoal - calorieIntake)} calories remaining today</p>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {Object.entries(nutritionCategories).map(([category, score]) => (
              <div key={category} className="border rounded-lg p-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-600">{category}</span>
                  <span className={`text-xs font-medium ${getCategoryColor(score)}`}>{score}</span>
                </div>
                <Progress value={score} className="h-1.5" 
                  style={{backgroundColor: '#FED7AA'}}
                >
                  <div className={`h-full ${getProgressColor(score)}`} style={{width: `${score}%`}}></div>
                </Progress>
              </div>
            ))}
          </div>

          {mealHistory.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold text-sm mb-2">Recent Meals</h3>
              <div className="overflow-hidden border rounded-lg">
                {mealHistory.slice(-2).map((meal, index) => (
                  <div key={meal.id} className={`p-2 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">{meal.type}</span>
                      <span className="text-xs text-gray-500">{meal.time}</span>
                    </div>
                    <p className="text-xs text-gray-600 truncate">{meal.description.substring(0, 60)}...</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500">{meal.calories} kcal</span>
                      <span className={`text-xs font-medium ${getCategoryColor(meal.score)}`}>Score: {meal.score}</span>
                    </div>
                  </div>
                ))}
                {mealHistory.length > 2 && (
                  <div className="p-2 text-center bg-gray-50">
                    <button 
                      className="text-xs text-orange-600 hover:text-orange-700"
                      onClick={() => setShowMealHistory(true)}
                    >
                      Show {mealHistory.length - 2} more meals
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <Separator className="my-2 md:my-2" />
          
          <div className="space-y-3 md:space-y-5 mt-3 md:mt-4">
            <h3 className="font-semibold text-base md:text-lg">AI Recommendations</h3>
            
            {recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start bg-orange-50 p-2 md:p-3 rounded-xl">
                <div className="flex-shrink-0 bg-orange-100 p-1.5 md:p-2 rounded-full mr-2 md:mr-3">
                  <span className="flex items-center justify-center w-3 h-3 md:w-4 md:h-4 text-xs font-bold text-orange-700">{index + 1}</span>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-800">{recommendation}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 md:mt-8 flex items-center justify-between py-2 md:py-3 px-3 md:px-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-xs md:text-sm font-medium">Log your meal</p>
              <p className="text-xs text-gray-500 hidden md:block">Get personalized nutrition analysis</p>
            </div>
            <Button 
              onClick={handleStartEntry} 
              className="bg-orange-600 hover:bg-orange-700 text-white text-xs md:text-sm py-1 px-2 md:py-2 md:px-3"
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
                        style={{ width: `${caloriePercentage}%` }}
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
                          <span className={`text-sm font-medium ${getCategoryColor(score)}`}>{score}/100</span>
                        </div>
                        <Progress value={score} className="h-2">
                          <div className={`h-full ${getProgressColor(score)}`} style={{width: `${score}%`}}></div>
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
                  
                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 flex items-start space-x-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800">
                      For the most accurate analysis, include portion sizes, cooking methods, and all ingredients. Example: "2 scrambled eggs cooked in 1 tsp olive oil, 1 medium apple, 1 cup black coffee"
                    </p>
                  </div>
                  
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
              <DialogClose asChild>
                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                  Close and Save Analysis
                </Button>
              </DialogClose>
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
              <Calendar className="h-5 w-5 mr-2 text-orange-500" />
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
                      <span>{formatDate(date)}</span>
                      <span>{meals.reduce((sum, meal) => sum + meal.calories, 0)} kcal</span>
                    </div>
                    <div>
                      {meals.map((meal) => (
                        <div key={meal.id} className="p-3 border-t">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium">{meal.type}</span>
                            <span className="text-xs text-gray-500">{meal.time}</span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{meal.description}</p>
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>{meal.calories} kcal</span>
                            <span className={getCategoryColor(meal.score)}>
                              Score: {meal.score}/100
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 italic border-t pt-2 mt-1">
                            {meal.analysis}
                          </p>
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
              onClick={() => setShowMealHistory(false)}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MealTrackingCard;