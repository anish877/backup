"use client";
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Smile, Settings, ArrowRight, Loader2, BarChart } from 'lucide-react';
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
import { Textarea } from "@/components/ui/textarea";
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useRouter } from 'next/navigation';
import useLogStore from '@/store/manage';
import axios from 'axios';

// Initialize Gemini API client
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

const MoodAnalysisCard = () => {
  const router = useRouter();
  
  // States for UI
  const [showAssessment, setShowAssessment] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState<string[]>([]);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const { log, setLog, setMood } = useLogStore()
  const [currentResponse, setCurrentResponse] = useState("");
  const [moodScore, setMoodScore] = useState(72);
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [lastAssessmentDate, setLastAssessmentDate] = useState("Today");
  const [moodCategories, setMoodCategories] = useState<{[key: string]: number}>({
    "Happiness": 68,
    "Energy": 65,
    "Calm": 70,
    "Focus": 75,
    "Optimism": 80
  });
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Prepare data for pie chart
  const pieData = [
    { name: 'Mood Score', value: moodScore, color: '#10b981' },
    { name: 'Remaining', value: 100 - moodScore, color: '#134E40' }
  ];

  // Fetch the latest mood data on component mount
  useEffect(() => {
    fetchLatestMood();
  }, []);

  // Fetch the latest mood assessment
  const fetchLatestMood = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`https://healthbackend-kd4p.onrender.com/api/mood/latest`,{withCredentials:true});
      const { data } = response.data;
      
      if (data) {
        setMoodScore(data.finalScore);
        setMoodCategories({
          "Happiness": data.happiness,
          "Energy": data.energy,
          "Calm": data.calm,
          "Focus": data.focus,
          "Optimism": data.optimism
        });
        setRecommendations(data.dailyRecommndations);
        
        // Format date for display
        const date = new Date(data.date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === today.toDateString()) {
          setLastAssessmentDate("Today");
        } else if (date.toDateString() === yesterday.toDateString()) {
          setLastAssessmentDate("Yesterday");
        } else {
          setLastAssessmentDate(date.toLocaleDateString());
        }
      }
    } catch (error) {
      console.error("Error fetching latest mood:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

  // Generate specific mood assessment questions
  const generateQuestions = async () => {
    setIsGeneratingQuestions(true);
    
    try {
      const prompt = `Generate 4 thoughtful questions to assess someone's current emotional state and mood. Each question should encourage descriptive, open-ended responses about how they're feeling right now and what might be influencing their mood. Make the questions empathetic, insightful, and focused on different aspects of emotional wellbeing (like general mood, energy levels, stress, social connections, etc).

      Format your response exactly like this example:
      
      QUESTION: How would you describe your overall mood right now, and has anything specific influenced how you're feeling today?
      
      QUESTION: What's your energy level like today, and how is it affecting your activities and interactions?
      
      QUESTION: What thoughts or concerns are most present in your mind right now?
      
      QUESTION: How connected do you feel to others today, and how has that impacted your emotional state?
      
      Just provide the questions in exactly this format - no introductions or explanations. Each question should invite reflection and detailed expression of current emotional states.`;
      
      const aiResponse = await callGeminiAPI(prompt);
      
      // Parse the AI response to extract questions
      const parsedQuestions = aiResponse
        .split('QUESTION:')
        .map(q => q.trim())
        .filter(q => q !== "");
      
      // Fall back to default questions if parsing failed
      if (parsedQuestions.length < 3) {
        setDefaultQuestions();
      } else {
        setQuestions(parsedQuestions);
      }
      setMood(true)
    } catch (error) {
      console.error("Error generating questions:", error);
      setDefaultQuestions();
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  // Set default questions if AI generation fails
  const setDefaultQuestions = () => {
    setQuestions([
      "How would you describe your overall mood right now, and has anything specific influenced how you're feeling today?",
      "What's your energy level like today, and how is it affecting your activities and interactions?",
      "What thoughts or concerns are most present in your mind right now?",
      "How connected do you feel to others today, and how has that impacted your emotional state?"
    ]);
  };

  // Handle starting the assessment
  const handleStartAssessment = async () => {
    setShowAssessment(true);
    setCurrentQuestion(0);
    setAssessmentComplete(false);
    setResponses({});
    setCurrentResponse("");
    
    // Generate questions if not already available
    if (questions.length === 0) {
      await generateQuestions();
    }
  };

  // Handle text input change
  const handleResponseChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentResponse(e.target.value);
  };

  // Handle submitting a response
  const handleSubmitResponse = () => {
    if (currentResponse.trim() === "") return;
    
    const newResponses = { ...responses, [currentQuestion]: currentResponse };
    setResponses(newResponses);
    setCurrentResponse("");
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Assessment complete, generate insights
      generateMoodInsights(newResponses);
    }
  };

  // Generate mood insights based on responses
  const generateMoodInsights = async (userResponses: Record<number, string>) => {
    setAssessmentComplete(true);
    setIsGeneratingInsights(true);
    
    try {
      // Create a formatted string of the user's responses
      const responsesText = Object.entries(userResponses).map(([key, value]) => {
        const questionIndex = parseInt(key);
        return `Question: ${questions[questionIndex]}\nResponse: ${value}`;
      }).join('\n\n');
      
      // Prepare the prompt for the AI analysis
      const promptForAnalysis = `Based on these responses about the person's current emotional state and mood, provide:

1. A detailed AI analysis of their current mood (2-3 sentences that compassionately assess their emotional state based on their responses)
2. An icon that would best represent their mood (choose from: smile, frown, activity, brain, sun, coffee, heart)
3. Exactly 3 specific, personalized, and actionable recommendations to help improve or maintain their emotional wellbeing
4. A breakdown of their emotional state across these 5 categories, with scores between 0-100:
   - Happiness (general sense of contentment)
   - Energy (physical and mental vitality)
   - Calm (absence of stress or anxiety)
   - Focus (mental clarity and concentration)
   - Optimism (positive outlook about future)

${responsesText}

Format your response exactly like this:
ANALYSIS: [2-3 sentence personalized analysis]

ICON: [icon name from the provided options]

RECOMMENDATIONS:
[First recommendation under 15 words]
[Second recommendation under 15 words]
[Third recommendation under 15 words]

CATEGORY_SCORES:
Happiness: [score]
Energy: [score]
Calm: [score]
Focus: [score]
Optimism: [score]`;

      // Call Gemini API directly
      const aiResponse = await callGeminiAPI(promptForAnalysis);
      
      // Parse the response for category scores
      //@ts-expect-error: no need here
      const categoryScoresMatch = aiResponse.match(/CATEGORY_SCORES:(.*?)$/s);
      
      // Parse the response for recommendations
      //@ts-expect-error: no need here
      const recommendationsMatch = aiResponse.match(/RECOMMENDATIONS:(.*?)(?=CATEGORY_SCORES)/s);
      let parsedRecommendations: string[] = [];
      
      if (recommendationsMatch && recommendationsMatch[1]) {
        parsedRecommendations = recommendationsMatch[1]
          .trim()
          .split('\n')
          .map(r => r.trim())
          .filter(r => r !== "");
      }
      
      // Set category scores and calculate mood score as their average
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
          // If we don't have all 5 categories, use default categories
          categoryScores = {
            "Happiness": 65,
            "Energy": 65,
            "Calm": 65,
            "Focus": 65,
            "Optimism": 65
          };
        }
      } else {
        // Use default category scores if not provided
        categoryScores = {
          "Happiness": 65,
          "Energy": 65,
          "Calm": 65,
          "Focus": 65,
          "Optimism": 65
        };
      }
      
      // Set the category scores
      setMoodCategories(categoryScores);
      
      // Set recommendations
      setRecommendations(parsedRecommendations.length ? parsedRecommendations : [
        "Take 10 minutes to meditate or practice deep breathing",
        "Go for a short walk outside in nature",
        "Connect with a friend or loved one today"
      ]);
      
      // Calculate mood score as the average of category scores
      const totalScore = Object.values(categoryScores).reduce((sum, score) => sum + score, 0);
      const averageScore = Math.round(totalScore / Object.values(categoryScores).length);
      
      // Set the mood score and last assessment date
      setMoodScore(averageScore);
      setLastAssessmentDate("Today");
      
      // Save the mood assessment to the database
      await saveMoodAssessment(
        averageScore,
        categoryScores,
        userResponses,
        questions,
        parsedRecommendations
      );
      
    } catch (error) {
      console.error("Error generating insights:", error);
      
      // Default category scores
      const defaultCategories = {
        "Happiness": 65,
        "Energy": 65,
        "Calm": 65,
        "Focus": 65,
        "Optimism": 65
      };
      
      setMoodCategories(defaultCategories);
      
      // Calculate default mood score as average of default categories
      const defaultTotal = Object.values(defaultCategories).reduce((sum, score) => sum + score, 0);
      const defaultAverage = Math.round(defaultTotal / Object.values(defaultCategories).length);
      setMoodScore(defaultAverage);
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  // Save mood assessment to the database
  const saveMoodAssessment = async (
    score: number,
    categories: {[key: string]: number},
    responses: Record<number, string>,
    questions: string[],
    recommendations: string[]
  ) => {
    try {
      await axios.post(`https://healthbackend-kd4p.onrender.com/api/mood`, {
        moodScore: score,
        categories,
        responses,
        questions,
        recommendations
      },{withCredentials:true});
    } catch (error) {
      console.error("Error saving mood assessment:", error);
    }
  };

  // Get mood label based on score
  const getMoodLabel = (score: number): string => {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Fair";
    return "Needs attention";
  };
  
  // Navigate to detailed analysis page
  const goToDetailedAnalysis = () => {
    router.push('/mood');
  };

  useEffect(() => {
    if(log === 'mood'){
      handleStartAssessment()
    } else{
      setShowAssessment(false)
    }
  }, [log, setLog])

  return (
    <>
      <Card className="border-0 shadow-lg rounded-xl overflow-hidden h-full bg-zinc-900">
        <CardHeader className="p-4 md:p-5 bg-gradient-to-r from-emerald-900 to-emerald-700 border-b border-emerald-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Smile className="h-5 w-5 md:h-6 md:w-6 text-emerald-300" />
              <h2 className="text-lg md:text-xl font-semibold text-white">Mood Analysis</h2>
            </div>
            <Button variant="ghost" size="icon" className="text-emerald-300 hover:bg-emerald-800/50">
              <Settings className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 md:p-5 bg-zinc-900 text-zinc-100">
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
                <span className="text-3xl md:text-4xl font-bold text-zinc-100">{moodScore}</span>
                <span className="text-xs md:text-sm text-zinc-400 ml-1">/100</span>
              </div>
              <Badge className="mt-1 bg-emerald-900/50 text-emerald-300 hover:bg-emerald-800/70 text-xs border border-emerald-700">
                {getMoodLabel(moodScore)}
              </Badge>
              <h3 className="text-xs md:text-sm text-zinc-400 mt-1">Last assessed: {lastAssessmentDate}</h3>
            </div>
          </div>

          <Separator className="my-3 md:my-4 bg-zinc-800" />
          
          <div className="flex flex-col space-y-2">
            <Button 
              onClick={goToDetailedAnalysis}
              className="bg-emerald-800 hover:bg-emerald-700 text-white text-xs md:text-sm"
            >
              <BarChart className="mr-2 h-4 w-4" />
              View Detailed Analysis
            </Button>
            
            <Button 
              onClick={handleStartAssessment} 
              className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs md:text-sm"
              disabled={isGeneratingQuestions}
            >
              {isGeneratingQuestions ? (
                <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" />
              ) : (
                <>
                  Take New Assessment <ArrowRight className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showAssessment} onOpenChange={setShowAssessment}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto bg-zinc-900 border-zinc-700 text-zinc-100">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">
              {assessmentComplete ? 
                "Mood Assessment Complete" : 
                isGeneratingQuestions ? 
                  "Preparing Your Assessment..." :
                  `Question ${currentQuestion + 1} of ${questions.length}`
              }
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              {assessmentComplete 
                ? "Your assessment has been recorded. View detailed results in the analysis page."
                : isGeneratingQuestions
                  ? "Our AI is creating personalized questions about your current emotional state..."
                  : "Express how you're feeling today to get personalized emotional wellness insights"}
            </DialogDescription>
          </DialogHeader>

          {isGeneratingQuestions && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-emerald-500 mb-4" />
              <p className="text-center text-zinc-400">
                Generating your personalized assessment questions...
              </p>
            </div>
          )}

          {assessmentComplete ? (
            <div className="space-y-4 py-4">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-zinc-100">Your Mood Score: {moodScore}</h3>
                <p className="text-zinc-400">
                  {getMoodLabel(moodScore)} emotional state
                </p>
              </div>
              
              {isGeneratingInsights ? (
                <div className="flex flex-col items-center justify-center py-4">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mb-2" />
                  <p className="text-center text-zinc-400">
                    Analyzing your responses...
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-zinc-300 mb-4">
                    Your assessment has been saved. View the detailed breakdown and recommendations in the analysis page.
                  </p>
                </div>
              )}
            </div>
          ) : (
            !isGeneratingQuestions && (
              <>
                <div className="py-4">
                  <h3 className="text-lg font-medium mb-3 text-zinc-100">{questions[currentQuestion]}</h3>
                  <Textarea
                    placeholder="Take a moment to reflect and express how you're feeling..."
                    className="min-h-32 text-sm bg-zinc-800 text-zinc-200 border-zinc-700 focus:border-emerald-700"
                    value={currentResponse}
                    onChange={handleResponseChange}
                  />
                  <p className="text-xs text-zinc-400 mt-2">
                    Feel free to express yourself honestly. The more details you share, the more personalized your recommendations will be.
                  </p>
                </div>
                <div className="flex justify-between mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (currentQuestion > 0) {
                        setCurrentQuestion(currentQuestion - 1);
                        setCurrentResponse(responses[currentQuestion - 1] || "");
                      }
                    }}
                    disabled={currentQuestion === 0}
                    className="border-zinc-700 text-zinc-900 hover:bg-zinc-800"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={handleSubmitResponse}
                    disabled={currentResponse.trim() === ""}
                    className="bg-emerald-700 hover:bg-emerald-600 text-white"
                  >
                    {currentQuestion === questions.length - 1 ? "Complete Assessment" : "Next Question"}
                  </Button>
                </div>
              </>
            )
          )}
          
          <DialogFooter>
            {assessmentComplete && (
              <div className="w-full space-y-2">
                <Button 
                  onClick={goToDetailedAnalysis} 
                  className="w-full bg-emerald-700 hover:bg-emerald-600 text-white"
                >
                  View Detailed Analysis
                </Button>
                <DialogClose asChild>
                  <Button variant="outline" className="w-full border-zinc-700 text-zinc-900 hover:bg-zinc-800">
                    Close
                  </Button>
                </DialogClose>
              </div>
            )}
            
            {!assessmentComplete && !isGeneratingQuestions && (
              <DialogClose asChild>
                <Button variant="outline" className="w-full border-zinc-700 text-zinc-900 hover:bg-zinc-800">
                  Cancel Assessment
                </Button>
              </DialogClose>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MoodAnalysisCard;