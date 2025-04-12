
import React from 'react';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Badge } from '@/components/ui/badge';

const days = ['Saturday', 'Monday', 'Tuesday', 'Wednesday'];
const hours = ['1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm', '9pm'];

// Generate random data for the chart
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
  const data = generateData();

  return (
    <div className="bg-[#242424] p-6 rounded-3xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-5 h-5 rounded bg-brandOrange mr-2"></div>
          <h2 className="text-lg font-semibold text-white">Health Improvement</h2>
        </div>
        <div className="flex space-x-2">
          <Badge className="bg-brandOrange text-white">+12%</Badge>
          <Badge className="bg-[#333] text-white">Mon</Badge>
        </div>
      </div>

      <div className="grid grid-cols-4 mb-2">
        {days.map((day) => (
          <div key={day} className="text-center text-sm text-gray-400">
            {day}
          </div>
        ))}
      </div>

      <div className="h-40 relative">
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400">
          <span>520</span>
          <span>260</span>
          <span>52</span>
        </div>
        <div className="ml-8 h-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF5500" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#FF5500" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorValue2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#4CAF50" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide={true} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#FF5500"
                fillOpacity={0.2}
                fill="url(#colorValue)"
              />
              <Area
                type="monotone"
                dataKey="value2"
                stroke="#4CAF50"
                fillOpacity={0.1}
                fill="url(#colorValue2)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-9 mt-1">
        {hours.map((hour) => (
          <div key={hour} className="text-center text-xs text-gray-400">
            {hour}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HealthImprovementChart;