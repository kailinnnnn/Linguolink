import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),

  //   increment: () => set((state) => ({ count: state.count + 1 })),
  //   decrement: () => set((state) => ({ count: state.count - 1 })),
  logout: () => set({ user: null }),
}));

export default useAuthStore;
