import { useState, useEffect } from 'react';
import { useEditorStore } from '../../store/editorStore';

const DraggableClip = ({ clip, colorClass }: { clip: any, colorClass: string }) => {
  const updateClipPosition = useEditorStore((state) => state.updateClipPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startPos, setStartPos] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setStartPos(clip.start);
    e.stopPropagation();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const delta = e.clientX - startX;
      updateClipPosition(clip.id, Math.max(0, startPos + delta));
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startX, startPos, clip.id, updateClipPosition]);

  return (
    <div
      onMouseDown={handleMouseDown}
      style={{ left: `${clip.start}px` }}
      className={`absolute w-[320px] h-12 ${colorClass} border rounded-xl px-3 text-xs flex items-center shadow-lg transition-colors backdrop-blur ${
        isDragging ? 'cursor-grabbing brightness-125 z-50 scale-[1.02]' : 'cursor-grab'
      }`}
    >
      <span className="truncate font-medium text-white select-none">{clip.name}</span>
    </div>
  );
};

export default function Timeline() {
  const { playheadPosition, clips, setPlayheadPosition } = useEditorStore();
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingPlayhead) return;
      const timelineOffset = document.getElementById('timeline-container')?.getBoundingClientRect().left || 0;
      setPlayheadPosition(Math.max(0, e.clientX - timelineOffset));
    };
    const handleMouseUp = () => setIsDraggingPlayhead(false);

    if (isDraggingPlayhead) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingPlayhead, setPlayheadPosition]);

  return (
    <div className="h-[36vh] min-h-[260px] bg-[#0f0f0f] flex flex-col relative border-t border-neutral-800/80">
      <div className="h-11 bg-[#121212] border-b border-neutral-800/80 flex items-center px-5 gap-3 z-40 relative">
        <button className="text-xs px-3 py-1.5 bg-neutral-800/70 hover:bg-neutral-700 text-neutral-300 rounded-lg transition border border-neutral-700/40 flex items-center gap-1.5 font-medium">
          <span>✂️</span> Split (S)
        </button>
        <button className="text-xs px-3 py-1.5 bg-neutral-800/70 hover:bg-neutral-700 text-red-400 rounded-lg transition border border-neutral-700/40 flex items-center gap-1.5 font-medium">
          <span>🗑️</span> Delete
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        <div className="w-32 bg-[#121212] border-r border-neutral-800/80 flex flex-col z-20 shadow-[4px_0_15px_rgba(0,0,0,0.4)] relative">
          <div className="h-16 border-b border-neutral-800/60 flex items-center px-4 text-xs font-bold text-blue-400 bg-neutral-900/30">V1 • Video</div>
          <div className="h-16 border-b border-neutral-800/60 flex items-center px-4 text-xs font-bold text-green-400 bg-neutral-900/30">A1 • Audio</div>
        </div>

        <div id="timeline-container" className="flex-1 overflow-x-auto overflow-y-hidden relative bg-[#0a0a0a] scrollbar-thin">
          <div className="h-6 border-b border-neutral-800/60 bg-[#121212]/50 w-[300%] flex items-center text-[10px] font-mono text-neutral-600 px-4 cursor-text">
            <span>00:00</span><span className="ml-24">00:05</span><span className="ml-24">00:10</span><span className="ml-24">00:15</span>
          </div>
          
          <div className="absolute top-0 bottom-0 w-px bg-red-500 z-30 transition-none" style={{ left: `${playheadPosition}px` }}>
            <div onMouseDown={(e) => { setIsDraggingPlayhead(true); e.stopPropagation(); }} className="w-4 h-4 bg-red-500 -ml-[7.5px] rounded-b-sm shadow-[0_0_10px_rgba(239,68,68,0.8)] flex items-center justify-center cursor-ew-resize hover:scale-110 transition-transform">
              <div className="w-0.5 h-2.5 bg-red-950 rounded-full"></div>
            </div>
          </div>

          <div className="h-16 border-b border-neutral-800/40 relative w-[300%] pt-2">
            {clips.filter(c => c.track === 'V1').map(clip => (
              <DraggableClip key={clip.id} clip={clip} colorClass="bg-gradient-to-r from-blue-600/90 to-blue-700/90 hover:from-blue-500 hover:to-blue-600 border-blue-400/50" />
            ))}
          </div>

          <div className="h-16 border-b border-neutral-800/40 relative w-[300%] pt-2">
            {clips.filter(c => c.track === 'A1').map(clip => (
              <DraggableClip key={clip.id} clip={clip} colorClass="bg-gradient-to-r from-green-700/90 to-emerald-800/90 hover:from-green-600 hover:to-emerald-700 border-green-500/50" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}