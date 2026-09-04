import { create } from 'zustand';

type StreamingState = {
  text: string;
  setText: (text: string) => void;
  thinking: string;
  setThinking: (thinking: string) => void;
};

export const useStreamingStore = create<StreamingState>((set) => ({
  text: '',
  setText: (text) => set({ text }),
  thinking: '',
  setThinking: (thinking) => set({ thinking }),
}));
