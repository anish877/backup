'use client';
import React from 'react';
import NavBar from '@/components/NavBar';
import { useHealth } from '@/context/HealthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  mood: z.number().min(1).max(10),
  sleepHours: z.coerce.number().min(0),
  waterConsumed: z.coerce.number().min(0),
  meals: z.string().min(3, "Please enter what you ate"),
  exercise: z.string().min(1, "Exercise type is required"),
  exerciseDuration: z.coerce.number().min(0),
  symptoms: z.string().optional(),
  stressLevel: z.number().min(1).max(10),
});

const DailyLog = () => {
  const { addDailyLog, healthPlan, addFeedback } = useHealth();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mood: 5,
      sleepHours: 0,
      waterConsumed: 0,
      meals: '',
      exercise: '',
      exerciseDuration: 0,
      symptoms: '',
      stressLevel: 5,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Format today's date as YYYY-MM-DD
    const todayDate = format(new Date(), 'yyyy-MM-dd');
    
    // Create the daily log
    const dailyLog = {
      date: todayDate,
      mood: values.mood,
      sleepHours: values.sleepHours,
      waterConsumed: values.waterConsumed,
      meals: values.meals.split(',').map(meal => meal.trim()),
      exercise: values.exercise,
      exerciseDuration: values.exerciseDuration,
      symptoms: values.symptoms ? values.symptoms.split(',').map(s => s.trim()) : [],
      stressLevel: values.stressLevel,
    };
    
    // Add the log to state
    addDailyLog(dailyLog);

    // Generate mock AI feedback (in a real app, this would call an API)
    setTimeout(() => {
      // Simple mock analysis comparing to health plan
      let adherenceScore = 0;
      const suggestions = [];
      
      if (healthPlan) {
        // Water adherence
        const recommendedWater = parseFloat(healthPlan.waterIntake);
        if (values.waterConsumed < recommendedWater * 0.8) {
          suggestions.push(`Try to increase your water intake to reach your goal of ${healthPlan.waterIntake}`);
        } else {
          adherenceScore += 1;
        }
        
        // Sleep adherence
        const recommendedSleepRange = healthPlan.sleepHours.split('-');
        const minSleep = parseInt(recommendedSleepRange[0]);
        const maxSleep = parseInt(recommendedSleepRange[1]);
        if (values.sleepHours < minSleep) {
          suggestions.push(`You need more sleep. Aim for at least ${minSleep} hours`);
        } else if (values.sleepHours > maxSleep) {
          suggestions.push(`You might be oversleeping. Aim for ${healthPlan.sleepHours}`);
        } else {
          adherenceScore += 1;
        }
        
        // Exercise adherence - simplified check
        if (values.exerciseDuration < 20) {
          suggestions.push(`Try to exercise longer. Your plan recommends: ${healthPlan.exercise}`);
        } else {
          adherenceScore += 1;
        }
      }
      
      // Create adherence description
      let adherenceText;
      if (adherenceScore >= 3) {
        adherenceText = "Great adherence to your plan!";
      } else if (adherenceScore >= 1) {
        adherenceText = "Partial adherence to your plan.";
      } else {
        adherenceText = "You're not following your plan closely.";
      }
      
      // Add motivation
      const motivationMessages = [
        "Keep up the good work! Consistency is key.",
        "Don't give up! Small steps lead to big changes.",
        "You're making progress! Trust the process.",
        "Every healthy choice matters. You're doing great!"
      ];
      const motivation = motivationMessages[Math.floor(Math.random() * motivationMessages.length)];
      
      // If no suggestions, add a positive one
      if (suggestions.length === 0) {
        suggestions.push("Keep maintaining your current routine!");
      }
      
      // Add feedback
      addFeedback({
        date: todayDate,
        adherence: adherenceText,
        suggestions,
        motivation
      });
      
      toast({
        title: "Log Submitted Successfully",
        description: "Your daily health data has been recorded."
      });
      
      router.push('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="bg-white p-4 rounded-b-3xl shadow-md">
        <NavBar />
      </div>
      
      <div className="container mx-auto px-4 py-6">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Daily Health Log</CardTitle>
            <CardDescription className="text-center">
              Track your daily activities to monitor progress toward your health goals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="mood"
                  render={({ field: { value, onChange } }) => (
                    <FormItem>
                      <FormLabel>How's your mood today? (1-10)</FormLabel>
                      <FormControl>
                        <div className="space-y-3">
                          <Slider
                            value={[value]}
                            min={1}
                            max={10}
                            step={1}
                            onValueChange={(vals) => onChange(vals[0])}
                            className="my-4"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Low</span>
                            <span>Current: {value}</span>
                            <span>High</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sleepHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hours of Sleep</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 8" {...field} />
                        </FormControl>
                        <FormDescription>
                          How many hours did you sleep last night?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="waterConsumed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Water Consumed (L)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" placeholder="e.g., 2.5" {...field} />
                        </FormControl>
                        <FormDescription>
                          How much water have you had today?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="meals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meals Today</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="List your meals, separated by commas"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Example: Oatmeal for breakfast, salad for lunch, chicken and rice for dinner
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="exercise"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exercise Type</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Walking, Running, Yoga" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="exerciseDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 30" {...field} />
                        </FormControl>
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
                      <FormLabel>Any symptoms today? (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter any symptoms, separated by commas"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="stressLevel"
                  render={({ field: { value, onChange } }) => (
                    <FormItem>
                      <FormLabel>Stress Level (1-10)</FormLabel>
                      <FormControl>
                        <div className="space-y-3">
                          <Slider
                            value={[value]}
                            min={1}
                            max={10}
                            step={1}
                            onValueChange={(vals) => onChange(vals[0])}
                            className="my-4"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Low Stress</span>
                            <span>Current: {value}</span>
                            <span>High Stress</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <CardFooter className="flex justify-center pt-4 px-0">
                  <Button type="submit" className="bg-brandOrange hover:bg-brandOrange/90 text-white px-8">
                    Submit Daily Log
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

export default DailyLog;