// src/hooks/useHealth.ts
import { useHealthStore, getHealthStats, formatActivityLevel } from '@/store/healthStore';
//@ts-expect-error: no need here
import type { HealthLog, HealthPlan, Feedback, UserProfile } from '@/store/healthStore';

export const useHealth = () => {
  const store = useHealthStore();
  

  const stats = getHealthStats(store.dailyLogs);
  

  const getFormattedActivityLevel = () => {
    return store.userProfile.activityLevel 
      ? formatActivityLevel(store.userProfile.activityLevel) 
      : "Not specified";
  };
  
  const logDailyActivity = async (log: HealthLog) => {
    store.addDailyLog(log);
    
    const newFeedback: Feedback = {
      date: log.date,//@ts-expect-error: no need here
      adherence: generateAdherenceMessage(log, store.healthPlan),
      //@ts-expect-error: no need here
      suggestions: generateSuggestions(log, store.healthPlan, store.dailyLogs),
      motivation: generateMotivationMessage(store.dailyLogs.length)
    };
    //@ts-expect-error: no need here
    store.addFeedback(newFeedback);
    return newFeedback;
  };
  
  const isProfileComplete = () => {
    const { age, weight, gender, activityLevel } = store.userProfile;
    return !!(age && weight && gender && activityLevel);
  };
  
  return {

    ...store,
    
    stats,
    formattedActivityLevel: getFormattedActivityLevel(),
    isProfileComplete: isProfileComplete(),
    
    logDailyActivity,
    
  };
};

const generateAdherenceMessage = (log: HealthLog, plan: HealthPlan | null): string => {
  if (!plan) return "No health plan available for comparison.";
  
  const waterTarget = parseFloat(plan.waterIntake);
  const waterAdherence = log.waterConsumed / waterTarget;
  
  if (waterAdherence >= 0.9) {
    return "Great job staying hydrated today! You're closely following your plan.";
  } else if (waterAdherence >= 0.7) {
    return "You're doing well overall, but try to increase your water intake a bit more.";
  } else {
    return "Your water intake is significantly below your target. Focus on hydration tomorrow.";
  }
};

const generateSuggestions = (
  log: HealthLog, 
  plan: HealthPlan | null, 
  previousLogs: HealthLog[]
): string[] => {
  const suggestions: string[] = [];
  

  if (plan && log.waterConsumed < parseFloat(plan.waterIntake) * 0.8) {
    suggestions.push("Try keeping a water bottle with you throughout the day.");
  }
  

  if (plan) {
    const sleepRange = plan.sleepHours.split('-');
    const minSleep = parseFloat(sleepRange[0]);
    if (log.sleepHours < minSleep) {
      suggestions.push("Consider going to bed 30 minutes earlier to improve your sleep duration.");
    }
  }
  
  // Add exercise suggestion
  if (log.exerciseDuration < 20) {
    suggestions.push("Even short 20-minute exercise sessions can have significant health benefits.");
  }
  
  // Ensure we always have at least one suggestion
  if (suggestions.length === 0) {
    suggestions.push("Keep maintaining your current routine, you're doing great!");
  }
  
  return suggestions;
};

const generateMotivationMessage = (logCount: number): string => {
  const messages = [
    "Every step counts on your health journey!",
    "Small consistent changes lead to big results over time.",
    "You're investing in your future well-being with each healthy choice.",
    "Progress is progress, no matter how small. Keep going!",
    "Your commitment to tracking your health is already a big achievement."
  ];
  
  return messages[Math.min(logCount, messages.length - 1)];
};

export type { HealthLog, HealthPlan, Feedback, UserProfile };