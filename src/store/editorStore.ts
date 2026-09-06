import { create } from 'zustand';

interface Clip {
  id: string;
  name: string;
  track: 'V1' | 'A1';
  start: number; // in pixels or frames
  duration: number;
}

interface EditorState {
  isPlaying: boolean;
  playheadPosition: number;
  clips: Clip[];
  togglePlay: () => void;
  setPlayheadPosition: (pos: number) => void;
  updateClipPosition: (id: string, newStart: number) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  isPlaying: false,
  playheadPosition: 150,
  clips: [
    { id: '1', name: 'main_cam_01.mp4', track: 'V1', start: 50, duration: 300 },
    { id: '2', name: 'audio_sync.wav', track: 'A1', start: 50, duration: 300 },
  ],
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setPlayheadPosition: (pos) => set({ playheadPosition: pos }),
  updateClipPosition: (id, newStart) =>
    set((state) => ({
      clips: state.clips.map((clip) =>
        clip.id === id ? { ...clip, start: Math.max(0, newStart) } : clip
      ),
    })),
}));