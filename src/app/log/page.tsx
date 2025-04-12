'use client';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { customToast } from '@/components/CustomToast';
import axios from 'axios';

const formSchema = z.object({
  waterIntake: z.coerce.number().min(0, "Water intake cannot be negative"),
  mood: z.string().min(1, "Please select your mood"),
  weight: z.coerce.number().min(0, "Weight cannot be negative"),
  sleepHours: z.coerce.number().min(0, "Sleep hours cannot be negative"),
  steps: z.coerce.number().int().min(0, "Steps cannot be negative"),
  mealQuality: z.string().min(1, "Please rate your meal quality"),
  symptoms: z.string().optional(),
});

const moodOptions = ["Great", "Good", "Neutral", "Bad", "Terrible"];
const mealQualityOptions = ["Excellent", "Good", "Average", "Poor", "Bad"];

const DailyLog = () => {
  const router = useRouter();
  const [todayStats, setTodayStats] = useState({
    waterIntake: 0,
    steps: 0,
    sleepHours: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      waterIntake: 0,
      mood: "Neutral",
      weight: 0,
      sleepHours: 0,
      steps: 0,
      mealQuality: "Average",
      symptoms: '',
    },
  });

  useEffect(() => {
    const fetchTodayLog = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND}/dailyLog/today`,
          {
            withCredentials: true, // to send cookies/session
          }
        );
        
        if (response.data.success && response.data.data) {
          const logData = response.data.data;
          
          // Update the stats display
          setTodayStats({
            waterIntake: logData.waterIntake,
            steps: logData.steps,
            sleepHours: logData.sleepHours
          });

          // Pre-fill the form with today's data
          form.reset({
            waterIntake: logData.waterIntake,
            mood: logData.mood,
            weight: logData.weight,
            sleepHours: logData.sleepHours,
            steps: logData.steps,
            mealQuality: logData.mealQuality,
            symptoms: logData.symptoms || '',
          });
        }
      } catch (error) {
        console.error("Error fetching today's log:", error);
        // No need to show error toast here as not having a log is normal
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodayLog();
  }, [form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND}/dailyLog`,
        values,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );
      
      if (response.data.success) {
        // Update the stats with the new values
        setTodayStats({
          waterIntake: values.waterIntake,
          steps: values.steps,
          sleepHours: values.sleepHours
        });
        
        customToast.success("Your daily health data has been recorded.");
        router.push('/dashboard');
      } else {
        const { error } = response.data;
        throw new Error(error.message || 'Failed to submit daily log');
      }
    } catch (error) {
      customToast.error(error instanceof Error ? error.message : "Failed to submit daily log");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white text-gray-800 p-6 rounded-lg mb-6 border border-gray-100 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-4 h-4 bg-orange-400 rounded mr-2"></div>
            <h2 className="text-xl font-semibold text-gray-900">Health Improvement</h2>
          </div>
          <h1 className="text-2xl font-bold mb-6 text-gray-900">Daily Health Log</h1>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="waterIntake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-800">Water Intake (L)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="e.g., 2.5" 
                          className="bg-white border-gray-200 text-gray-800 focus:ring-orange-400 focus:border-orange-400" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-orange-500" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-800">Weight (kg)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="e.g., 70.5" 
                          className="bg-white border-gray-200 text-gray-800 focus:ring-orange-400 focus:border-orange-400" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-orange-500" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="sleepHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-800">Sleep Hours</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.5" 
                          placeholder="e.g., 8" 
                          className="bg-white border-gray-200 text-gray-800 focus:ring-orange-400 focus:border-orange-400" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-orange-500" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="steps"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-800">Steps</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 8000" 
                          className="bg-white border-gray-200 text-gray-800 focus:ring-orange-400 focus:border-orange-400" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-orange-500" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="mood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-800">Mood</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-white border-gray-200 text-gray-800 focus:ring-orange-400 focus:border-orange-400">
                            <SelectValue placeholder="Select your mood" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white border-gray-200 text-gray-800">
                          {moodOptions.map((mood) => (
                            <SelectItem key={mood} value={mood} className="text-gray-700 hover:bg-orange-50">
                              {mood}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-orange-500" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="mealQuality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-800">Meal Quality</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-white border-gray-200 text-gray-800 focus:ring-orange-400 focus:border-orange-400">
                            <SelectValue placeholder="Rate meal quality" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white border-gray-200 text-gray-800">
                          {mealQualityOptions.map((quality) => (
                            <SelectItem key={quality} value={quality} className="text-gray-700 hover:bg-orange-50">
                              {quality}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-orange-500" />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="symptoms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-800">Any symptoms today? (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter any symptoms you experienced"
                        className="resize-none bg-white border-gray-200 text-gray-800 focus:ring-orange-400 focus:border-orange-400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-orange-500" />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-center pt-4">
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2 shadow-sm">
                  Submit Daily Log
                </Button>
              </div>
            </form>
          </Form>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex items-center mb-4">
            <div className="w-4 h-4 bg-orange-400 rounded mr-2"></div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Stats</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-100 rounded-lg bg-white shadow-sm">
              <h4 className="text-3xl font-bold text-orange-500">{todayStats.waterIntake}L</h4>
              <p className="text-gray-600">Water Today</p>
            </div>
            <div className="p-4 border border-gray-100 rounded-lg bg-white shadow-sm">
              <h4 className="text-3xl font-bold text-orange-500">{todayStats.steps}</h4>
              <p className="text-gray-600">Steps</p>
            </div>
            <div className="p-4 border border-gray-100 rounded-lg bg-white shadow-sm">
              <h4 className="text-3xl font-bold text-orange-500">{todayStats.sleepHours}h</h4>
              <p className="text-gray-600">Sleep Last Night</p>
            </div>
          </div>
          
          {isLoading && (
            <div className="text-center py-4 text-gray-500">
              Loading your stats...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyLog;