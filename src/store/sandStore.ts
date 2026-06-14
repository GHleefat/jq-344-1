import { create } from "zustand";
import {
  SandStoreState,
  HEIGHT_MAP_WIDTH,
  HEIGHT_MAP_HEIGHT,
  MAX_HISTORY_LENGTH,
} from "../utils/types";
import {
  createInitialHeightMap,
  cloneHeightMap,
} from "../utils/heightMapUtils";

const initialData = createInitialHeightMap();

export const useSandStore = create<SandStoreState>((set, get) => ({
  heightMap: {
    width: HEIGHT_MAP_WIDTH,
    height: HEIGHT_MAP_HEIGHT,
    data: cloneHeightMap(initialData),
  },
  heightMapVersion: 0,
  brushConfig: {
    size: 30,
    strength: 0.7,
    tool: "sweep",
  },
  history: [cloneHeightMap(initialData)],
  historyIndex: 0,

  setBrushConfig: (config) =>
    set((state) => ({
      brushConfig: { ...state.brushConfig, ...config },
    })),

  setTool: (tool) =>
    set((state) => ({
      brushConfig: { ...state.brushConfig, tool },
    })),

  setBrushSize: (size) =>
    set((state) => ({
      brushConfig: { ...state.brushConfig, size },
    })),

  setBrushStrength: (strength) =>
    set((state) => ({
      brushConfig: { ...state.brushConfig, strength },
    })),

  updateHeightMap: (updater) =>
    set((state) => {
      updater(
        state.heightMap.data,
        state.heightMap.width,
        state.heightMap.height,
      );
      return {
        heightMap: { ...state.heightMap },
        heightMapVersion: state.heightMapVersion + 1,
      };
    }),

  pushHistory: () => {
    const { heightMap, history, historyIndex } = get();
    const newData = cloneHeightMap(heightMap.data);
    const trimmedHistory =
      historyIndex < history.length - 1
        ? history.slice(0, historyIndex + 1)
        : [...history];
    trimmedHistory.push(newData);
    if (trimmedHistory.length > MAX_HISTORY_LENGTH) {
      trimmedHistory.shift();
    }
    set({
      history: trimmedHistory,
      historyIndex: trimmedHistory.length - 1,
    });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const data = cloneHeightMap(history[newIndex]);
      set({
        heightMap: { width: HEIGHT_MAP_WIDTH, height: HEIGHT_MAP_HEIGHT, data },
        heightMapVersion: get().heightMapVersion + 1,
        historyIndex: newIndex,
      });
    }
  },

  reset: () => {
    const { heightMap, history, historyIndex } = get();
    const trimmedHistory =
      historyIndex < history.length - 1
        ? history.slice(0, historyIndex + 1)
        : [...history];
    trimmedHistory.push(cloneHeightMap(heightMap.data));
  },

  resetToInitial: () => {
    const newData = createInitialHeightMap();
    const { history } = get();
    const trimmedHistory = [...history, cloneHeightMap(newData)];
    if (trimmedHistory.length > MAX_HISTORY_LENGTH) {
      trimmedHistory.shift();
    }
    set({
      heightMap: {
        width: HEIGHT_MAP_WIDTH,
        height: HEIGHT_MAP_HEIGHT,
        data: newData,
      },
      heightMapVersion: get().heightMapVersion + 1,
      history: trimmedHistory,
      historyIndex: trimmedHistory.length - 1,
    });
  },
}));
