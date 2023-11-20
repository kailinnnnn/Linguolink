import { create } from "zustand";

const useChatroomsStore = create((set) => ({
  chatrooms: null,
  setChatrooms: (newChatrooms) => {
    set((state) => ({
      chatrooms: newChatrooms,
    }));
    console.log(newChatrooms);
  },
}));

export default useChatroomsStore;
