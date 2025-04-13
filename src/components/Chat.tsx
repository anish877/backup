'use client'
import React, { useRef, useEffect, useState } from 'react';
import { Check, Clipboard, User, Send, GitGraphIcon, Paperclip, MessageSquarePlus, X, ChevronRight, Settings } from 'lucide-react';
import Image from 'next/image';
import gemini from '@/images/zero.png'; 
import useMessageStore from '@/store/messages';
import { useParams } from 'next/navigation';
import useTokenStore from '@/store/token';
import { customToast } from './CustomToast';

const ChatComponent: React.FC = () => {
  const { 
    messages, 
    isLoading,
    input, 
    setInput, 
    sendMessage, 
    setShowModal
  } = useMessageStore();
  const { setToken } = useTokenStore();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const params = useParams();
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);
  
  const quickPrompts = [
    "Analyze today's log and suggest improvements",
    "What does my water intake indicate?",
    "How can I improve my sleep schedule?",
    "Give meal tips based on my goal",
    "Explain how my mood affects my health",
    "Suggest a light exercise plan for today",
    "Is my weight on track with my goal?",
    "Summarize today's health in simple terms",
    "Any early signs of health issues?",
    "How can I stay consistent with my habits?"
  ];
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  };

  useEffect(() => {
    const token = localStorage.getItem('githubAccessToken');
    if(!token){
      if(!params) return;
      if(!params.check) return;
      if(!params.check[0]) return;
      localStorage.setItem('githubAccessToken', params.check[1]);
    } else {
      setToken(token);
    }
  }, []);

  const handleInput = () => {
    const textArea = textAreaRef.current;
    if (!textArea) return;
    textArea.style.height = "auto";
    textArea.style.height = `${Math.min(textArea.scrollHeight, 150)}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(id);
      customToast.success("Copied to clipboard");
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error(err);
      customToast.error("Failed to copy");
    }
  };

  const insertPrompt = (prompt: string) => {
    setInput(prompt);
    setShowPrompts(false);
    if (textAreaRef.current) {
      textAreaRef.current.focus();
    }
    handleInput();
  };

  const insertAndSend = (prompt: string) => {
    setInput(prompt);
    setTimeout(() => {
      sendMessage();
      setShowPrompts(false);
    }, 100);
  };

  const isEmpty = input.trim() === '';

  return (
    <div className="flex flex-col w-full h-[90vh] max-w-[80%] mx-auto relative bg-slate-50">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[80%] mx-auto py-3 px-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Image src={gemini} alt="Zero" className="size-6 rounded-md" />
            <span className="font-medium text-gray-800">Zero Assistant</span>
          </div>
          <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-6 pb-32 mt-16 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-md">
              <div className="flex justify-center mb-4">
                <Image src={gemini} alt="Zero" className="size-12 rounded-lg" />
              </div>
              <h3 className="text-center text-lg font-medium text-gray-800 mb-2">
                Welcome to Zero Assistant
              </h3>
              <p className="text-center text-sm text-gray-500 mb-4">
                Your personal health analytics companion. How can I help you today?
              </p>
              <div className="grid grid-cols-2 gap-2">
                {quickPrompts.slice(0, 4).map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => insertAndSend(prompt)}
                    className="text-xs text-left p-2 bg-slate-50 hover:bg-slate-100 border border-gray-100 rounded-md text-gray-700 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex mb-6 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`relative rounded-lg p-4 ${
                  message.sender === 'user' 
                    ? 'bg-gray-700 text-white rounded-br-none' 
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                }`}
                style={{ maxWidth: '75%' }}
              >
                <div className="flex flex-col w-full">
                  <div className="flex items-center mb-2">
                    {message.sender === 'ai' ? (
                      <Image src={gemini} alt='Zero' className='size-5 rounded-md mr-2'/>
                    ) : (
                      <User size={16} className="mr-2 text-gray-300" />
                    )}
                    <span className="text-xs font-medium opacity-80">
                      {message.sender === 'ai' ? 'Zero' : 'You'}
                    </span>
                    <span className="text-xs opacity-60 ml-2">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  
                  <div className="w-full">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.text}
                    </div>
                  </div>
    
                  <button 
                    className={`absolute bottom-2 right-2 p-1.5 rounded-md transition-opacity opacity-0 hover:opacity-100 ${
                      message.sender === 'user'
                        ? 'text-gray-300 hover:bg-gray-600'
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    onClick={() => copyToClipboard(message.text, message.id)}
                  >
                    {copiedMessageId === message.id ? (
                      <Check size={14} className="text-green-500" />
                    ) : (
                      <Clipboard size={14}/>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex mb-6 justify-start">
            <div className="flex max-w-[75%] rounded-lg p-4 bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm">
              <div className="flex items-center space-x-2">
                <Image src={gemini} alt="Zero" className="size-5 rounded-md" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Component */}
      <div className="fixed left-0 right-0 bottom-0 bg-white border-t border-gray-200 py-4">
        <div className="max-w-[80%] mx-auto">
          <div
            className="relative w-full rounded-lg bg-white shadow-sm border border-gray-200"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Quick Prompts Panel */}
            {showPrompts && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-md border border-gray-200 p-3 z-10">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
                  <h3 className="font-medium text-gray-700 text-sm">Suggested Prompts</h3>
                  <button 
                    onClick={() => setShowPrompts(false)}
                    className="p-1 hover:bg-gray-100 rounded-full text-gray-500"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {quickPrompts.map((prompt, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md cursor-pointer group mb-1"
                    >
                      <div 
                        onClick={() => insertPrompt(prompt)}
                        className="flex-1 text-gray-700 text-sm"
                      >
                        {prompt}
                      </div>
                      <button 
                        onClick={() => insertAndSend(prompt)}
                        className="opacity-0 group-hover:opacity-100 p-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-all"
                        title="Insert and send"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Text area container */}
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="w-full px-4 py-3">
              <div className="relative">
                <textarea
                  ref={textAreaRef}
                  className="w-full pr-10 py-2 text-sm font-normal text-gray-800 placeholder:text-gray-400
                    outline-none focus:ring-0 border-none resize-none font-sans bg-transparent"
                  placeholder="Message Zero..."
                  rows={1}
                  value={input}
                  onKeyDown={handleKeyDown}
                  onChange={(e) => setInput(e.target.value)}
                  onInput={handleInput}
                />
                
                {/* Send button */}
                <button 
                  type="submit" 
                  disabled={isEmpty}
                  className={`absolute right-0 bottom-1.5 p-1.5 rounded-md transition-all duration-200
                    ${isEmpty 
                      ? "text-gray-300" 
                      : "bg-gray-700 text-white hover:bg-gray-600"}`}
                >
                  <Send size={16} className={isEmpty ? "opacity-70" : "opacity-100"} />
                </button>
              </div>
            </form>

            {/* Toolbar */}
            <div className="flex items-center px-4 pb-3 border-t border-gray-100 pt-2">
              <div className="flex items-center space-x-1">
                <button 
                  onClick={() => setShowPrompts(!showPrompts)} 
                  className={`p-1.5 rounded-md hover:bg-gray-100 transition-all ${showPrompts ? 'bg-gray-100 text-gray-700' : 'text-gray-500'}`}
                  title="Suggested prompts"
                >
                  <MessageSquarePlus className="size-4" />
                </button>
                <button 
                  onClick={() => setShowModal(true)} 
                  className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
                  title="Log history"
                >
                  <GitGraphIcon className="size-4" />
                </button>
                <button 
                  className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
                  title="User profile"
                >
                  <User className="size-4" />
                </button>
                <button 
                  className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
                  title="Upload attachment"
                >
                  <Paperclip className="size-4" />
                </button>
              </div>
              
              <div className="ml-auto text-xs text-gray-400 font-normal">
                {input.length > 0 && `${input.length} characters`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;