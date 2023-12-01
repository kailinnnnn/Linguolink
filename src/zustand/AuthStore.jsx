import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  isLogin: false,
  setIsLogin: (isLogin) => set({ isLogin }),
  logout: () => {
    set({ user: null });
    set({ isLogin: false });
    localStorage.removeItem("user");
  },
  login: (user) => {
    set({ user });
    set({ isLogin: true });
    localStorage.setItem("user", JSON.stringify(user));
  },
}));

export default useAuthStore;
