import { create } from "zustand";

const useWebRTCStore = create((set) => ({
  webRTCInfo: null,
  setWebRTCInfo: (webRTCData) => {
    set((state) => ({
      webRTCInfo: webRTCData,
    }));
  },
}));

export default useWebRTCStore;
