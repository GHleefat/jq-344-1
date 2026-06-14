import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface LightSetupProps {
  lightPosition?: [number, number, number];
  lightIntensity?: number;
  ambientIntensity?: number;
}

export function LightSetup({
  lightPosition = [5, 8, 5],
  lightIntensity = 1.2,
  ambientIntensity = 0.3,
}: LightSetupProps) {
  const directionalLightRef = useRef<THREE.DirectionalLight>(null);
  const pointLightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (pointLightRef.current) {
      const time = state.clock.elapsedTime;
      pointLightRef.current.position.x = Math.sin(time * 0.2) * 2;
      pointLightRef.current.position.z = Math.cos(time * 0.2) * 2;
    }
  });

  return (
    <>
      <ambientLight intensity={ambientIntensity} color="#fff5e6" />

      <directionalLight
        ref={directionalLightRef}
        position={lightPosition}
        intensity={lightIntensity}
        color="#fff0d9"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0001}
      />

      <pointLight
        ref={pointLightRef}
        position={[0, 3, 0]}
        intensity={0.3}
        color="#ff9966"
        distance={10}
      />

      <pointLight
        position={[-5, 4, -5]}
        intensity={0.2}
        color="#6699ff"
        distance={15}
      />

      <hemisphereLight args={["#ffeedd", "#332211", 0.4]} />
    </>
  );
}
