import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { forwardRef, useRef, useImperativeHandle, useEffect } from "react";
import * as THREE from "three";

// Extend window object
declare global {
  interface Window {
    keyState: Record<string, boolean>;
  }
}

window.keyState = {};

// Track key events
document.addEventListener("keydown", (e) => {
  window.keyState[e.key.toLowerCase()] = true;
});
document.addEventListener("keyup", (e) => {
  window.keyState[e.key.toLowerCase()] = false;
});

const Player = forwardRef<THREE.Mesh>((_, ref) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const velocity = new THREE.Vector3();

  useImperativeHandle(ref, () => meshRef.current!);

  useFrame((_, delta) => {
    const speed = 5;
    const direction = new THREE.Vector3();

    if (window.keyState["w"]) direction.z -= 1;
    if (window.keyState["s"]) direction.z += 1;
    if (window.keyState["a"]) direction.x -= 1;
    if (window.keyState["d"]) direction.x += 1;

    direction.normalize();
    direction.multiplyScalar(speed * delta);

    if (meshRef.current) {
      meshRef.current.position.add(direction);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0.5, 0]} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  );
});

function Buildings() {
  const buildings = [];
  for (let i = -10; i < 10; i++) {
    for (let j = -10; j < 10; j++) {
      if (Math.random() < 0.3) continue;
      buildings.push(
        <mesh key={`${i}-${j}`} position={[i * 5, 2, j * 5]} castShadow receiveShadow>
          <boxGeometry args={[3, 4 + Math.random() * 5, 3]} />
          <meshStandardMaterial color="#111" emissive="#2244ff" emissiveIntensity={0.4} />
        </mesh>
      );
    }
  }
  return <>{buildings}</>;
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color="#222" />
    </mesh>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
    </>
  );
}

function CameraFollow({ target }: { target: React.MutableRefObject<THREE.Object3D | null> }) {
  const camRef = useRef<THREE.PerspectiveCamera>(null);

  useFrame(() => {
    if (camRef.current && target.current) {
      const pos = target.current.position;
      const desiredPos = new THREE.Vector3(pos.x, pos.y + 5, pos.z + 8);
      camRef.current.position.lerp(desiredPos, 0.1);
      camRef.current.lookAt(pos);
    }
  });

  return <PerspectiveCamera ref={camRef} makeDefault fov={60} />;
}

function Scene() {
  const playerRef = useRef<THREE.Mesh>(null);

  return (
    <Canvas shadows>
      <CameraFollow target={playerRef} />
      <Lights />
      <Ground />
      <Buildings />
      <Player ref={playerRef} />
    </Canvas>
  );
}

export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh", backgroundColor: "black" }}>
      <Scene />
    </div>
  );
}
