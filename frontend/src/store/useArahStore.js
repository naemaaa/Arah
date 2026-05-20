import { create } from 'zustand'

const useArahStore = create((set) => ({
  userInput: null,
  result: null,
  isLoading: false,
  error: null,

  setUserInput: (input) => set({ userInput: input }),
  setResult: (result) => set({ result }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set({ userInput: null, result: null, isLoading: false, error: null }),
}))

export default useArahStore