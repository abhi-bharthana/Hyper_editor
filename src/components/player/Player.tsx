import { useEffect, useRef } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { invoke } from '@tauri-apps/api/core';

export default function Player() {
  const { isPlaying, playheadPosition, togglePlay } = useEditorStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fetchAndRenderFrame = async () => {
    try {
      const response = await fetch('http://hyper.localhost/video-stream/frame_latest');
      if (!response.ok) return;
      
      const buffer = await response.arrayBuffer();
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Buffer size se video ki original resolution pata karo (Dynamic Check)
      const totalBytes = buffer.byteLength;
      let srcWidth = 1280;
      let srcHeight = 720;

      if (totalBytes === 1920 * 1080 * 4) {
        srcWidth = 1920; srcHeight = 1080; // 1080p Video
      } else if (totalBytes === 3840 * 2160 * 4) {
        srcWidth = 3840; srcHeight = 2160; // 4K Video
      } else if (totalBytes === 2560 * 1440 * 4) {
        srcWidth = 2560; srcHeight = 1440; // 2K Video
      } else if (totalBytes !== 1280 * 720 * 4) {
        // Agar koi aur size hai toh 16:9 aspect ratio ke hisaab se guess karo
        srcHeight = Math.round(Math.sqrt((totalBytes / 4) / (16/9)));
        srcWidth = Math.round(srcHeight * (16/9));
      }

      // 2. Original size ka ImageData banao
      const imgData = new ImageData(new Uint8ClampedArray(buffer), srcWidth, srcHeight);
      
      // 3. Hardware-accelerated Bitmap bana kar canvas par scale karo! (Super Fast)
      const bitmap = await createImageBitmap(imgData);
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    } catch (error) {
      console.error("Frame render error:", error);
    }
  };

  const handlePlayPause = async () => {
    if (!isPlaying) {
      togglePlay(); 
      await invoke('play_video');
    } else {
      togglePlay(); 
      await invoke('pause_video');
    }
  };

  useEffect(() => {
    let active = true;
    const playLoop = async () => {
      if (!active || !isPlaying) return; 
      
      await fetchAndRenderFrame();
      requestAnimationFrame(playLoop); 
    };

    if (isPlaying) {
      playLoop();
    }
    return () => { active = false; };
  }, [isPlaying]);

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
      </div>
    </div>
  );
}