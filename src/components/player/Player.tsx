import { useEffect, useRef } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { invoke } from '@tauri-apps/api/core';

export default function Player() {
  const { isPlaying, playheadPosition, togglePlay } = useEditorStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Engine se frame fetch karne ka function
  const fetchAndRenderFrame = async () => {
    try {
      // 🔥 FIX: Tauri v2 ke liye http://hyper.localhost format use kiya
      const response = await fetch('http://hyper.localhost/video-stream/frame_latest');
      const buffer = await response.arrayBuffer();
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Rust se 1280x720 ka raw RGBA buffer aa raha hai
      const imgData = new ImageData(new Uint8ClampedArray(buffer), 1280, 720);
      
      // Paint directly to Canvas (Super fast)
      ctx.putImageData(imgData, 0, 0);
    } catch (error) {
      console.error("Failed to load frame from Rust Engine:", error);
    }
  };

  const handlePlayPause = () => {
    togglePlay();
    if (!isPlaying) {
      invoke('play_video');
      fetchAndRenderFrame(); // Play dabate hi Rust se frame maango
    } else {
      invoke('pause_video');
    }
  };

  // Jab bhi app load ho, ek initial frame manga lo
  useEffect(() => {
    fetchAndRenderFrame();
  }, []);

  return (
    <div className="flex-1 bg-black flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-900/40 via-black to-black pointer-events-none"></div>
      
      <canvas 
        ref={canvasRef}
        width={1280} 
        height={720} 
        className="w-full h-full object-contain shadow-[0_0_50px_rgba(0,0,0,0.8)]" 
      />
      
      <div className="absolute bottom-6 flex items-center gap-5 bg-neutral-900/60 backdrop-blur-2xl border border-neutral-700/40 px-6 py-2.5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <button className="text-neutral-400 hover:text-white transition transform active:scale-95">⏮</button>
        <button onClick={handlePlayPause} className="w-9 h-9 bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)] transition transform active:scale-95 text-sm">
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button className="text-neutral-400 hover:text-white transition transform active:scale-95">⏭</button>
        <div className="h-4 w-px bg-neutral-700/60 mx-1"></div>
        <span className="text-xs font-mono font-medium text-blue-400 tracking-wider">
          00:00:{(Math.floor(playheadPosition / 60)).toString().padStart(2, '0')}:{(Math.floor(playheadPosition % 60)).toString().padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}