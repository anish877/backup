'use client';
import React, { useState, useEffect } from 'react';
import NavBar from '@/components/NavBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Activity, Trash2, Loader2, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useHealthStore, getHealthStats, formatActivityLevel, DailyLog } from '@/store/healthStore';
import axios from 'axios';
import { customToast } from '@/components/CustomToast';
export interface UserStats {
  avgSleep: number;
  avgWater: number;
  avgMood: number;
  totalExerciseMinutes: number;
  logsCount: number;
}

// Update the API response type for the user profile
export interface UserProfileResponse {
  id: string;
  username: string;
  goal: string;
  dailyLogs: DailyLog[];
  stats: UserStats;
}
const API_URL = process.env.NEXT_PUBLIC_BACKEND || 'http://localhost:3001';

const formSchema = z.object({
  age: z.coerce.number().min(1, "Age is required"),
  weight: z.coerce.number().min(1, "Weight is required"),
  gender: z.enum(['male', 'female', 'other'], {
    required_error: "Please select your gender.",
  }),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very active'], {
    required_error: "Please select your activity level.",
  }),
  username: z.string().min(3, "Username is required and must be at least 3 characters"),
  goal: z.string().optional(),
});

const UserProfile = () => {
  const { 
    healthGoal, 
    userProfile, 
    setUserProfile, 
    updateUserProfile, 
    isOnboarded, 
    dailyLogs, 
    resetHealthData, 
    setHealthGoal 
  } = useHealthStore();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserProfileResponse | null>(null);
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);
  const [error, setError] = useState('');

  // Fetch user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/users/profile`, {
          withCredentials: true, // Important for sending cookies
        });
        
        setUserData(response.data);
        
        // Set today's log if available
        if (response.data.dailyLogs && response.data.dailyLogs.length > 0) {
          setTodayLog(response.data.dailyLogs[0]);
        }
        
        // Update store with fetched data
        if (response.data) {
          // Update local store with user data
          updateUserProfile({
            age: userProfile.age, // Keep existing data
            weight: userProfile.weight, // Keep existing data
            gender: userProfile.gender, // Keep existing data
            activityLevel: userProfile.activityLevel, // Keep existing data
          });
          
          // Set goal from API data if available
          if (response.data.goal) {
            setHealthGoal(response.data.goal);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data');
        setLoading(false);
        
        // @ts-expect-error: no need here
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          customToast.error('Session expired. Please login again.');
          router.push('/login');
        }
      }
    };

    fetchUserData();
  }, []);

  // Redirect to goal setup if not onboarded
  useEffect(() => {
    if (!isOnboarded && !loading) {
      router.push('/goal');
    }
  }, [isOnboarded, router, loading]);

  // Reset form when toggling edit mode
  useEffect(() => {
    if (isEditing && userData) {
      form.reset({
        age: userProfile.age || 0,
        weight: userProfile.weight || 0,
        gender: userProfile.gender || undefined,
        activityLevel: userProfile.activityLevel || undefined,
        username: userData.username || '',
        goal: userData.goal || '',
      });
    }
  }, [isEditing, userData]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: userProfile.age || 0,
      weight: userProfile.weight || 0,
      gender: userProfile.gender || undefined,
      activityLevel: userProfile.activityLevel || undefined,
      username: userData?.username || '',
      goal: userData?.goal || healthGoal || '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Update user profile in API
      const response = await axios.put(`${API_URL}/users/profile`, {
        username: values.username,
        goal: values.goal,
        age: Number(values.age),
        weight: Number(values.weight),
        gender: values.gender,
        activityLevel: values.activityLevel
      }, {
        withCredentials: true
      });
      
      // Update local store
      updateUserProfile({
        age: Number(values.age),
        weight: Number(values.weight),
        gender: values.gender,
        activityLevel: values.activityLevel,
      });
      
      if (values.goal) {
        setHealthGoal(values.goal);
      }
      
      setUserData(response.data);
      customToast.success("Your profile has been successfully updated.");
      setIsEditing(false);
      
      // Refresh data to get the updated log
      window.location.reload();
    } catch (err) {
      console.error("Error updating profile:", err);
      customToast.error("Failed to update profile");
    }
  };

  // Get the health statistics from user data
  const stats = userData?.stats || {
    avgSleep: 0,
    avgWater: 0,
    avgMood: 0,
    totalExerciseMinutes: 0,
    logsCount: 0
  };

  const handleDeleteAccount = async () => {
    const confirm = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
    
    if (!confirm) return;
  
    try {
      setLoading(true);
      // Call delete API here
      await axios.delete(`${API_URL}/users/profile`, {
        withCredentials: true,
      });
  
      resetHealthData(); // Reset local store
      customToast.success("Account deleted successfully");
      router.push('/login');
    } catch (error) {
      console.error("Delete account error:", error);
      customToast.error("Failed to delete account");
      setLoading(false);
    }
  };

  const handleExportData = () => {
    // Create a downloadable JSON file with the health data
    const exportData = {
      profile: userProfile,
      healthGoal,
      logs: dailyLogs
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    customToast.success("Your health data has been exported successfully.");
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-brandOrange" />
        <p className="mt-4 text-lg font-medium">Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg font-medium mb-4">{error}</p>
          <Button onClick={() => router.push('/login')}>
            Return to Login
          </Button>
        </div>
      </div>
    );
  }

  if (!isOnboarded) {
    return null; // This will prevent flash before redirect
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      
      <div className="container mx-auto px-4 py-6">
        {userData && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Welcome, {userData.username}!</h1>
            <p className="text-gray-600">Manage your profile and health data</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="text-center pb-2">
                <div className="flex justify-center mb-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={userProfile.avatarUrl || "/lovable-uploads/a6ceadf4-1747-4ad6-a0c6-d78ff8e109e3.png"} />
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
                  <div className="text-xl font-bold">{userData?.goal || healthGoal || "No goal set"}</div>
                </div>
                
                <div className="space-y-3 text-left">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Username:</span>
                    <span className="font-medium">{userData?.username || "Not set"}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Age:</span>
                    <span className="font-medium">{userProfile.age || "Not set"}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Weight:</span>
                    <span className="font-medium">{userProfile.weight ? `${userProfile.weight} kg` : "Not set"}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Gender:</span>
                    <span className="font-medium capitalize">{userProfile.gender || "Not set"}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Activity Level:</span>
                    <span className="font-medium">
                      {userProfile.activityLevel ? formatActivityLevel(userProfile.activityLevel) : "Not set"}
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
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="goal"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Health Goal</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your health goal" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    
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
                    
                    {/* Today's Log Section */}
                    {todayLog ? (
                      <div className="mt-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Calendar className="h-5 w-5 text-brandOrange" />
                          <h3 className="text-lg font-semibold">Today's Log</h3>
                          <span className="text-sm text-gray-500">
                            {formatDate(todayLog.date.toString())}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {todayLog.sleep && (
                            <div className="bg-white rounded-lg p-4 shadow-sm border">
                              <h4 className="font-medium text-blue-600 mb-2">Sleep</h4>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm text-gray-600">Quality:</span>
                                <span>{todayLog.sleep.quality}/10</span>
                              </div>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm text-gray-600">Duration:</span>
                                <span>{todayLog.sleep.duration} hours</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Score:</span>
                                <span className="font-bold">{todayLog.sleep.finalScore}/10</span>
                              </div>
                            </div>
                          )}
                          
                          {todayLog.mood && (
                            <div className="bg-white rounded-lg p-4 shadow-sm border">
                              <h4 className="font-medium text-yellow-600 mb-2">Mood</h4>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm text-gray-600">Happiness:</span>
                                <span>{todayLog.mood.happiness}/10</span>
                              </div>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm text-gray-600">Energy:</span>
                                <span>{todayLog.mood.energy}/10</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Score:</span>
                                <span className="font-bold">{todayLog.mood.finalScore}/10</span>
                              </div>
                            </div>
                          )}
                          
                          {todayLog.water && (
                            <div className="bg-white rounded-lg p-4 shadow-sm border">
                              <h4 className="font-medium text-green-600 mb-2">Water</h4>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Score:</span>
                                <span className="font-bold">{todayLog.water.finalScore}/10</span>
                              </div>
                            </div>
                          )}
                          
                          {todayLog.nutrition && (
                            <div className="bg-white rounded-lg p-4 shadow-sm border">
                              <h4 className="font-medium text-red-600 mb-2">Nutrition</h4>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm text-gray-600">Protein:</span>
                                <span>{todayLog.nutrition.protein}/10</span>
                              </div>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm text-gray-600">Calories:</span>
                                <span>{todayLog.nutrition.calories} kcal</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Score:</span>
                                <span className="font-bold">{todayLog.nutrition.finalScore}/10</span>
                              </div>
                            </div>
                            )}
                            </div>
                            {/* @ts-expect-error: no need here */}
                            {(todayLog.sleep?.dailyRecommndations?.length > 0 || 
                            // @ts-expect-error: no need here
                              todayLog.mood?.dailyRecommndations?.length > 0 || 
                              // @ts-expect-error: no need here
                              todayLog.water?.dailyRecommndations?.length > 0 || 
                              // @ts-expect-error: no need here
                              todayLog.nutrition?.dailyRecommndations?.length > 0) && (
                                <div className="mt-4 bg-white rounded-lg p-4 shadow-sm border">
                                  <h4 className="font-medium text-brandOrange mb-2">Today's Recommendations</h4>
                                  <ul className="space-y-1">
                                    {todayLog.sleep?.dailyRecommndations?.map((rec, idx) => (
                                      <li key={`sleep-${idx}`} className="text-sm flex gap-2">
                                        <span className="text-blue-500">•</span>
                                        <span>{rec}</span>
                                      </li>
                                    ))}
                                    {todayLog.mood?.dailyRecommndations?.map((rec, idx) => (
                                      <li key={`mood-${idx}`} className="text-sm flex gap-2">
                                        <span className="text-yellow-500">•</span>
                                        <span>{rec}</span>
                                      </li>
                                    ))}
                                    {todayLog.water?.dailyRecommndations?.map((rec, idx) => (
                                      <li key={`water-${idx}`} className="text-sm flex gap-2">
                                        <span className="text-green-500">•</span>
                                        <span>{rec}</span>
                                      </li>
                                    ))}
                                    {todayLog.nutrition?.dailyRecommndations?.map((rec, idx) => (
                                      <li key={`nutrition-${idx}`} className="text-sm flex gap-2">
                                        <span className="text-red-500">•</span>
                                        <span>{rec}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                          </div>
                        ) : (
                          <div className="mt-6 bg-white rounded-lg p-6 shadow-sm border text-center">
                            <h3 className="text-lg font-semibold mb-2">No Log For Today</h3>
                            <p className="text-gray-600 mb-4">
                              You haven't created a health log entry for today yet.
                            </p>
                            <Button 
                              className="bg-brandOrange hover:bg-brandOrange/90"
                              onClick={() => router.push('/log')}
                            >
                              Create Today's Log
                            </Button>
                          </div>
                        )}
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
                            className="w-full bg-brandOrange hover:bg-brandOrange/90"
                            onClick={() => router.push('/goal')}
                          >
                            Change Health Goal
                          </Button>
                        </div>
                        
                        <div>
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={handleExportData}
                          >
                            Export My Health Data
                          </Button>
                        </div>
                        
                        <div>
                          <Button 
                            variant="outline" 
                            className="w-full text-red-500 border-red-500 hover:bg-red-50"
                            onClick={handleDeleteAccount}
                            disabled={loading}
                          >
                            {loading ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 mr-2" />
                            )}
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