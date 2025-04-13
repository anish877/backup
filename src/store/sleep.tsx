import { createContext, useContext, useState, ReactNode } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

// Types
export interface SleepQuestionData {
  questions: string[];
  options: string[][];
}

// Sleep Context interface
interface SleepContextType {
  isLoading: boolean;
  generateSleepQuestions: () => Promise<SleepQuestionData>;
  generateSleepInsights: (
    questions: string[],
    answers: Record<number, string>,
    sleepScore: number
  ) => Promise<string[]>;
}

// Create context with default values
const SleepContext = createContext<SleepContextType>({
  isLoading: false,
  generateSleepQuestions: async () => ({ questions: [], options: [] }),
  generateSleepInsights: async () => [],
});

// Helper function to clean up AI text
function beautifyPlainText(text: string): string {
  let clean = text.replace(/\*\*(.*?)\*\*/g, '$1');
  clean = clean.replace(/\*(.*?)\*/g, '$1');
  return clean;
}

// Sleep Context Provider component
export const SleepContextProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);

  // Function to generate sleep assessment questions
  const generateSleepQuestions = async (): Promise<SleepQuestionData> => {
    setIsLoading(true);
    
    try {
      const prompt = `Generate 5 psychological questions related to sleep quality assessment. Each question should have 4-5 multiple choice options.
      Format your response exactly like this example:
      
      QUESTION: How many hours of sleep do you typically get each night?
      OPTIONS: Less than 5, 5-6, 7-8, More than 8
      
      QUESTION: Do you have trouble falling asleep?
      OPTIONS: Never, Rarely, Sometimes, Often, Always
      
      QUESTION: Another question here?
      OPTIONS: Option 1, Option 2, Option 3, Option 4
      
      Just provide the questions and options in exactly this format - no introductions or explanations and make question unique and psychological.`;

      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const response = await model.generateContent(prompt);
      const text = response.response.text();
      
      // Parse the AI response to extract questions and options
      //@ts-expect-error: no need here
      const questionMatches = text.match(/QUESTION:(.*?)(?=QUESTION:|$)/gs) || [];
      const parsedQuestions = questionMatches.map(q => q.replace('QUESTION:', '').trim());
      //@ts-expect-error: no need here
      const optionMatches = text.match(/OPTIONS:(.*?)(?=QUESTION:|$)/gs) || [];
      const parsedOptions = optionMatches.map(o => 
        o.replace('OPTIONS:', '')
          .split(',')
          .map(opt => opt.trim())
      );
      
      if (parsedQuestions.length < 3 || parsedOptions.length < 3) {
        return getDefaultSleepQuestions();
      }
      
      return {
        questions: parsedQuestions,
        options: parsedOptions
      };
    } catch (error) {
      console.error("Error generating sleep questions:", error);
      return getDefaultSleepQuestions();
    } finally {
      setIsLoading(false);
    }
  };

  // Function to generate sleep insights based on answers
  const generateSleepInsights = async (
    questions: string[],
    answers: Record<number, string>,
    sleepScore: number
  ): Promise<string[]> => {
    setIsLoading(true);
    
    try {
      // Create a formatted string of the user's answers
      const answersText = Object.entries(answers).map(([key, value]) => {
        const questionIndex = parseInt(key);
        return `Question: ${questions[questionIndex]}\nAnswer: ${value}`;
      }).join('\n\n');
      
      // Prepare the prompt for the AI
      const promptForInsights = `Based on these sleep assessment answers, provide exactly 3 specific, actionable recommendations to improve sleep quality. Format each recommendation as a separate paragraph. Keep each recommendation under 15 words if possible.

${answersText}

Sleep Score: ${sleepScore}/100

Provide your three recommendations without any introduction or explanation. Just list the three pieces of advice, one per paragraph.`;

      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const response = await model.generateContent(promptForInsights);
      const text = response.response.text();
      
      // Parse the response into 3 insights
      let parsedInsights = text.split('\n\n')
        .filter(line => line.trim().length > 0)
        .slice(0, 3);
      
      if (parsedInsights.length < 3) {
        // If we couldn't get 3 insights, use the text as one insight and add defaults
        parsedInsights = [
          text.trim(),
          "Maintain a consistent sleep schedule, even on weekends",
          "Keep your bedroom cool (around 65°F/18°C) for optimal sleep"
        ].slice(0, 3);
      }
      
      return parsedInsights;
    } catch (error) {
      console.error("Error generating sleep insights:", error);
      return [
        "Maintain a consistent sleep schedule, even on weekends",
        "Reduce screen time 1 hour before bed to improve sleep quality",
        "Keep your bedroom cool (around 65°F/18°C) for optimal sleep"
      ];
    } finally {
      setIsLoading(false);
    }
  };

  // Default sleep questions
  function getDefaultSleepQuestions(): SleepQuestionData {
    return {
      questions: [
        "How many hours of sleep do you typically get each night?",
        "Do you have trouble falling asleep?",
        "Do you wake up during the night?",
        "Do you feel rested when you wake up?",
        "Do you use electronic devices before bed?"
      ],
      options: [
        ["Less than 5", "5-6", "7-8", "More than 8"],
        ["Never", "Rarely", "Sometimes", "Often", "Always"],
        ["Never", "Rarely", "Sometimes", "Often", "Always"],
        ["Never", "Rarely", "Sometimes", "Often", "Always"],
        ["Never", "Rarely", "Sometimes", "Often", "Always"]
      ]
    };
  }

  // Providing the context value
  const contextValue = {
    isLoading,
    generateSleepQuestions,
    generateSleepInsights
  };

  return (
    <SleepContext.Provider value={contextValue}>
      {children}
    </SleepContext.Provider>
  );
};

// Custom hook for using the sleep context
export const useSleepContext = () => useContext(SleepContext);

// Export a hook that can be used for consuming the context
export default useSleepContext;