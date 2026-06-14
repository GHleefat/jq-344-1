import { useRef, useEffect } from "react";
import { SandCanvas3D } from "@/components/SandArt/SandCanvas3D";
import { Toolbar } from "@/components/UI/Toolbar";
import { ActionPanel, ViewControls } from "@/components/UI/ActionPanel";
import { useSandStore } from "@/store/sandStore";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { undo, resetToInitial } = useSandStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z" || e.key === "Z") {
          e.preventDefault();
          undo();
        }
        if (e.key === "r" || e.key === "R") {
          e.preventDefault();
          resetToInitial();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, resetToInitial]);

  return (
    <div className="w-full h-screen bg-[#0a0a0f] overflow-hidden relative">
      <div ref={containerRef} className="w-full h-full">
        <SandCanvas3D className="w-full h-full" />
      </div>

      <Toolbar />

      <ActionPanel containerRef={containerRef} />

      <ViewControls />

      <div className="absolute top-6 left-6 z-10">
        <h1 className="text-2xl font-bold text-white/90 tracking-wider">
          <span className="text-amber-400">沙</span>
          <span className="text-amber-300/90">画</span>
          <span className="text-amber-200/80">台</span>
        </h1>
        <p className="text-xs text-white/40 mt-1">3D Interactive Sand Art</p>
      </div>
    </div>
  );
}
