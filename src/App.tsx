import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { forwardRef, useRef, useImperativeHandle } from "react";
import * as THREE from "three";

// Track keyboard input
declare global {
  interface Window {
    keyState: Record<string, boolean>;
  }
}
window.keyState = {};
document.addEventListener("keydown", (e) => (window.keyState[e.key.toLowerCase()] = true));
document.addEventListener("keyup", (e) => (window.keyState[e.key.toLowerCase()] = false));

const Player = forwardRef<THREE.Mesh>((_, ref) => {
  const meshRef = useRef<THREE.Mesh>(null);
  useImperativeHandle(ref, () => meshRef.current!);

  useFrame((_, delta) => {
    const speed = 5;
    const dir = new THREE.Vector3();
    if (window.keyState["w"]) dir.z -= 1;
    if (window.keyState["s"]) dir.z += 1;
    if (window.keyState["a"]) dir.x -= 1;
    if (window.keyState["d"]) dir.x += 1;
    dir.normalize().multiplyScalar(speed * delta);
    if (meshRef.current) meshRef.current.position.add(dir);
  });

  return (
    <mesh ref={meshRef} position={[0, 0.5, 0]} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  );
});

function LampPost({ position }: { position: [number, number, number] }) {
  return (
    <>
      <mesh position={[position[0], 2.5, position[2]]}>
        <cylinderGeometry args={[0.1, 0.1, 5]} />
        <meshStandardMaterial color="#888" />
      </mesh>
      <mesh position={[position[0], 5.5, position[2]]}>
        <sphereGeometry args={[0.3]} />
        <meshStandardMaterial emissive="#ffffaa" color="#222" emissiveIntensity={1} />
      </mesh>
      <pointLight position={[position[0], 5.5, position[2]]} intensity={1} distance={10} decay={2} color="#fffec0" />
    </>
  );
}

function Streets() {
  const asphalt = useLoader(THREE.TextureLoader, "/assets/asphalt.jpg");
  asphalt.wrapS = asphalt.wrapT = THREE.RepeatWrapping;
  asphalt.repeat.set(1, 1);

  const elements = [];

  for (let i = -3; i <= 3; i++) {
    elements.push(
      <mesh key={`v-${i}`} position={[i * 5, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.5, 60]} />
        <meshStandardMaterial map={asphalt} />
      </mesh>
    );
    elements.push(
      <mesh key={`h-${i}`} position={[0, 0.01, i * 5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 4.5]} />
        <meshStandardMaterial map={asphalt} />
      </mesh>
    );
    elements.push(
      <mesh key={`line-v-${i}`} position={[i * 5, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.1, 60]} />
        <meshStandardMaterial emissive="#fffac0" emissiveIntensity={1} color="#000" />
      </mesh>
    );
    elements.push(
      <mesh key={`line-h-${i}`} position={[0, 0.02, i * 5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 0.1]} />
        <meshStandardMaterial emissive="#fffac0" emissiveIntensity={1} color="#000" />
      </mesh>
    );
  }

  return <>{elements}</>;
}

function Building({ position, height }: { position: [number, number, number]; height: number }) {
  const concrete = useLoader(THREE.TextureLoader, "/assets/concrete.jpg");
  return (
    <mesh position={[position[0], height / 2, position[2]]} castShadow receiveShadow>
      <boxGeometry args={[3, height, 3]} />
      <meshStandardMaterial map={concrete} />
    </mesh>
  );
}

function Buildings() {
  const b = [];
  for (let i = -3; i <= 3; i++) {
    for (let j = -3; j <= 3; j++) {
      if (i % 2 === 0 || j % 2 === 0) continue;
      const height = 4 + Math.random() * 10;
      b.push(<Building key={`${i}-${j}`} position={[i * 5, 0, j * 5]} height={height} />);
    }
  }
  return <>{b}</>;
}

function CameraFollow({ target }: { target: React.MutableRefObject<THREE.Object3D | null> }) {
  const camRef = useRef<THREE.PerspectiveCamera>(null);
  useFrame(() => {
    if (camRef.current && target.current) {
      const pos = target.current.position;
      camRef.current.position.lerp(new THREE.Vector3(pos.x, pos.y + 5, pos.z + 8), 0.1);
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
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 10, 5]} castShadow intensity={1} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <Streets />
      <Buildings />
      <LampPost position={[0, 0, 0]} />
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
