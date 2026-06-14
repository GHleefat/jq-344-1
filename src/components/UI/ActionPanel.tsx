import { useRef } from "react";
import { useSandStore } from "@/store/sandStore";
import { saveCanvasAsImage, getGLCanvas } from "@/utils/exportUtils";
import { Undo2, Trash2, Download, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionPanelProps {
  className?: string;
  containerRef?: React.RefObject<HTMLDivElement>;
}

export function ActionPanel({ className, containerRef }: ActionPanelProps) {
  const { undo, resetToInitial, historyIndex } = useSandStore();

  const handleSave = () => {
    if (!containerRef?.current) return;
    const canvas = getGLCanvas(containerRef.current);
    if (canvas) {
      saveCanvasAsImage(canvas, `sand-art-${Date.now()}.png`);
    }
  };

  const handleUndo = () => {
    undo();
  };

  const handleClear = () => {
    resetToInitial();
  };

  return (
    <div
      className={cn(
        "absolute bottom-6 left-6 z-10",
        "bg-black/30 backdrop-blur-xl rounded-2xl p-3",
        "border border-white/10 shadow-2xl",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={handleUndo}
          disabled={historyIndex <= 0}
          title="撤销 (Ctrl+Z)"
          className={cn(
            "flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-300",
            "min-w-[64px]",
            historyIndex > 0
              ? "text-white/70 hover:text-white hover:bg-white/10"
              : "text-white/20 cursor-not-allowed",
          )}
        >
          <Undo2 size={20} strokeWidth={1.5} />
          <span className="text-xs">撤销</span>
        </button>

        <button
          onClick={handleClear}
          title="清屏"
          className="flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-300
            min-w-[64px] text-white/70 hover:text-red-400 hover:bg-red-500/10"
        >
          <Trash2 size={20} strokeWidth={1.5} />
          <span className="text-xs">清屏</span>
        </button>

        <div className="w-px h-10 bg-white/10 mx-1" />

        <button
          onClick={handleSave}
          title="保存图片"
          className="flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-300
            min-w-[64px] text-amber-300 hover:text-amber-200 hover:bg-amber-500/10"
        >
          <Download size={20} strokeWidth={1.5} />
          <span className="text-xs">保存</span>
        </button>
      </div>
    </div>
  );
}

interface ViewControlsProps {
  className?: string;
}

export function ViewControls({ className }: ViewControlsProps) {
  return (
    <div
      className={cn(
        "absolute bottom-6 right-6 z-10",
        "bg-black/30 backdrop-blur-xl rounded-2xl p-3",
        "border border-white/10 shadow-2xl",
        className,
      )}
    >
      <div className="flex flex-col gap-2 text-white/50 text-xs">
        <div className="flex items-center gap-2">
          <RotateCcw size={14} />
          <span>左键：作画</span>
        </div>
        <div className="flex items-center gap-2">
          <RotateCcw size={14} />
          <span>右键拖拽：旋转视角</span>
        </div>
        <div className="flex items-center gap-2">
          <RotateCcw size={14} />
          <span>滚轮：缩放</span>
        </div>
      </div>
    </div>
  );
}
