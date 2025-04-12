'use client';
import React, { useState } from 'react';
import NavBar from '@/components/NavBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Activity, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  age: z.coerce.number().min(1, "Age is required"),
  weight: z.coerce.number().min(1, "Weight is required"),
  gender: z.enum(['male', 'female', 'other'], {
    required_error: "Please select your gender.",
  }),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very active'], {
    required_error: "Please select your activity level.",
  }),
});

const UserProfile = () => {
  const { healthGoal, userProfile, setUserProfile, isOnboarded, dailyLogs } = useHealth();
  const router = useRouter();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  // Redirect to goal setup if not onboarded
  React.useEffect(() => {
    if (isOnboarded) {
      router.push('/goal');
    }
  }, [isOnboarded, router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: userProfile.age || 0,
      weight: userProfile.weight || 0,
      gender: userProfile.gender || undefined,
      activityLevel: userProfile.activityLevel || undefined,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Update user profile
    setUserProfile({
      ...userProfile,
      age: Number(values.age),
      weight: Number(values.weight),
      gender: values.gender,
      activityLevel: values.activityLevel,
    });
    
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
    
    setIsEditing(false);
  };

  const calculateStats = () => {
    if (dailyLogs.length === 0) {
      return {
        avgSleep: "-",
        avgWater: "-",
        avgMood: "-",
        totalExerciseMinutes: "-",
        logsCount: 0
      };
    }

    const totalSleep = dailyLogs.reduce((sum, log) => sum + log.sleepHours, 0);
    const totalWater = dailyLogs.reduce((sum, log) => sum + log.waterConsumed, 0);
    const totalMood = dailyLogs.reduce((sum, log) => sum + log.mood, 0);
    const totalExercise = dailyLogs.reduce((sum, log) => sum + log.exerciseDuration, 0);
    
    return {
      avgSleep: (totalSleep / dailyLogs.length).toFixed(1),
      avgWater: (totalWater / dailyLogs.length).toFixed(1),
      avgMood: (totalMood / dailyLogs.length).toFixed(1),
      totalExerciseMinutes: totalExercise.toString(),
      logsCount: dailyLogs.length
    };
  };

  const stats = calculateStats();

  const formatActivityLevel = (level: string) => {
    return level.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (!isOnboarded) {
    return null; // This will prevent flash before redirect
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="bg-white p-4 rounded-b-3xl shadow-md">
        <NavBar />
      </div>
      
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="text-center pb-2">
                <div className="flex justify-center mb-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src="/lovable-uploads/a6ceadf4-1747-4ad6-a0c6-d78ff8e109e3.png" />
                    <AvatarFallback className="bg-brandOrange text-3xl text-white">
                      {userProfile.gender === 'male' ? 'M' : userProfile.gender === 'female' ? 'F' : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>Personal information & health goal</CardDescription>
              </CardHeader>
              
              <CardContent className="text-center">
                <div className="py-4 px-6 bg-brandOrange text-white rounded-lg mb-4">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Activity className="h-5 w-5" />
                    <span className="font-medium">Current Goal</span>
                  </div>
                  <div className="text-xl font-bold">{healthGoal || "No goal set"}</div>
                </div>
                
                <div className="space-y-3 text-left">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Age:</span>
                    <span className="font-medium">{userProfile.age}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Weight:</span>
                    <span className="font-medium">{userProfile.weight} kg</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Gender:</span>
                    <span className="font-medium capitalize">{userProfile.gender}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Activity Level:</span>
                    <span className="font-medium">
                      {userProfile.activityLevel ? formatActivityLevel(userProfile.activityLevel) : "Not specified"}
                    </span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-center">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            {isEditing ? (
              <Card>
                <CardHeader>
                  <CardTitle>Edit Profile</CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                      <div className="flex space-x-2 justify-end pt-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" className="bg-brandOrange hover:bg-brandOrange/90">
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Health Statistics</CardTitle>
                    <CardDescription>
                      Summary of your health data from {stats.logsCount} log entries
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                        <p className="text-sm opacity-80">Avg. Sleep</p>
                        <p className="text-2xl font-bold">{stats.avgSleep}</p>
                        <p className="text-xs opacity-80">hours/day</p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
                        <p className="text-sm opacity-80">Avg. Water</p>
                        <p className="text-2xl font-bold">{stats.avgWater}</p>
                        <p className="text-xs opacity-80">liters/day</p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-4 text-white">
                        <p className="text-sm opacity-80">Avg. Mood</p>
                        <p className="text-2xl font-bold">{stats.avgMood}</p>
                        <p className="text-xs opacity-80">out of 10</p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                        <p className="text-sm opacity-80">Total Exercise</p>
                        <p className="text-2xl font-bold">{stats.totalExerciseMinutes}</p>
                        <p className="text-xs opacity-80">minutes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Account Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Button 
                        variant="default" 
                        className="w-full"
                        onClick={() => navigate('/goal')}
                      >
                        Change Health Goal
                      </Button>
                    </div>
                    
                    <div>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          toast({
                            title: "Data Exported",
                            description: "Your health data has been exported successfully.",
                          });
                        }}
                      >
                        Export My Health Data
                      </Button>
                    </div>
                    
                    <div>
                      <Button 
                        variant="outline" 
                        className="w-full text-red-500 border-red-500 hover:bg-red-50"
                        onClick={() => {
                          toast({
                            title: "Warning",
                            description: "This feature would delete your account data (not implemented).",
                          });
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;