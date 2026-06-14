import { HEIGHT_MAP_WIDTH, HEIGHT_MAP_HEIGHT } from "./types";

export function createInitialHeightMap(): Float32Array {
  const data = new Float32Array(HEIGHT_MAP_WIDTH * HEIGHT_MAP_HEIGHT);
  for (let i = 0; i < data.length; i++) {
    data[i] = 0.6 + Math.random() * 0.15;
  }
  return data;
}

export function cloneHeightMap(data: Float32Array): Float32Array {
  return new Float32Array(data);
}

export function getHeightAt(data: Float32Array, x: number, y: number): number {
  if (x < 0 || x >= HEIGHT_MAP_WIDTH || y < 0 || y >= HEIGHT_MAP_HEIGHT) {
    return 0;
  }
  return data[y * HEIGHT_MAP_WIDTH + x];
}

export function setHeightAt(
  data: Float32Array,
  x: number,
  y: number,
  value: number,
): void {
  if (x < 0 || x >= HEIGHT_MAP_WIDTH || y < 0 || y >= HEIGHT_MAP_HEIGHT) {
    return;
  }
  data[y * HEIGHT_MAP_WIDTH + x] = Math.max(0, Math.min(1, value));
}

export function applyBrush(
  data: Float32Array,
  uvX: number,
  uvY: number,
  brushRadiusPx: number,
  strength: number,
  tool: "sweep" | "flatten" | "pile",
): void {
  const centerX = uvX * HEIGHT_MAP_WIDTH;
  const centerY = uvY * HEIGHT_MAP_HEIGHT;
  const radius = brushRadiusPx;
  const minX = Math.max(0, Math.floor(centerX - radius));
  const maxX = Math.min(HEIGHT_MAP_WIDTH - 1, Math.ceil(centerX + radius));
  const minY = Math.max(0, Math.floor(centerY - radius));
  const maxY = Math.min(HEIGHT_MAP_HEIGHT - 1, Math.ceil(centerY + radius));
  const radiusSq = radius * radius;

  if (tool === "flatten") {
    let sum = 0;
    let count = 0;
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distSq = dx * dx + dy * dy;
        if (distSq <= radiusSq) {
          sum += getHeightAt(data, x, y);
          count++;
        }
      }
    }
    const avg = count > 0 ? sum / count : 0.6;
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distSq = dx * dx + dy * dy;
        if (distSq <= radiusSq) {
          const falloff = 1 - Math.sqrt(distSq) / radius;
          const easedFalloff = falloff * falloff * (3 - 2 * falloff);
          const current = getHeightAt(data, x, y);
          const blended = current + (avg - current) * easedFalloff * strength;
          setHeightAt(data, x, y, blended);
        }
      }
    }
  } else {
    const direction = tool === "sweep" ? -1 : 1;
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distSq = dx * dx + dy * dy;
        if (distSq <= radiusSq) {
          const falloff = 1 - Math.sqrt(distSq) / radius;
          const gaussian = Math.exp(-(distSq / (radiusSq * 0.5)));
          const effect = direction * strength * gaussian * 0.5;
          const current = getHeightAt(data, x, y);
          setHeightAt(data, x, y, current + effect);
        }
      }
    }
  }
}

export function lerpPoints(
  from: { x: number; y: number },
  to: { x: number; y: number },
  maxStepPx: number = 3,
): { x: number; y: number }[] {
  const dx = (to.x - from.x) * HEIGHT_MAP_WIDTH;
  const dy = (to.y - from.y) * HEIGHT_MAP_HEIGHT;
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance <= maxStepPx) {
    return [to];
  }
  const steps = Math.ceil(distance / maxStepPx);
  const points: { x: number; y: number }[] = [];
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    points.push({
      x: from.x + (to.x - from.x) * t,
      y: from.y + (to.y - from.y) * t,
    });
  }
  return points;
}
