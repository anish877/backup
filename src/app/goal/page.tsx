'use client';
import React, { useState } from 'react';
import NavBar from '@/components/NavBar';
import { useHealth } from '@/context/HealthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

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
  const { setHealthGoal, setUserProfile, setHealthPlan, completeOnboarding } = useHealth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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

    // Mock AI response for now
    // In a real app, this would be a call to an API that uses OpenAI
    setTimeout(() => {
      const mockHealthPlan = getMockHealthPlan(values.goal);
      setHealthPlan(mockHealthPlan);
      completeOnboarding();
      
      toast({
        title: "Health Plan Created",
        description: "Your personalized health plan has been generated.",
      });
      
      setIsLoading(false);
      router.push('/dashboard');
    }, 1500);
  };

  // Mock function to generate health plan based on goal
  const getMockHealthPlan = (goal: string) => {
    switch (goal) {
      case 'Lose weight':
        return {
          waterIntake: '3.2L',
          sleepHours: '7-8 hours',
          exercise: '45 min cardio + 15 min strength training',
          meals: ['High-protein breakfast', 'Low-carb lunch', 'Small portion dinner'],
          tips: ['Avoid sugary drinks', 'Eat slowly', 'Take 10,000 steps daily']
        };
      case 'Improve sleep':
        return {
          waterIntake: '2.5L',
          sleepHours: '8-9 hours',
          exercise: '30 min yoga + 20 min walk',
          meals: ['Light dinner 3 hours before bed', 'Caffeine-free after 2pm'],
          tips: ['No screens 1 hour before bed', 'Keep bedroom cool and dark', 'Consistent sleep schedule']
        };
      case 'Gain muscle':
        return {
          waterIntake: '4L',
          sleepHours: '8 hours',
          exercise: '45 min weight training + 10 min core',
          meals: ['Protein-rich breakfast', 'Post-workout protein shake', 'Carb-rich dinner'],
          tips: ['Focus on progressive overload', 'Rest 48 hours between muscle groups', 'Track protein intake']
        };
      case 'Manage stress':
        return {
          waterIntake: '3L',
          sleepHours: '7-8 hours',
          exercise: '20 min meditation + 30 min walk',
          meals: ['Balanced meals rich in Omega-3', 'Avoid excessive caffeine'],
          tips: ['Practice deep breathing', 'Take regular breaks', 'Journal daily']
        };
      default:
        return {
          waterIntake: '2.5L',
          sleepHours: '7-8 hours',
          exercise: '30 min moderate activity',
          meals: ['Balanced meals', 'Regular eating schedule'],
          tips: ['Stay hydrated', 'Get enough sleep']
        };
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="bg-white p-4 rounded-b-3xl shadow-md">
        <NavBar />
      </div>
      
      <div className="container mx-auto px-4 py-6">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Set Your Health Goal</CardTitle>
            <CardDescription className="text-center">
              Tell us about your health goals and we'll create a personalized plan for you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="goal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What's your primary health goal?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-2 gap-4"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Lose weight" />
                            </FormControl>
                            <FormLabel className="font-normal">Lose weight</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Improve sleep" />
                            </FormControl>
                            <FormLabel className="font-normal">Improve sleep</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Gain muscle" />
                            </FormControl>
                            <FormLabel className="font-normal">Gain muscle</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Manage stress" />
                            </FormControl>
                            <FormLabel className="font-normal">Manage stress</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Enter your age" {...field} />
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
                        <FormLabel>Weight (kg)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Enter your weight" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="activityLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Activity Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
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
                      <FormLabel>Any symptoms? (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter any symptoms, separated by commas"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This helps personalize your health plan
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <CardFooter className="flex justify-center pt-4 px-0">
                  <Button type="submit" className="bg-brandOrange hover:bg-brandOrange/90 text-white px-8" disabled={isLoading}>
                    {isLoading ? "Creating Your Plan..." : "Create My Health Plan"}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GoalSetup;