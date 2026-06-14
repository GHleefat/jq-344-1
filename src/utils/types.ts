export type ToolType = "sweep" | "flatten" | "pile";

export interface SandHeightMap {
  width: number;
  height: number;
  data: Float32Array;
}

export interface BrushConfig {
  size: number;
  strength: number;
  tool: ToolType;
}

export interface SandStoreState {
  heightMap: SandHeightMap;
  heightMapVersion: number;
  brushConfig: BrushConfig;
  history: Float32Array[];
  historyIndex: number;
  setBrushConfig: (config: Partial<BrushConfig>) => void;
  setTool: (tool: ToolType) => void;
  setBrushSize: (size: number) => void;
  setBrushStrength: (strength: number) => void;
  updateHeightMap: (
    updater: (data: Float32Array, width: number, height: number) => void,
  ) => void;
  pushHistory: () => void;
  undo: () => void;
  reset: () => void;
  resetToInitial: () => void;
}

export const HEIGHT_MAP_WIDTH = 512;
export const HEIGHT_MAP_HEIGHT = 512;
export const MAX_HISTORY_LENGTH = 50;
export const MAX_SAND_HEIGHT = 0.3;
