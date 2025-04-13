import React, { useState, useEffect } from 'react';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import axios from 'axios';

const days = ['Saturday', 'Monday', 'Tuesday', 'Wednesday'];
const hours = ['1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm', '9pm'];

const generateData = () => {
  const data = [];
  for (let i = 0; i < hours.length; i++) {
    data.push({
      hour: hours[i],
      value: Math.floor(Math.random() * 400) + 100,
      value2: Math.floor(Math.random() * 300) + 50,
    });
  }
  return data;
};

const HealthImprovementChart = () => {
  const [healthData, setHealthData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState('');

  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/health-scores?days=7',{withCredentials:true});
        if (!response) {
          throw new Error('Failed to fetch health data');
        }
        const result =  response.data
        
        if (result.success && result.data) {
          // Format the data for the chart
          const formattedData = result.data.map((item: { date: string; nutrition: any; mood: any; sleep: any; }) => ({
            date: item.date,
            formattedDate: format(parseISO(item.date), 'EEE'),
            nutrition: item.nutrition || 0,
            mood: item.mood || 0,
            sleep: item.sleep || 0
          }));
          
          setHealthData(formattedData);
          
          // Set the most recent day as selected
          if (formattedData.length > 0) {
            setSelectedDay(formattedData[formattedData.length - 1].formattedDate);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHealthData();
  }, []);

  const calculateChange = (dataKey: string) => {
    if (healthData.length < 2) return '+0%';
    
    const currentValue = healthData[healthData.length - 1][dataKey] || 0;
    const previousValue = healthData[healthData.length - 2][dataKey] || 0;
    
    if (previousValue === 0) return '+0%';
    
    const changePercent = ((currentValue - previousValue) / previousValue) * 100;
    return `${changePercent > 0 ? '+' : ''}${Math.round(changePercent)}%`;
  };

  // Get the most recent day data for the badge
  const getChangePercent = () => {
    const moodChange = calculateChange('mood');
    return moodChange;
  };

  const days = healthData.map(item => item.formattedDate);
  const hours = ['6am', '9am', '12pm', '3pm', '6pm', '9pm']; // Simplified hours for display

  if (isLoading) {
    return (
      <div className="bg-gray-800 p-6 rounded-3xl flex items-center justify-center h-64">
        <p className="text-gray-400">Loading health data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 p-6 rounded-3xl flex items-center justify-center h-64">
        <p className="text-red-400">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#242424] p-6 rounded-3xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-5 h-5 rounded bg-orange-500 mr-2"></div>
          <h2 className="text-lg font-semibold text-white">Health Improvement</h2>
        </div>
        <div className="flex space-x-2">
          <Badge className="bg-orange-500 text-white">{getChangePercent()}</Badge>
          <Badge className="bg-[#242424] text-white">{selectedDay}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {days.map((day) => (
          <div 
            key={day} 
            className={`text-center text-sm cursor-pointer ${selectedDay === day ? 'text-orange-500 font-medium' : 'text-gray-400'}`}
            onClick={() => setSelectedDay(day)}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="h-56 relative">
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400">
          <span>100</span>
          <span>50</span>
          <span>0</span>
        </div>
        <div className="ml-8 h-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={healthData}>
              <defs>
                <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF5500" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#FF5500" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#4CAF50" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorNutrition" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="formattedDate" 
                tick={{ fontSize: 10 }} 
                axisLine={false} 
                tickLine={false} 
              />
              <YAxis hide={true} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
                itemStyle={{ color: '#fff' }}
                formatter={(value) => [`${value}`, '']}
              />
              <Legend 
                verticalAlign="top" 
                height={36}
                wrapperStyle={{ fontSize: '12px', color: '#fff' }}
              />
              <Area
                type="monotone"
                dataKey="mood"
                name="Mood"
                stroke="#FF5500"
                fillOpacity={0.2}
                fill="url(#colorMood)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="sleep"
                name="Sleep"
                stroke="#4CAF50"
                fillOpacity={0.1}
                fill="url(#colorSleep)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="nutrition"
                name="Nutrition"
                stroke="#3B82F6"
                fillOpacity={0.1}
                fill="url(#colorNutrition)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex justify-between mt-4">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-orange-500 mr-1"></div>
          <span className="text-xs text-gray-400">Mood</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
          <span className="text-xs text-gray-400">Sleep</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
          <span className="text-xs text-gray-400">Nutrition</span>
        </div>
      </div>
    </div>
  );
};

export default HealthImprovementChart;