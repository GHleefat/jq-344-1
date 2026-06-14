import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { sandVertexShader } from "@/shaders/sandVertex.glsl";
import { sandFragmentShader } from "@/shaders/sandFragment.glsl";
import { useSandStore } from "@/store/sandStore";
import { MAX_SAND_HEIGHT } from "@/utils/types";

interface SandMeshProps {
  size?: number;
  segments?: number;
}

export function SandMesh({ size = 10, segments = 256 }: SandMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const heightMapTextureRef = useRef<THREE.DataTexture | null>(null);

  const { heightMap, heightMapVersion } = useSandStore();

  const uniforms = useMemo(
    () => ({
      u_heightMap: { value: null as THREE.DataTexture | null },
      u_maxHeight: { value: MAX_SAND_HEIGHT },
      u_time: { value: 0 },
      u_displacementScale: { value: 1.0 },
      u_sandColor: { value: new THREE.Color(0xd4a574) },
      u_glowColor: { value: new THREE.Color(0xff8c42) },
      u_glowIntensity: { value: 1.5 },
      u_thicknessThreshold: { value: 0.4 },
      u_lightPosition: { value: new THREE.Vector3(5, 8, 5) },
      u_ambientStrength: { value: 0.25 },
      u_specularStrength: { value: 0.4 },
      u_shininess: { value: 32.0 },
    }),
    [],
  );

  useEffect(() => {
    const { data, width, height } = heightMap;
    const texture = new THREE.DataTexture(
      data,
      width,
      height,
      THREE.RedFormat,
      THREE.FloatType,
    );
    texture.needsUpdate = true;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    heightMapTextureRef.current = texture;

    if (materialRef.current) {
      materialRef.current.uniforms.u_heightMap.value = texture;
    }
  }, []);

  useEffect(() => {
    if (!heightMapTextureRef.current) return;
    heightMapTextureRef.current.needsUpdate = true;
  }, [heightMapVersion]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.u_time.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      castShadow
    >
      <planeGeometry args={[size, size, segments, segments]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={sandVertexShader}
        fragmentShader={sandFragmentShader}
        uniforms={uniforms}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
