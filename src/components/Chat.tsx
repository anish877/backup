'use client'
import React, { useRef, useEffect, useState } from 'react';
import { Check, Clipboard, User, Send, GitGraphIcon, Paperclip, MessageSquarePlus, X, ChevronRight } from 'lucide-react';
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
    "Summarize today’s health in simple terms",
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
      customToast.success("Copied to clipboard! 📋");
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error(err);
      customToast.error("Failed to copy! ❌");
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
    <div className="flex flex-col w-full h-[90vh] max-w-[70%] mx-auto relative">
      {/* Messages Area */}
      <div className="flex-1 p-4 pb-32 mt-24 overflow-y-auto relative bg-white">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-orange-500">
            <p className="text-center">Chat with Zero</p>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex mb-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`relative max-w-3/4 rounded-lg p-3 ${
                  message.sender === 'user' 
                    ? 'bg-orange-500 text-white rounded-br-none' 
                    : 'bg-white text-gray-800 border border-orange-200 rounded-bl-none shadow-md'
                }`}
                style={{ width: message.sender === 'ai' ? '75%' : 'auto' }}
              >
                <div className="flex flex-col w-full">
                  <div className="flex items-center mb-1">
                    {message.sender === 'ai' ? (
                      <Image src={gemini} alt='gemini' className='size-5 rounded-lg'/>
                    ) : (
                      <User size={16} className="mr-1 text-white" />
                    )}
                    <span className="text-xs opacity-70 mx-1">
                      {message.sender === 'ai' ? 'Zero' : 'You'} • {formatTime(message.timestamp)}
                    </span>
                  </div>
                  
                  <div className="w-full p-3">
                    <div className="whitespace-pre-wrap">{message.text}</div>
                  </div>
    
                  <button 
                    className={`absolute bottom-2 right-2 p-1 rounded-md transition-all ${
                      message.sender === 'user'
                        ? 'text-white hover:text-orange-200'
                        : 'text-orange-400 hover:text-orange-600'
                    }`}
                    onClick={() => copyToClipboard(message.text, message.id)}
                  >
                    {copiedMessageId === message.id ? (
                      <Check size={16} className="text-green-500" />
                    ) : (
                      <Clipboard size={16}/>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex mb-4 justify-start">
            <div className="flex max-w-[75%] rounded-lg p-4 bg-white text-gray-800 border border-orange-200 rounded-bl-none shadow-md">
              <div className="flex items-center space-x-2">
                <Image src={gemini} alt="gemini" className="size-5" />
                <p className="text-xl font-semibold text-transparent bg-clip-text bg-[linear-gradient(to_right,#f97316_0%,#fdba74_50%,#f97316_100%)] bg-[length:200%_100%] animate-[shimmer_1.5s_infinite_linear]">
                  Zero is Thinking
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Component - Fixed at bottom */}
      <div
        className="fixed left-1/2 transform -translate-x-1/2 bottom-6 w-full max-w-3xl p-[2px] rounded-xl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Gradient border */}
        <div 
          className={`absolute inset-0 rounded-xl border-[2px] border-transparent
          bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500 transition-all duration-300
          ${isHovered ? 'opacity-100' : 'opacity-75'}`}
        />

        <div className="relative w-full h-full rounded-xl bg-white p-3">
          {/* Quick Prompts Panel */}
          {showPrompts && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-orange-200 p-2 z-10">
              <div className="flex items-center justify-between border-b border-orange-100 pb-2 mb-2">
                <h3 className="font-medium text-orange-600">Quick Prompts</h3>
                <button 
                  onClick={() => setShowPrompts(false)}
                  className="p-1 hover:bg-orange-100 rounded-full text-orange-500"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {quickPrompts.map((prompt, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-2 hover:bg-orange-50 rounded-md cursor-pointer group mb-1"
                  >
                    <div 
                      onClick={() => insertPrompt(prompt)}
                      className="flex-1 text-gray-700 text-sm"
                    >
                      {prompt}
                    </div>
                    <button 
                      onClick={() => insertAndSend(prompt)}
                      className="opacity-0 group-hover:opacity-100 p-1 bg-orange-100 hover:bg-orange-200 rounded-full text-orange-600 transition-all"
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
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="w-full">
            <div className="relative">
              <textarea
                ref={textAreaRef}
                className="w-full px-3 py-2 text-base font-light text-gray-800 placeholder:text-gray-400
                  outline-none focus:ring-0 focus:border-transparent
                  rounded-lg resize-none font-sans bg-orange-50"
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
                className={`absolute right-2 bottom-2 p-1.5 rounded-md transition-all duration-200
                  ${isEmpty 
                    ? "bg-gray-200 text-gray-400" 
                    : "bg-orange-500 text-white hover:bg-orange-600"}`}
              >
                <Send size={16} className={isEmpty ? "opacity-50" : "opacity-100"} />
              </button>
            </div>
          </form>

          {/* Toolbar */}
          <div className="flex items-center mt-2 px-1">
            <div className="flex items-center space-x-1">
              <button 
                onClick={() => setShowPrompts(!showPrompts)} 
                className={`p-1 rounded-md hover:bg-orange-100 transition-all ${showPrompts ? 'bg-orange-100 text-orange-600' : 'text-orange-400 hover:text-orange-600'}`}
                title="Quick prompts"
              >
                <MessageSquarePlus className="size-4" />
              </button>
              <button onClick={() => setShowModal(true)} className="p-1 rounded-md text-orange-400 hover:text-orange-600 hover:bg-orange-100 transition-all">
                <GitGraphIcon className="size-4" />
              </button>
              <button className="p-1 rounded-md text-orange-400 hover:text-orange-600 hover:bg-orange-100 transition-all">
                <User className="size-4" />
              </button>
              <button className="p-1 rounded-md text-orange-400 hover:text-orange-600 hover:bg-orange-100 transition-all">
                <Paperclip className="size-4" />
              </button>
            </div>
            
            <div className="ml-auto text-xs text-orange-500 font-medium">
              {input.length > 0 && `${input.length} characters`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;