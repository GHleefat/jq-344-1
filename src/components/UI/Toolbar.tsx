import { useSandStore } from "@/store/sandStore";
import { ToolType } from "@/utils/types";
import { Brush, Mountain, Waves } from "lucide-react";
import { cn } from "@/lib/utils";

const tools: {
  id: ToolType;
  label: string;
  icon: typeof Brush;
  description: string;
}[] = [
  {
    id: "sweep",
    label: "铺沙",
    icon: Waves,
    description: "拨开沙子露出底部发光层",
  },
  { id: "flatten", label: "抹平", icon: Brush, description: "将沙面抹平均匀" },
  {
    id: "pile",
    label: "堆高",
    icon: Mountain,
    description: "堆高沙子形成凸起",
  },
];

interface ToolbarProps {
  className?: string;
}

export function Toolbar({ className }: ToolbarProps) {
  const { brushConfig, setTool, setBrushSize, setBrushStrength } =
    useSandStore();

  return (
    <div
      className={cn(
        "absolute top-6 left-1/2 -translate-x-1/2 z-10",
        "bg-black/30 backdrop-blur-xl rounded-2xl p-4",
        "border border-white/10 shadow-2xl",
        className,
      )}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      onPointerMove={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-2">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = brushConfig.tool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => setTool(tool.id)}
              title={tool.description}
              className={cn(
                "flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-300",
                "min-w-[72px]",
                isActive
                  ? "bg-gradient-to-b from-amber-500/30 to-amber-600/20 text-amber-300 border border-amber-400/30 shadow-lg shadow-amber-500/20"
                  : "text-white/60 hover:text-white/90 hover:bg-white/5",
              )}
            >
              <Icon size={24} strokeWidth={1.5} />
              <span className="text-xs font-medium">{tool.label}</span>
            </button>
          );
        })}

        <div className="w-px h-12 bg-white/10 mx-2" />

        <div className="flex flex-col gap-2 px-2">
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/50 w-12">笔刷大小</span>
            <input
              type="range"
              min="5"
              max="100"
              value={brushConfig.size}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-28 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-amber-400
                [&::-webkit-slider-thumb]:shadow-lg
                [&::-webkit-slider-thumb]:shadow-amber-400/50
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:transition-transform
                [&::-webkit-slider-thumb]:hover:scale-110"
            />
            <span className="text-xs text-amber-300 w-8 text-right">
              {brushConfig.size}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-white/50 w-12">笔刷强度</span>
            <input
              type="range"
              min="1"
              max="100"
              value={Math.round(brushConfig.strength * 100)}
              onChange={(e) => setBrushStrength(Number(e.target.value) / 100)}
              className="w-28 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-amber-400
                [&::-webkit-slider-thumb]:shadow-lg
                [&::-webkit-slider-thumb]:shadow-amber-400/50
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:transition-transform
                [&::-webkit-slider-thumb]:hover:scale-110"
            />
            <span className="text-xs text-amber-300 w-8 text-right">
              {Math.round(brushConfig.strength * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
