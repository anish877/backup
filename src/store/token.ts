import { create } from "zustand";

interface Token {
    token: string;
    setToken: (value: string) => void
}

const useTokenStore = create<Token>((set) => ({
    token: '',
    setToken: (value) => set({ token: value })
}))


export default useTokenStore