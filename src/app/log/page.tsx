'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await fetch('/api/dailylog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      if (response.ok) {
        toast.success("Your daily health data has been recorded.");
        router.push('/dashboard');
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit daily log');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit daily log");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-orange-500 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Metrics.IQ</h1>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-600"></div>
            <div className="w-8 h-8 rounded-full bg-orange-400"></div>
            <div className="w-8 h-8 rounded-full bg-gray-900"></div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-900 text-white p-6 rounded-lg mb-6">
          <div className="flex items-center mb-4">
            <div className="w-4 h-4 bg-orange-500 rounded mr-2"></div>
            <h2 className="text-xl font-semibold">Health Improvement</h2>
          </div>
          <h1 className="text-2xl font-bold mb-6">Daily Health Log</h1>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="waterIntake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Water Intake (L)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="e.g., 2.5" 
                          className="bg-gray-800 border-gray-700 text-white" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Weight (kg)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="e.g., 70.5" 
                          className="bg-gray-800 border-gray-700 text-white" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="sleepHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Sleep Hours</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.5" 
                          placeholder="e.g., 8" 
                          className="bg-gray-800 border-gray-700 text-white" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="steps"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Steps</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 8000" 
                          className="bg-gray-800 border-gray-700 text-white" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="mood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Mood</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                            <SelectValue placeholder="Select your mood" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-gray-800 border-gray-700 text-white">
                          {moodOptions.map((mood) => (
                            <SelectItem key={mood} value={mood}>
                              {mood}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="mealQuality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Meal Quality</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                            <SelectValue placeholder="Rate meal quality" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-gray-800 border-gray-700 text-white">
                          {mealQualityOptions.map((quality) => (
                            <SelectItem key={quality} value={quality}>
                              {quality}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="symptoms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Any symptoms today? (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter any symptoms you experienced"
                        className="resize-none bg-gray-800 border-gray-700 text-white"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-center pt-4">
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2">
                  Submit Daily Log
                </Button>
              </div>
            </form>
          </Form>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center mb-4">
            <div className="w-4 h-4 bg-orange-500 rounded mr-2"></div>
            <h3 className="text-lg font-semibold">Recent Stats</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="text-3xl font-bold">0L</h4>
              <p className="text-gray-500">Water Today</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="text-3xl font-bold">0</h4>
              <p className="text-gray-500">Steps</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="text-3xl font-bold">0h</h4>
              <p className="text-gray-500">Sleep Last Night</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyLog;