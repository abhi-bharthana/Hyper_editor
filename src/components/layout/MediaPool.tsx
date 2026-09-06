import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';

export default function MediaPool() {
  const [loadedFile, setLoadedFile] = useState<string | null>(null);

  const handleImportMedia = async () => {
    try {
      // 1. Windows ka native file picker open karo
      const selectedPath = await open({
        multiple: false,
        filters: [{ name: 'Video Files', extensions: ['mp4', 'mov', 'mkv', 'avi'] }]
      });

      if (selectedPath && typeof selectedPath === 'string') {
        console.log("Selected path:", selectedPath);
        
        // 2. File path Rust VPU Decoder ko bhejo
        const response = await invoke('load_video', { path: selectedPath });
        console.log("Rust Response:", response);
        
        // 3. UI update karo
        const fileName = selectedPath.split('\\').pop() || 'Unknown File';
        setLoadedFile(fileName);
      }
    } catch (error) {
      console.error("Failed to load video:", error);
    }
  };

  return (
    <div className="w-72 bg-[#121212]/80 backdrop-blur-xl border-r border-neutral-800/80 p-4 flex flex-col shadow-2xl z-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Project Media</h2>
        <button 
          onClick={handleImportMedia}
          className="text-xs bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 px-2.5 py-1 rounded-md transition border border-neutral-700/50 shadow-inner"
        >
          +
        </button>
      </div>
      
      <div 
        onClick={handleImportMedia}
        className="flex-1 border border-dashed border-neutral-800 rounded-xl flex flex-col items-center justify-center text-neutral-500 hover:border-blue-500/50 hover:text-blue-400 transition-all cursor-pointer bg-neutral-900/20 group relative overflow-hidden"
      >
        {loadedFile ? (
          <div className="text-center px-4 animate-pulse">
            <span className="text-3xl mb-2 block">🎬</span>
            <span className="text-xs font-medium text-blue-400 break-all">{loadedFile}</span>
            <span className="text-[10px] text-neutral-500 block mt-2">Ready for VPU Decoding</span>
          </div>
        ) : (
          <>
            <svg className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
            <span className="text-xs font-medium">Click to Import Media</span>
          </>
        )}
      </div>
    </div>
  );
}