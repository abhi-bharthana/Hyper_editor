export default function Inspector() {
  return (
    <div className="w-80 bg-[#121212]/80 backdrop-blur-xl border-l border-neutral-800/80 p-4 shadow-2xl z-10">
      <h2 className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-4">Inspector</h2>
      <div className="space-y-3 text-sm">
        <div className="bg-neutral-900/40 border border-neutral-800/60 p-3 rounded-xl">
          <label className="text-[11px] text-neutral-400 block mb-1.5 font-medium">Transform Scale</label>
          <input type="range" className="w-full accent-blue-500 bg-neutral-800 rounded-lg cursor-pointer" />
        </div>
        <div className="bg-neutral-900/40 border border-neutral-800/60 p-3 rounded-xl">
          <label className="text-[11px] text-neutral-400 block mb-1.5 font-medium">Layer Opacity</label>
          <input type="range" className="w-full accent-blue-500 bg-neutral-800 rounded-lg cursor-pointer" />
        </div>
      </div>
    </div>
  );
}