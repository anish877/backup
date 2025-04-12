import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Smile, Settings, ArrowRight, Loader2, AlertTriangle, Activity, Brain, Coffee, Sun } from 'lucide-react';
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
import { Textarea } from "@/components/ui/textarea";
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API client
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

const MoodAnalysisCard = () => {
  // States for UI
  const [showAssessment, setShowAssessment] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState<string[]>([]);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [currentResponse, setCurrentResponse] = useState("");
  const [moodScore, setMoodScore] = useState(72);
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [insights, setInsights] = useState<string[]>([
    "Practice gratitude - write down three things you appreciate today",
    "Take a 10-minute nature break to restore mental balance",
    "Connect with a friend or family member for positive social interaction"
  ]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [lastAssessmentDate, setLastAssessmentDate] = useState("Today");
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [moodIcon, setMoodIcon] = useState(<Smile className="w-5 h-5 text-emerald-500" />);
  const [moodCategories, setMoodCategories] = useState<{[key: string]: number}>({
    "Happiness": 68,
    "Energy": 65,
    "Calm": 70,
    "Focus": 75,
    "Optimism": 80
  });

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
      
      // Parse the response
      //@ts-expect-error: no need here
      const analysisMatch = aiResponse.match(/ANALYSIS:(.*?)(?=\n\nICON:|\n\nRECOMMENDATIONS:|$)/s);
      //@ts-expect-error: no need here
      const iconMatch = aiResponse.match(/ICON:(.*?)(?=\n\nRECOMMENDATIONS:|$)/s);
      //@ts-expect-error: no need here
      const recommendationsMatch = aiResponse.match(/RECOMMENDATIONS:(.*?)(?=\n\nCATEGORY_SCORES:|$)/s);
      //@ts-expect-error: no need here
      const categoryScoresMatch = aiResponse.match(/CATEGORY_SCORES:(.*?)$/s);
      
      // Set AI analysis
      if (analysisMatch && analysisMatch[1]) {
        setAiAnalysis(analysisMatch[1].trim());
      } else {
        setAiAnalysis("Your responses suggest a mixed emotional state with both positive and challenging elements. You appear to be managing reasonably well but could benefit from some targeted emotional support strategies.");
      }
      
      // Set icon based on mood
      if (iconMatch && iconMatch[1]) {
        const iconName = iconMatch[1].trim().toLowerCase();
        switch (iconName) {
          case 'smile':
            setMoodIcon(<Smile className="w-5 h-5 text-emerald-500" />);
            break;
          case 'frown':
            setMoodIcon(<AlertTriangle className="w-5 h-5 text-emerald-500" />);
            break;
          case 'activity':
            setMoodIcon(<Activity className="w-5 h-5 text-emerald-500" />);
            break;
          case 'brain':
            setMoodIcon(<Brain className="w-5 h-5 text-emerald-500" />);
            break;
          case 'sun':
            setMoodIcon(<Sun className="w-5 h-5 text-emerald-500" />);
            break;
          case 'coffee':
            setMoodIcon(<Coffee className="w-5 h-5 text-emerald-500" />);
            break;
          default:
            setMoodIcon(<Smile className="w-5 h-5 text-emerald-500" />);
        }
      }
      
      // Set recommendations
      if (recommendationsMatch && recommendationsMatch[1]) {
        const recLines = recommendationsMatch[1].trim().split('\n').filter(line => line.trim() !== '');
        if (recLines.length >= 3) {
          setInsights(recLines.slice(0, 3));
        } else {
          setInsights([
            "Take a 15-minute walk in nature",
            "Practice deep breathing for 5 minutes",
            "Connect with a supportive friend today"
          ]);
        }
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
      
      // Calculate mood score as the average of category scores
      const totalScore = Object.values(categoryScores).reduce((sum, score) => sum + score, 0);
      const averageScore = Math.round(totalScore / Object.values(categoryScores).length);
      
      // Set the mood score and last assessment date
      setMoodScore(averageScore);
      setLastAssessmentDate("Today");
      
    } catch (error) {
      console.error("Error generating insights:", error);
      
      // Default insights and analysis
      setInsights([
        "Take a 15-minute walk in nature",
        "Practice deep breathing for 5 minutes",
        "Connect with a supportive friend today"
      ]);
      setAiAnalysis("Based on your responses, you seem to be experiencing a mix of emotions today. It might help to take some time for self-care and reflection.");
      
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

  // Get color for category score
  const getCategoryColor = (score: number): string => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 65) return 'text-emerald-600';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Get background color for progress bar
  const getProgressColor = (score: number): string => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 65) return 'bg-emerald-600';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Get mood label based on score
  const getMoodLabel = (score: number): string => {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Fair";
    return "Needs attention";
  };

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
          <div className="flex items-start justify-between mb-4 md:mb-5">
            <div>
              <div className="flex items-baseline">
                <span className="text-3xl md:text-4xl font-bold text-zinc-100">{moodScore}</span>
                <span className="text-xs md:text-sm text-zinc-400 ml-1">/100</span>
                <Badge className="ml-2 md:ml-3 bg-emerald-900/50 text-emerald-300 hover:bg-emerald-800/70 text-xs border border-emerald-700">
                  {moodScore > 70 ? '+' : ''}{moodScore - 65}% from avg
                </Badge>
              </div>
              <h3 className="text-xs md:text-sm text-zinc-400 mt-1">Mood Score • Last assessed: {lastAssessmentDate}</h3>
              
              <div className="flex space-x-1 mt-2 md:mt-3">
                {[...Array(10)].map((_, i) => (
                  <span 
                    key={i} 
                    className="inline-block w-6 md:w-8 h-1.5 rounded-full" 
                    style={{ 
                      backgroundColor: i < (moodScore / 10) ? '#059669' : '#134E40'
                    }}
                  ></span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {Object.entries(moodCategories).map(([category, score]) => (
              <div key={category} className="border border-zinc-800 rounded-lg p-2 bg-zinc-800/50">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-zinc-300">{category}</span>
                  <span className={`text-xs font-medium ${getCategoryColor(score)}`}>{score}</span>
                </div>
                <Progress value={score} className="h-1.5" 
                  style={{backgroundColor: '#134E40'}}
                >
                  <div className={`h-full ${getProgressColor(score)}`} style={{width: `${score}%`}}></div>
                </Progress>
              </div>
            ))}
          </div>

          <Separator className="my-3 md:my-4 bg-zinc-800" />
          
          <div className="space-y-3 md:space-y-4 mt-3 md:mt-4">
            <h3 className="font-semibold text-base md:text-lg text-zinc-100">Recommendations</h3>
            
            {insights.map((insight, index) => (
              <div key={index} className="flex items-start bg-emerald-900/20 p-2 md:p-3 rounded-lg border border-emerald-900/50">
                <div className="flex-shrink-0 bg-emerald-800/70 p-1.5 md:p-2 rounded-full mr-2 md:mr-3">
                  <span className="flex items-center justify-center w-3 h-3 md:w-4 md:h-4 text-xs font-bold text-emerald-300">{index + 1}</span>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-zinc-200">{insight}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 md:mt-6 flex items-center justify-between py-2 md:py-3 px-3 md:px-4 bg-zinc-800/70 rounded-lg border border-zinc-700">
            <div>
              <p className="text-xs md:text-sm font-medium text-zinc-100">Take today's assessment</p>
              <p className="text-xs text-zinc-400 hidden md:block">Get personalized wellness recommendations</p>
            </div>
            <Button 
              onClick={handleStartAssessment} 
              className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs md:text-sm py-1 px-2 md:py-2 md:px-3"
              disabled={isGeneratingQuestions}
            >
              {isGeneratingQuestions ? (
                <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" />
              ) : (
                <>
                  Start <ArrowRight className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4" />
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
                "Your Mood Assessment Results" : 
                isGeneratingQuestions ? 
                  "Preparing Your Assessment..." :
                  `Question ${currentQuestion + 1} of ${questions.length}`
              }
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              {assessmentComplete 
                ? "Based on your responses, we've analyzed your emotional state and generated personalized recommendations."
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
                <div className="inline-block p-4 rounded-full bg-emerald-900/40 mb-2 border border-emerald-800/70">
                  {moodIcon}
                </div>
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
                <>
                  <div className="bg-emerald-900/20 p-4 rounded-lg mb-4 border border-emerald-900/50">
                    <h4 className="font-medium text-emerald-400 mb-2">AI Analysis</h4>
                    <p className="text-sm text-zinc-300">{aiAnalysis}</p>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <h4 className="font-medium text-zinc-100">Emotional State Breakdown</h4>
                    {Object.entries(moodCategories).map(([category, score]) => (
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
                  
                  <div>
                    <h4 className="font-medium mb-2 text-zinc-100">Personalized Recommendations</h4>
                    {insights.map((insight, index) => (
                      <div key={index} className="flex items-start bg-emerald-900/20 p-3 rounded-lg mb-2 border border-emerald-900/50">
                        <div className="flex-shrink-0 bg-emerald-800/70 p-2 rounded-full mr-3">
                          <span className="flex items-center justify-center w-4 h-4 text-xs font-bold text-emerald-300">{index + 1}</span>
                        </div>
                        <p className="text-sm text-zinc-300">{insight}</p>
                      </div>
                    ))}
                  </div>
                </>
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
              <DialogClose asChild>
                <Button className="w-full bg-emerald-700 hover:bg-emerald-600 text-white">
                  Close and Save Results
                </Button>
              </DialogClose>
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