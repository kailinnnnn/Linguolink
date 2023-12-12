import { create } from "zustand";

const useVideoStore = create((set) => ({
  isVideoOpen: false,
  setIsVideoOpen: (boolean) => {
    set((state) => ({
      isVideoOpen: boolean,
    }));
  },
}));

export default useVideoStore;
