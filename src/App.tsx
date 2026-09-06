import MediaPool from './components/layout/MediaPool';
import Player from './components/player/Player';
import Inspector from './components/inspector/Inspector';
import Timeline from './components/timeline/Timeline';
import './App.css';

export default function App() {
  return (
    <div className="h-screen w-screen bg-[#0d0d0d] text-gray-200 flex flex-col font-sans overflow-hidden select-none">
      {/* 🎬 UPPER WORKSPACE */}
      <div className="flex-1 flex flex-row overflow-hidden border-b border-neutral-800/80 relative">
        <MediaPool />
        <Player />
        <Inspector />
      </div>

      {/* ✂️ LOWER TIMELINE */}
      <Timeline />
    </div>
  );
}