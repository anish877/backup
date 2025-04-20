'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useHealthStore } from '@/store/healthStore';
import { customToast } from '@/components/CustomToast';
import axios from 'axios';

// API base URL
const API_BASE_URL = 'https://healthbackend-production-157d.up.railway.app';

const formSchema = z.object({
  goal: z.enum(['Lose weight', 'Improve sleep', 'Gain muscle', 'Manage stress'], {
    required_error: "Please select a health goal.",
  }),
  age: z.coerce.number().min(1, "Age is required"),
  weight: z.coerce.number().min(1, "Weight is required"),
  gender: z.enum(['male', 'female', 'other'], {
    required_error: "Please select your gender.",
  }),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very active'], {
    required_error: "Please select your activity level.",
  }),
  symptoms: z.string().optional(),
});

const GoalSetup = () => {
  // @ts-expect-error: no need here
  const { setHealthGoal, setUserProfile, setHealthPlan, completeOnboarding } = useHealthStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      goal: undefined,
      age: 0,
      weight: 0,
      gender: undefined,
      activityLevel: undefined,
      symptoms: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Call backend API to set health goal - using cookies for authentication
      const response = await axios.post(
        `${API_BASE_URL}/health-goal`,
        values,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, // This ensures cookies are sent with the request
        }
      );
      
      const {data} = response;
      
      // Update health goal in context
      setHealthGoal(values.goal);
      
      // Update user profile in context
      setUserProfile({
        age: Number(values.age),
        weight: Number(values.weight),
        gender: values.gender,
        activityLevel: values.activityLevel,
        symptoms: values.symptoms ? values.symptoms.split(',').map(s => s.trim()) : [],
      });
      
      // Set health plan from API response
      console.log(data)
      // setHealthPlan(data.healthPlan);
      completeOnboarding();
      
      customToast.success("Your personalized health plan has been generated.");
      router.push('/profile');
    } catch (err) {
      console.error('Error setting health goal:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      customToast.error(err instanceof Error ? err.message : 'Failed to create health plan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="w-full py-10 bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200 shadow-sm">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-orange-600 mb-2">
            Set Your Health Goal
          </h1>
          <div className="w-24 h-1 bg-orange-400 mx-auto mb-4 rounded-full"></div>
          <p className="text-center text-gray-700 max-w-2xl mx-auto text-lg">
            Tell us about your health goals and we'll create a personalized plan tailored just for you
          </p>
        </div>
      </div>
  
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-orange-200">
              <FormField
                control={form.control}
                name="goal"
                render={({ field }) => (
                  <FormItem className="mb-6">
                    <FormLabel className="text-lg font-medium text-gray-800">What's your primary health goal?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-3"
                      >
                        {['Lose weight', 'Improve sleep', 'Gain muscle', 'Manage stress'].map((goal) => (
                          <FormItem key={goal} className="flex items-start space-x-2 space-y-0 border border-orange-200 p-3 rounded-md">
                            <FormControl>
                              <RadioGroupItem 
                                value={goal} 
                                className="border-orange-400 text-orange-500"
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">{goal}</FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            </div>
  
            <div className="bg-white p-6 rounded-lg shadow-sm border border-orange-200">
              <h2 className="text-xl font-medium text-gray-800 mb-6">Personal Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium text-gray-700">Age</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Enter your age" 
                          className="border-gray-300 focus:border-orange-400 focus:ring focus:ring-orange-100 focus:ring-opacity-50" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium text-gray-700">Weight (kg)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Enter your weight" 
                          className="border-gray-300 focus:border-orange-400 focus:ring focus:ring-orange-100 focus:ring-opacity-50" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
              
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium text-gray-700">Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-gray-300 focus:border-orange-400 focus:ring focus:ring-orange-100 focus:ring-opacity-50">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="activityLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium text-gray-700">Activity Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-gray-300 focus:border-orange-400 focus:ring focus:ring-orange-100 focus:ring-opacity-50">
                            <SelectValue placeholder="Select activity level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sedentary">Sedentary (little to no exercise)</SelectItem>
                          <SelectItem value="light">Light (1-3 days/week)</SelectItem>
                          <SelectItem value="moderate">Moderate (3-5 days/week)</SelectItem>
                          <SelectItem value="active">Active (6-7 days/week)</SelectItem>
                          <SelectItem value="very active">Very Active (twice a day)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-orange-200">
              <FormField
                control={form.control}
                name="symptoms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-gray-700">Any symptoms? (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter any symptoms, separated by commas"
                        className="resize-none border-gray-300 focus:border-orange-400 focus:ring focus:ring-orange-100 focus:ring-opacity-50 h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-gray-500 text-sm mt-1">
                      This helps personalize your health plan
                    </FormDescription>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            </div>
  
            <div className="flex justify-center pt-4 px-0">
              <Button 
                type="submit" 
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-md text-lg shadow-md transition-colors"
                disabled={isLoading}
              >
                {isLoading ? "Creating Your Plan..." : "Create My Health Plan"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default GoalSetup;