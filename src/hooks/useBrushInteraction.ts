import { useEffect, useRef, useCallback } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useSandStore } from "@/store/sandStore";
import { applyBrush, lerpPoints } from "@/utils/heightMapUtils";

interface UseBrushInteractionOptions {
  planeSize?: number;
  controlsRef?: React.RefObject<any>;
}

export function useBrushInteraction({
  planeSize = 10,
  controlsRef,
}: UseBrushInteractionOptions = {}) {
  const { camera, gl } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const isDrawing = useRef(false);
  const lastPosition = useRef<{ x: number; y: number } | null>(null);
  const spaceHeld = useRef(false);

  const { brushConfig, updateHeightMap, pushHistory } = useSandStore();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        spaceHeld.current = true;
        if (isDrawing.current) {
          isDrawing.current = false;
          lastPosition.current = null;
        }
        if (controlsRef?.current) {
          controlsRef.current.enabled = true;
          controlsRef.current.mouseButtons = {
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.ROTATE,
          };
        }
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        spaceHeld.current = false;
        if (controlsRef?.current) {
          controlsRef.current.mouseButtons = {
            LEFT: -1,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.ROTATE,
          };
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [controlsRef]);

  const getUVFromEvent = useCallback(
    (event: PointerEvent): { x: number; y: number } | null => {
      const canvas = gl.domElement;
      const rect = canvas.getBoundingClientRect();

      const clientX = event.clientX;
      const clientY = event.clientY;

      mouse.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, camera);

      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersectPoint = new THREE.Vector3();
      raycaster.current.ray.intersectPlane(plane, intersectPoint);

      if (!intersectPoint) return null;

      const halfSize = planeSize / 2;
      const uvX = (intersectPoint.x + halfSize) / planeSize;
      const uvY = 1 - (intersectPoint.z + halfSize) / planeSize;

      if (uvX < 0 || uvX > 1 || uvY < 0 || uvY > 1) return null;

      return { x: uvX, y: uvY };
    },
    [camera, gl, planeSize],
  );

  const handlePointerDown = useCallback(
    (event: PointerEvent) => {
      if (event.button !== 0) return;
      if (spaceHeld.current) return;

      if (controlsRef?.current) {
        controlsRef.current.enabled = false;
      }

      const pos = getUVFromEvent(event);
      if (!pos) return;

      isDrawing.current = true;
      lastPosition.current = pos;
      pushHistory();

      updateHeightMap((data) => {
        applyBrush(
          data,
          pos.x,
          pos.y,
          brushConfig.size,
          brushConfig.strength,
          brushConfig.tool,
        );
      });
    },
    [brushConfig, getUVFromEvent, updateHeightMap, pushHistory, controlsRef],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (!isDrawing.current) return;

      if (spaceHeld.current) {
        isDrawing.current = false;
        lastPosition.current = null;
        if (controlsRef?.current) {
          controlsRef.current.enabled = true;
        }
        return;
      }

      const pos = getUVFromEvent(event);
      if (!pos || !lastPosition.current) return;

      const points = lerpPoints(lastPosition.current, pos, 2);

      updateHeightMap((data) => {
        for (const point of points) {
          applyBrush(
            data,
            point.x,
            point.y,
            brushConfig.size,
            brushConfig.strength,
            brushConfig.tool,
          );
        }
      });

      lastPosition.current = pos;
    },
    [brushConfig, getUVFromEvent, updateHeightMap, controlsRef],
  );

  const handlePointerUp = useCallback(
    (event: PointerEvent) => {
      if (isDrawing.current && event.button === 0) {
        // drawing finished
      }
      isDrawing.current = false;
      lastPosition.current = null;

      if (controlsRef?.current) {
        controlsRef.current.enabled = true;
      }
    },
    [controlsRef],
  );

  useEffect(() => {
    const canvas = gl.domElement;

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointerleave", handlePointerUp);

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointerleave", handlePointerUp);
    };
  }, [gl, handlePointerDown, handlePointerMove, handlePointerUp]);

  return {};
}
