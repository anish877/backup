import { create } from "zustand";

interface Log {
    log: WellnessComponentType;
    setLog: (value: WellnessComponentType) => void
    meal: boolean;
    setMeal: (value: boolean) => void;
    mood: boolean;
    setMood: (value: boolean) => void;
    water: boolean
    setWater: (value: boolean) => void;
    sleep: boolean;
    setSleep: (value: boolean) => void;
}

export type WellnessComponentType = 'sleep' | 'mood' | 'water' | 'meal' | null;

const useLogStore = create<Log>((set) => ({
    log: null,
    setLog: (value) => set({ log: value }),
    meal: false,
    setMeal: (value) => set({ meal: value }),
    mood: false,
    setMood: (value) => set({ mood: value }),
    water: true,
    setWater: (value) => set({ water: value }),
    sleep: false,
    setSleep: (value) => set({ sleep: value }),
}))


export default useLogStore