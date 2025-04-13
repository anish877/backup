import React from 'react';
import { MessageSquare, ArrowRight } from 'lucide-react';

const MedicalAIAssistant = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-md mx-auto border border-blue-100 py-16">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="p-4 bg-blue-50 rounded-full mb-4">
          <MessageSquare size={32} className="text-blue-500" />
        </div>
        <h2 className="text-2xl font-medium text-gray-800">Medical AI Consultation</h2>
      </div>
      
      <div className="mb-4 text-center text-gray-600 text-sm">
        Get expert medical guidance instantly
      </div>
      
      <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 px-6 rounded-lg font-medium transition-colors flex items-center justify-center">
        <span>Start Consultation</span>
        <ArrowRight size={20} className="ml-2" />
      </button>
    </div>
  );
};

export default MedicalAIAssistant;