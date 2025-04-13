import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const ProgressCard = ({ progress, date }: { progress: { nutrition: boolean, sleep: boolean, mood: boolean, water: boolean, completionPercentage: number }, date: Date }) => {
  const { nutrition, sleep, mood, water, completionPercentage } = progress;
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-orange-400 rounded mr-2"></div>
            <h3 className="text-lg font-semibold text-gray-900">Daily Progress</h3>
          </div>
          <p className="text-gray-500 text-sm mt-1">{formatDate(date)}</p>
        </div>
        <div className="w-20 h-20">
          <CircularProgressbar 
            value={completionPercentage} 
            text={`${completionPercentage}%`}
            styles={buildStyles({
              textSize: '22px',
              pathColor: '#f97316',
              textColor: '#f97316',
              trailColor: '#f3f4f6',
            })}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className={`p-3 rounded-lg border ${nutrition ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center">
            {nutrition ? (
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9H6a1 1 0 000 2h3v3a1 1 0 102 0v-3h3a1 1 0 100-2h-3V6a1 1 0 10-2 0v3z" clipRule="evenodd" />
              </svg>
            )}
            <span className={`${nutrition ? 'text-green-700' : 'text-gray-600'} font-medium`}>Nutrition</span>
          </div>
        </div>
        
        <div className={`p-3 rounded-lg border ${sleep ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center">
            {sleep ? (
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9H6a1 1 0 000 2h3v3a1 1 0 102 0v-3h3a1 1 0 100-2h-3V6a1 1 0 10-2 0v3z" clipRule="evenodd" />
              </svg>
            )}
            <span className={`${sleep ? 'text-green-700' : 'text-gray-600'} font-medium`}>Sleep</span>
          </div>
        </div>
        
        <div className={`p-3 rounded-lg border ${mood ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center">
            {mood ? (
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9H6a1 1 0 000 2h3v3a1 1 0 102 0v-3h3a1 1 0 100-2h-3V6a1 1 0 10-2 0v3z" clipRule="evenodd" />
              </svg>
            )}
            <span className={`${mood ? 'text-green-700' : 'text-gray-600'} font-medium`}>Mood</span>
          </div>
        </div>
        
        <div className={`p-3 rounded-lg border ${water ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center">
            {water ? (
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9H6a1 1 0 000 2h3v3a1 1 0 102 0v-3h3a1 1 0 100-2h-3V6a1 1 0 10-2 0v3z" clipRule="evenodd" />
              </svg>
            )}
            <span className={`${water ? 'text-green-700' : 'text-gray-600'} font-medium`}>Water</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressCard;