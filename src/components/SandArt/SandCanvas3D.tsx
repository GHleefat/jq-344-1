import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Suspense, useRef } from "react";
import { SandMesh } from "./SandMesh";
import { LightSetup } from "./LightSetup";
import { useBrushInteraction } from "@/hooks/useBrushInteraction";
import * as THREE from "three";

function BrushInteractionHandler() {
  useBrushInteraction({ planeSize: 10 });
  return null;
}

interface SandCanvas3DProps {
  className?: string;
}

export function SandCanvas3D({ className }: SandCanvas3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className={className}>
      <Canvas
        shadows
        camera={{ position: [0, 8, 10], fov: 50 }}
        gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color(0x0a0a0f));
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.2;
        }}
      >
        <Suspense fallback={null}>
          <LightSetup />

          <SandMesh size={10} segments={256} />

          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -0.01, 0]}
            receiveShadow
          >
            <planeGeometry args={[12, 12]} />
            <meshStandardMaterial
              color="#1a1a2e"
              roughness={0.8}
              metalness={0.2}
            />
          </mesh>

          <mesh position={[0, -0.5, 0]}>
            <boxGeometry args={[11, 0.5, 11]} />
            <meshStandardMaterial color="#2d1f14" roughness={0.9} />
          </mesh>

          <BrushInteractionHandler />

          <OrbitControls
            enablePan={false}
            minDistance={5}
            maxDistance={20}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.1}
            enableDamping
            dampingFactor={0.05}
          />

          <Environment preset="studio" />

          <EffectComposer>
            <Bloom
              luminanceThreshold={0.4}
              luminanceSmoothing={0.9}
              intensity={0.8}
              radius={0.5}
            />
            <Vignette offset={0.5} darkness={0.5} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
