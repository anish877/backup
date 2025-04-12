import { create } from "zustand";
import { v4 as uuidv4 } from 'uuid'; 
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface Message {
  id: string;
  text: string;
  sender: 'ai' | 'user';
  timestamp: Date;
  isCode?: boolean;
}

interface MessageState {
  messages: Message[];
  addMessage: (message: Partial<Message>) => Message;
  input: string;
  setInput: (text: string) => void;
  showModal: boolean
  setShowModal: (value: boolean) => void
  isFocused: boolean;
  setIsFocused: (value: boolean) => void;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  currentStreamingMessage: string | null,
  sendMessage: () => Promise<void>;
  handleAIResponse: (userMessage: string) => Promise<void>;
  latestAIMessageId: string | null;
  sendToGeminiStream: (userMessage: string) => Promise<void>
}
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
const useMessageStore = create<MessageState>((set, get) => ({
  
  sendToGeminiStream: async  (
    userMessage: string,
  ) => {
  
  
    const aiMessageId = Date.now() + 1 + '';
    set((state) => ({
      messages: [...state.messages, {
        id: aiMessageId,
        text: '',
        sender: 'ai',
        timestamp: new Date()
      }],
      currentStreamingMessage: aiMessageId
    }));
  

    try {
      function beautifyPlainText(text: string): string {

        let clean = text.replace(/\*\*(.*?)\*\*/g, '$1');

        clean = clean.replace(/\*(.*?)\*/g, '$1');
        return clean;
      }
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const instruction = `You are a certified virtual health advisor. You always receive prior context about the individual’s lifestyle, goals, symptoms, and daily habits. Based on this context, your task is to answer any health-related queries the user asks you.

Be empathetic but straightforward. Your suggestions should be:
- Practical and easy to follow
- Centered around preventive healthcare, lifestyle habits, and early action
- Backed by general medical knowledge and wellness practices (not medical diagnosis)
- Make sure not to overcomplicate

If a question is too complex or sounds like it needs medical attention, clearly recommend the user consult a real doctor.

Format answers in bullet points or short paragraphs when appropriate. Do not hallucinate facts. Stay concise and focused on helping the user improve their daily health habits, also don't show that you have got some previous prompt treat the usermessage after the colon independently keeping in mind the instruction  If you get prompt about any other field simply answer politely you aren't trained for that field. The user message starts after the colon:`;
      const responseStream = await model.generateContentStream(instruction + userMessage);
      console.log(responseStream)
      for await (const chunk of responseStream.stream) {
        const textChunk = chunk.text();
        
        set((state) => {
          const updatedMessages = state.messages.map(msg => {
            if (msg.id === state.currentStreamingMessage) {
              return { ...msg, text: msg.text + beautifyPlainText(textChunk) };
            }
            return msg;
          });
          console.log(updatedMessages)
          return { messages: updatedMessages };
        });
      }
    } catch (error) {
      console.error("Streaming error:", error);

      set((state) => {
        const updatedMessages = state.messages.map(msg => {
          if (msg.id === state.currentStreamingMessage) {
            return { ...msg, text: "Error: Could not process your request." };
          }
          return msg;
        });
        
        return { messages: updatedMessages };
      });
    } finally {
      set({ isLoading: false, currentStreamingMessage: null });
    }
  },
  messages: [],
  showModal: false,
  setShowModal: (value: boolean) => set({ showModal: value }),
  currentStreamingMessage: null,
  addMessage: (messageData: Partial<Message>) => {
    const message: Message = {
      id: messageData.id || uuidv4(),
      text: messageData.text || '',
      sender: messageData.sender || 'user',
      timestamp: messageData.timestamp || new Date(),
      isCode: messageData.isCode || false
    };
    set((state) => ({
      messages: [...state.messages, message]
    }));
    return message;
  },
  input: '',
  setInput: (text) => set({ input: text }),
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  isFocused: false,
  setIsFocused: (focused) => set({ isFocused: focused }),
  latestAIMessageId: null,

  sendMessage: async () => {
    const { input, setInput, handleAIResponse } = get();
    if (!input.trim()) return;

    const messageText = input;
    setInput('');
    await handleAIResponse(messageText);
  },

  handleAIResponse: async (userMessage: string) => {
    const { addMessage, setIsLoading, sendToGeminiStream } = get();

    if (!userMessage.trim()) return;

    addMessage({
      sender: 'user',
      text: userMessage,
      isCode: false
    });

    setIsLoading(true);

    try {
      await sendToGeminiStream(userMessage)
    } catch (error) {
      console.error('AI Response Error:', error);
      addMessage({
        sender: 'ai',
        text: "Sorry, I encountered an error processing your request.",
        isCode: false
      });
      setIsLoading(false);
    }
  }
}));

export default useMessageStore;