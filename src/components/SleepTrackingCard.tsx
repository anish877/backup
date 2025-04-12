"use client";
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Moon, MoreHorizontal, ArrowRight, Loader2, BarChart } from 'lucide-react';
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

const SleepTrackingCard = () => {
  const router = useRouter();
  
  // States for UI
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState<string[]>([]);
  const [options, setOptions] = useState<string[][]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [sleepScore, setSleepScore] = useState(78);
  const [quizComplete, setQuizComplete] = useState(false);
  const [insights, setInsights] = useState<string[]>([
    "Create a consistent pre-sleep ritual to signal your body it's time to rest",
    "Limit caffeine after 2pm to improve sleep quality",
    "Keep bedroom temperature between 60-67°F for optimal sleep conditions"
  ]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [lastAssessmentDate, setLastAssessmentDate] = useState("Today");
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [sleepCategories, setSleepCategories] = useState<{[key: string]: number}>({
    "Quality": 72,
    "Duration": 80,
    "Consistency": 65,
    "Environment": 75,
    "Habits": 70
  });
  const [assessmentHistory, setAssessmentHistory] = useState<any[]>([]);

  // Prepare data for pie chart
  const pieData = [
    { name: 'Sleep Score', value: sleepScore, color: '#4338CA' },
    { name: 'Remaining', value: 100 - sleepScore, color: '#E0E7FF' }
  ];

  useEffect(() => {
    // Load most recent assessment and entire history from localStorage
    const loadAssessmentData = () => {
      try {
        const historyData = localStorage.getItem('sleepAssessmentHistory');
        if (historyData) {
          const parsedData = JSON.parse(historyData);
          setAssessmentHistory(parsedData);
          
          if (parsedData.length > 0) {
            // Sort by date and get the most recent
            const sortedData = parsedData.sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            const latestAssessment = sortedData[0];
            
            setSleepScore(latestAssessment.score);
            setSleepCategories(latestAssessment.categories);
            setInsights(latestAssessment.insights || insights);
            setAiAnalysis(latestAssessment.analysis || "");
            
            // Format date
            const assessmentDate = new Date(latestAssessment.date);
            const now = new Date();
            
            // If today, show "Today"
            if (assessmentDate.toDateString() === now.toDateString()) {
              setLastAssessmentDate("Today");
            } else {
              setLastAssessmentDate(assessmentDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric'
              }));
            }
          }
        }
      } catch (error) {
        console.error("Error loading assessment data:", error);
      }
    };

    loadAssessmentData();
  }, []);

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

  // Generate specific sleep questions about last night's sleep
  const generateQuestions = async () => {
    setIsGeneratingQuestions(true);
    
    try {
      const prompt = `Generate 5 detailed questions specifically about the user's PREVIOUS NIGHT's sleep (not their general sleep habits). Each question should have 4-5 detailed multiple choice options that give context and help users accurately assess their recent sleep quality.

      Format your response exactly like this example:
      
      QUESTION: How many hours did you sleep last night?
      Less than 5 hours (went to bed very late or woke up too early), 5-6 hours (somewhat insufficient), 7-8 hours (recommended amount), More than 8 hours (extended sleep period)
      
      QUESTION: How long did it take you to fall asleep last night?
      Under 5 minutes (fell asleep almost immediately), 5-15 minutes (dozed off quickly), 15-30 minutes (some difficulty), 30-60 minutes (significant delay), Over 60 minutes (severe difficulty falling asleep)
      
      QUESTION: How would you rate the quality of your sleep last night?
      Excellent (deep, uninterrupted sleep), Good (mostly restful with minimal disturbances), Average (somewhat restful with occasional waking), Poor (restless with frequent waking), Very Poor (barely slept or extremely fragmented)
      
      Just provide the questions and detailed options in exactly this format - no introductions or explanations. Make each question specifically about LAST NIGHT's sleep (not general sleep patterns), and make the options detailed with contextual descriptions.`;
      
      const aiResponse = await callGeminiAPI(prompt);
      
      // Parse the AI response to extract questions and options
      const sections = aiResponse.split('QUESTION:').filter(section => section.trim() !== '');
      
      const parsedQuestions: string[] = [];
      const parsedOptions: string[][] = [];
      
      sections.forEach(section => {
        // Split each section into lines
        const lines = section.trim().split('\n');
        
        // First line is the question
        if (lines.length > 0) {
          parsedQuestions.push(lines[0].trim());
          
          // Remaining lines contain the options
          if (lines.length > 1) {
            const optionsText = lines.slice(1).join(' ').trim();
            const options = optionsText.split(',').map(opt => opt.trim());
            parsedOptions.push(options);
          }
        }
      });
      
      // Fall back to default questions if parsing failed
      if (parsedQuestions.length < 3 || parsedOptions.length < 3) {
        setDefaultQuestionsAndOptions();
      } else {
        setQuestions(parsedQuestions);
        setOptions(parsedOptions);
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      setDefaultQuestionsAndOptions();
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  // Set default questions if AI generation fails
  const setDefaultQuestionsAndOptions = () => {
    setQuestions([
      "How many hours did you sleep last night?",
      "How long did it take you to fall asleep last night?",
      "Did you wake up during the night?",
      "How did you feel when you woke up this morning?",
      "Did you use electronic devices within an hour before sleeping?"
    ]);
    
    setOptions([
      [
        "Less than 5 hours (insufficient sleep)",
        "5-6 hours (somewhat below recommended)",
        "7-8 hours (optimal sleep duration)",
        "More than 8 hours (extended sleep)"
      ],
      [
        "Less than 5 minutes (fell asleep immediately)",
        "5-15 minutes (normal sleep onset)",
        "15-30 minutes (slightly delayed)",
        "30-60 minutes (significantly delayed)",
        "More than 60 minutes (severe difficulty falling asleep)"
      ],
      [
        "Not at all (slept straight through)",
        "Once briefly (minimal disruption)",
        "2-3 times (moderate disruption)",
        "More than 3 times (fragmented sleep)",
        "Awake for extended periods (severely disrupted)"
      ],
      [
        "Very refreshed and energetic (optimal recovery)",
        "Mostly rested (good recovery)",
        "Somewhat tired (incomplete recovery)",
        "Very tired (poor recovery)",
        "Exhausted (minimal recovery)"
      ],
      [
        "No devices at all (complete digital detox)",
        "Brief check only (minimal exposure)",
        "15-30 minutes (moderate exposure)",
        "30-60 minutes (significant exposure)",
        "Used until falling asleep (maximum exposure)"
      ]
    ]);
  };

  // Handle starting the quiz
  const handleStartQuiz = async () => {
    setShowQuiz(true);
    setCurrentQuestion(0);
    setQuizComplete(false);
    setAnswers({});
    
    // Generate questions if not already available
    if (questions.length === 0) {
      await generateQuestions();
    }
  };

  // Handle user answer selection
  const handleAnswer = (question: number, answer: string) => {
    const newAnswers = { ...answers, [question]: answer };
    setAnswers(newAnswers);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Quiz complete, generate insights
      generateSleepInsights(newAnswers);
    }
  };

  // Generate sleep insights based on answers about last night's sleep
  const generateSleepInsights = async (userAnswers: Record<number, string>) => {
    setQuizComplete(true);
    setIsGeneratingInsights(true);
    
    try {
      // Create a formatted string of the user's answers
      const answersText = Object.entries(userAnswers).map(([key, value]) => {
        const questionIndex = parseInt(key);
        return `Question: ${questions[questionIndex]}\nAnswer: ${value}`;
      }).join('\n\n');
      
      // Prepare the prompt for the AI analysis
      const promptForAnalysis = `Based on these answers about LAST NIGHT's sleep quality, provide:

    1. A detailed AI analysis of the user's sleep (2-3 sentences that personalize the assessment based on their answers)
    2. Exactly 3 specific, personalized, and actionable recommendations to improve tonight's sleep
    3. A breakdown of sleep quality across these 5 categories, with scores between 0-100:
       - Quality (depth and restfulness)
       - Duration (appropriate length)
       - Consistency (regular patterns)
       - Environment (bedroom conditions)
       - Habits (pre-sleep behaviors)

    ${answersText}

    Format your response exactly like this:
    ANALYSIS: [2-3 sentence personalized analysis]

    RECOMMENDATIONS:
    [First recommendation under 15 words]
    [Second recommendation under 15 words]
    [Third recommendation under 15 words]

    CATEGORY_SCORES:
    Quality: [score]
    Duration: [score]
    Consistency: [score]
    Environment: [score]
    Habits: [score]`;

      // Call Gemini API directly
      const aiResponse = await callGeminiAPI(promptForAnalysis);
      
      // Parse the response
      const analysisMatch = aiResponse.match(/ANALYSIS:(.*?)(?=\n\nRECOMMENDATIONS:|\n\nCATEGORY_SCORES:|$)/s);
      const recommendationsMatch = aiResponse.match(/RECOMMENDATIONS:(.*?)(?=\n\nCATEGORY_SCORES:|$)/s);
      const categoryScoresMatch = aiResponse.match(/CATEGORY_SCORES:(.*?)$/s);
      
      // Set AI analysis
      if (analysisMatch && analysisMatch[1]) {
        setAiAnalysis(analysisMatch[1].trim());
      } else {
        setAiAnalysis("Based on your sleep data, you had a moderately restful night with some areas for improvement. Your sleep patterns indicate you could benefit from adjustments to your sleep environment and pre-bedtime routine.");
      }
      
      // Set recommendations
      if (recommendationsMatch && recommendationsMatch[1]) {
        const recLines = recommendationsMatch[1].trim().split('\n').filter(line => line.trim() !== '');
        if (recLines.length >= 3) {
          setInsights(recLines.slice(0, 3));
        } else {
          setInsights([
            "Dim all lights one hour before your target bedtime tonight",
            "Drink chamomile tea 30 minutes before bed to promote relaxation",
            "Set your bedroom temperature between 60-67°F for optimal sleep"
          ]);
        }
      } else {
        setInsights([
          "Dim all lights one hour before your target bedtime tonight",
          "Drink chamomile tea 30 minutes before bed to promote relaxation",
          "Set your bedroom temperature between 60-67°F for optimal sleep"
        ]);
      }
      
      // Set category scores and calculate sleep score as their average
      let categoryScores: {[key: string]: number} = {};
      
      if (categoryScoresMatch && categoryScoresMatch[1]) {
        const scoreLines = categoryScoresMatch[1].trim().split('\n');
        
        scoreLines.forEach(line => {
          const [category, scoreStr] = line.split(':').map(s => s.trim());
          if (category && scoreStr) {
            const score = parseInt(scoreStr);
            if (!isNaN(score)) {
              categoryScores[category] = score;
            }
          }
        });
        
        if (Object.keys(categoryScores).length < 5) {
          // If we don't have all 5 categories, calculate them ourselves
          categoryScores = generateCategoryScores(userAnswers);
        }
      } else {
        // Calculate category scores ourselves if not provided
        categoryScores = generateCategoryScores(userAnswers);
      }
      
      // Set the category scores
      setSleepCategories(categoryScores);
      
      // Calculate sleep score as the average of category scores
      const totalScore = Object.values(categoryScores).reduce((sum, score) => sum + score, 0);
      const averageScore = Math.round(totalScore / Object.values(categoryScores).length);
      
      // Set the sleep score and last assessment date
      setSleepScore(averageScore);
      setLastAssessmentDate("Today");
      
      // Save assessment to localStorage
      saveAssessmentToHistory(userAnswers, averageScore, categoryScores);
      
    } catch (error) {
      console.error("Error generating insights:", error);
      
      // Default insights and analysis
      setInsights([
        "Dim all lights one hour before your target bedtime tonight",
        "Drink chamomile tea 30 minutes before bed to promote relaxation",
        "Set your bedroom temperature between 60-67°F for optimal sleep"
      ]);
      setAiAnalysis("Your sleep patterns show room for improvement. Focus on creating a better sleep environment and pre-bedtime routine to enhance sleep quality.");
      
      // Default category scores
      const defaultCategories = {
        "Quality": 65,
        "Duration": 65,
        "Consistency": 65,
        "Environment": 65,
        "Habits": 65
      };
      
      setSleepCategories(defaultCategories);
      
      // Calculate default sleep score as average of default categories
      const defaultTotal = Object.values(defaultCategories).reduce((sum, score) => sum + score, 0);
      const defaultAverage = Math.round(defaultTotal / Object.values(defaultCategories).length);
      setSleepScore(defaultAverage);
      
      // Save default assessment to localStorage
      saveAssessmentToHistory({}, defaultAverage, defaultCategories);
      
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  // Save assessment to localStorage history
  const saveAssessmentToHistory = (
    userAnswers: Record<number, string>, 
    score: number, 
    categories: {[key: string]: number}
  ) => {
    try {
      // Create new assessment object
      const newAssessment = {
        date: new Date().toISOString(),
        score,
        categories,
        insights,
        analysis: aiAnalysis,
        questions,
        responses: userAnswers
      };
      console.log(newAssessment)
      // Get existing history or initialize empty array
      let history = [];
      const existingHistory = localStorage.getItem('sleepAssessmentHistory');
      
      if (existingHistory) {
        history = JSON.parse(existingHistory);
      }
      
      // Add new assessment to beginning of array
      history.unshift(newAssessment);
      
      // Limit history to last 30 assessments
      if (history.length > 30) {
        history = history.slice(0, 30);
      }
      
      // Save back to localStorage
      localStorage.setItem('sleepAssessmentHistory', JSON.stringify(history));
      setAssessmentHistory(history);
      
    } catch (error) {
      console.error("Error saving assessment to history:", error);
    }
  };

  // Generate category scores based on user answers
  const generateCategoryScores = (userAnswers: Record<number, string>): {[key: string]: number} => {
    const scores: {[key: string]: number} = {
      "Quality": 65,
      "Duration": 65,
      "Consistency": 65,
      "Environment": 65,
      "Habits": 65
    };
    
    const answersArray = Object.values(userAnswers);
    
    // Hours of sleep (affects Duration and Consistency)
    if (answersArray[0]?.includes("7-8 hours")) {
      scores.Duration += 25;
      scores.Consistency += 10;
    } else if (answersArray[0]?.includes("More than 8 hours")) {
      scores.Duration += 15;
      scores.Consistency += 5;
    } else if (answersArray[0]?.includes("5-6 hours")) {
      scores.Duration -= 10;
      scores.Consistency -= 5;
    } else if (answersArray[0]?.includes("Less than 5 hours")) {
      scores.Duration -= 25;
      scores.Consistency -= 15;
    }
    
    // Time to fall asleep (affects Quality and Habits)
    if (answersArray[1]?.includes("Less than 5 minutes")) {
      scores.Quality += 15;
      scores.Habits += 10;
    } else if (answersArray[1]?.includes("5-15 minutes")) {
      scores.Quality += 10;
      scores.Habits += 5;
    } else if (answersArray[1]?.includes("15-30 minutes")) {
      // neutral
    } else if (answersArray[1]?.includes("30-60 minutes")) {
      scores.Quality -= 10;
      scores.Habits -= 10;
    } else if (answersArray[1]?.includes("More than 60 minutes")) {
      scores.Quality -= 20;
      scores.Habits -= 20;
    }
    
    // Waking during night (affects Quality and Environment)
    if (answersArray[2]?.includes("Not at all")) {
      scores.Quality += 20;
      scores.Environment += 10;
    } else if (answersArray[2]?.includes("Once briefly")) {
      scores.Quality += 10;
      scores.Environment += 5;
    } else if (answersArray[2]?.includes("2-3 times")) {
      scores.Quality -= 10;
      scores.Environment -= 5;
    } else if (answersArray[2]?.includes("More than 3 times")) {
      scores.Quality -= 20;
      scores.Environment -= 10;
    } else if (answersArray[2]?.includes("Awake for extended")) {
      scores.Quality -= 30;
      scores.Environment -= 15;
    }
    
    // Morning feeling (affects Quality and overall well-being)
    if (answersArray[3]?.includes("Very refreshed")) {
      scores.Quality += 20;
    } else if (answersArray[3]?.includes("Mostly rested")) {
      scores.Quality += 10;
    } else if (answersArray[3]?.includes("Somewhat tired")) {
      // neutral
    } else if (answersArray[3]?.includes("Very tired")) {
      scores.Quality -= 15;
    } else if (answersArray[3]?.includes("Exhausted")) {
      scores.Quality -= 25;
    }
    
    // Electronic devices (affects Habits and Environment)
    if (answersArray[4]?.includes("No devices")) {
      scores.Habits += 20;
      scores.Environment += 10;
    } else if (answersArray[4]?.includes("Brief check only")) {
      scores.Habits += 10;
      scores.Environment += 5;
    } else if (answersArray[4]?.includes("15-30 minutes")) {
      scores.Habits -= 5;
      scores.Environment -= 5;
    } else if (answersArray[4]?.includes("30-60 minutes")) {
      scores.Habits -= 15;
      scores.Environment -= 10;
    } else if (answersArray[4]?.includes("Used until falling asleep")) {
      scores.Habits -= 25;
      scores.Environment -= 15;
    }
    
    // Ensure all scores are within 0-100 range
    Object.keys(scores).forEach(key => {
      scores[key] = Math.max(0, Math.min(100, scores[key]));
    });
    
    return scores;
  };

  // Get sleep quality label based on score
  const getSleepQualityLabel = (score: number): string => {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Fair";
    return "Needs improvement";
  };

  // Navigate to analytics page with detailed sleep analysis
  const viewDetails = () => {
    // We'll use localStorage to persist data between pages
    // No need to use sessionStorage since we're already using localStorage for history
    router.push('/sleep');
  };

  return (
    <>
      <Card className="border-0 shadow-lg rounded-3xl overflow-hidden h-full">
        <CardHeader className="p-4 md:p-6 bg-gradient-to-r from-indigo-500 to-purple-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Moon className="h-5 w-5 md:h-6 md:w-6 text-white" />
              <h2 className="text-lg md:text-xl font-semibold text-white">Sleep Analysis</h2>
            </div>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <MoreHorizontal className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col items-center justify-center mb-4">
            <div className="h-40 w-40">
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
            
            <div className="text-center mt-1">
              <div className="flex items-center justify-center">
                <span className="text-3xl md:text-4xl font-bold">{sleepScore}</span>
                <span className="text-xs md:text-sm text-gray-500 ml-1">/100</span>
              </div>
              <Badge className="mt-1 bg-indigo-100 text-indigo-800 hover:bg-indigo-200 text-xs">
                {getSleepQualityLabel(sleepScore)}
              </Badge>
              <h3 className="text-xs md:text-sm text-gray-500 mt-1 pb-16">Sleep Score • Last assessed: {lastAssessmentDate}</h3>
            </div>
          </div>

          <Separator className="my-3 md:my-4" />
          
          <div className="mt-4 md:mt-6 space-y-3">
            <Button 
              onClick={viewDetails}
              className="bg-indigo-700 hover:bg-indigo-800 text-white text-xs md:text-sm w-full"
            >
              <BarChart className="mr-2 h-4 w-4" />
              View Detailed Analysis
            </Button>
            
            <Button 
              onClick={handleStartQuiz} 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={isGeneratingQuestions}
            >
              {isGeneratingQuestions ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Preparing Assessment...
                </>
              ) : (
                <>
                  Take New Assessment <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showQuiz} onOpenChange={setShowQuiz}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {quizComplete ? 
                "Your Sleep Assessment Results" : 
                isGeneratingQuestions ? 
                  "Preparing Your Sleep Assessment..." :
                  `Question ${currentQuestion + 1} of ${questions.length}`
              }
            </DialogTitle>
            <DialogDescription>
              {quizComplete 
                ? "Based on your answers about last night's sleep, we've generated personalized recommendations."
                : isGeneratingQuestions
                  ? "Our AI is creating personalized questions about your sleep last night..."
                  : "Answer these questions about your sleep last night to get a personalized assessment"}
            </DialogDescription>
          </DialogHeader>

          {isGeneratingQuestions && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-indigo-500 mb-4" />
              <p className="text-center text-gray-500">
                Generating your personalized sleep assessment questions...
              </p>
            </div>
          )}

          {quizComplete ? (
            <div className="space-y-4 py-4">
              <div className="text-center mb-6">
                <div className="inline-block p-4 rounded-full bg-indigo-100 mb-2">
                  <Moon className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold">Your Sleep Score: {sleepScore}</h3>
                <p className="text-gray-500">
                  {sleepScore >= 85 ? "Excellent sleep last night!" : 
                   sleepScore >= 70 ? "Good sleep with some room for improvement" : 
                   sleepScore >= 50 ? "Your sleep last night needs some attention" :
                   "Your sleep quality last night was poor"}
                </p>
              </div>
              
              {isGeneratingInsights ? (
                <div className="flex flex-col items-center justify-center py-4">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-2" />
                  <p className="text-center text-gray-500">
                    Analyzing your responses and generating personalized recommendations...
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-indigo-50 p-4 rounded-lg mb-4">
                    <h4 className="font-medium text-indigo-800 mb-2">AI Analysis</h4>
                    <p className="text-sm text-gray-700">{aiAnalysis}</p>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <h4 className="font-medium">Sleep Quality Breakdown</h4>
                    {Object.entries(sleepCategories).map(([category, score]) => (
                      <div key={category} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">{category}</span>
                          <span className="text-sm font-medium">{score}/100</span>
                        </div>
                        <Progress value={score} className="h-2" />
                      </div>
                    ))}
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Personalized Recommendations</h4>
                    {insights.map((insight, index) => (
                      <div key={index} className="flex items-start bg-indigo-50 p-3 rounded-lg mb-2">
                        <div className="flex-shrink-0 bg-indigo-100 p-2 rounded-full mr-3">
                          <span className="flex items-center justify-center w-4 h-4 text-xs font-bold text-indigo-700">{index + 1}</span>
                          </div>
                        <p className="text-sm text-indigo-700">{insight}</p>
                      </div>
                    ))}
                  </div>
                  
                  <DialogFooter className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:justify-between">
                    <Button 
                      onClick={viewDetails}
                      className="bg-indigo-700 hover:bg-indigo-800 text-white w-full sm:w-auto"
                    >
                     <BarChart className="mr-2 h-4 w-4" />
                      View Detailed Analysis
                    </Button>
                    <DialogClose asChild>
                      <Button variant="outline" className="w-full sm:w-auto">
                        Close
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </>
              )}
            </div>
          ) : (
            !isGeneratingQuestions && questions.length > 0 && (
              <div className="space-y-4 py-4">
                <h3 className="font-medium text-lg">{questions[currentQuestion]}</h3>
                <div className="space-y-2">
                  {options[currentQuestion]?.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-3 px-4"
                      onClick={() => handleAnswer(currentQuestion, option)}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
                
                <div className="flex justify-between items-center pt-4">
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                    disabled={currentQuestion === 0}
                  >
                    Back
                  </Button>
                  <span className="text-sm text-gray-500">
                    {currentQuestion + 1} of {questions.length}
                  </span>
                </div>
              </div>
            )
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SleepTrackingCard;