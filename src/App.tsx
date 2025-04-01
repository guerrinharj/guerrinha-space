import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { forwardRef, useRef, useImperativeHandle, useEffect } from "react";
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

function PlayerCamera({ target }: { target: React.MutableRefObject<THREE.Mesh | null> }) {
  const camRef = useRef<THREE.PerspectiveCamera>(null);
  useFrame(() => {
    if (camRef.current && target.current) {
      const playerPos = target.current.position;
      camRef.current.position.copy(new THREE.Vector3(playerPos.x, playerPos.y + 0.6, playerPos.z));
      camRef.current.rotation.copy(target.current.rotation);
    }
  });
  return <PerspectiveCamera ref={camRef} makeDefault fov={75} />;
}

const Player = forwardRef<THREE.Mesh>((_, ref) => {
  const meshRef = useRef<THREE.Mesh>(null);
  useImperativeHandle(ref, () => meshRef.current!);

  useFrame((_, delta) => {
    const speed = 5;
    const direction = new THREE.Vector3();
    if (window.keyState["w"]) direction.z -= 1;
    if (window.keyState["s"]) direction.z += 1;
    if (window.keyState["a"]) direction.x -= 1;
    if (window.keyState["d"]) direction.x += 1;
    direction.normalize().multiplyScalar(speed * delta);
    if (meshRef.current) {
      meshRef.current.position.add(direction);
    }
  });

  return <mesh ref={meshRef} visible={false} position={[0, 0.5, 0]} />;
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
  const sidewalk = useLoader(THREE.TextureLoader, "/assets/sidewalk.jpg");
  asphalt.wrapS = asphalt.wrapT = THREE.RepeatWrapping;
  sidewalk.wrapS = sidewalk.wrapT = THREE.RepeatWrapping;
  asphalt.repeat.set(1, 1);
  sidewalk.repeat.set(1, 1);
  const elements = [];
  for (let i = -10; i <= 10; i++) {
    elements.push(
      <mesh key={`v-${i}`} position={[i * 5, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.5, 200]} />
        <meshStandardMaterial map={asphalt} />
      </mesh>
    );
    elements.push(
      <mesh key={`h-${i}`} position={[0, 0.01, i * 5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[200, 4.5]} />
        <meshStandardMaterial map={asphalt} />
      </mesh>
    );
    // Sidewalks
    elements.push(
      <mesh key={`h-sidewalk-top-${i}`} position={[0, 0.02, i * 5 + 2.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[200, 1.5]} />
        <meshStandardMaterial map={sidewalk} />
      </mesh>
    );
    elements.push(
      <mesh key={`h-sidewalk-bot-${i}`} position={[0, 0.02, i * 5 - 2.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[200, 1.5]} />
        <meshStandardMaterial map={sidewalk} />
      </mesh>
    );
    elements.push(
      <mesh key={`v-sidewalk-left-${i}`} position={[i * 5 + 2.6, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.5, 200]} />
        <meshStandardMaterial map={sidewalk} />
      </mesh>
    );
    elements.push(
      <mesh key={`v-sidewalk-right-${i}`} position={[i * 5 - 2.6, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.5, 200]} />
        <meshStandardMaterial map={sidewalk} />
      </mesh>
    );
  }
  return <>{elements}</>;
}

function Building({ position, height }: { position: [number, number, number]; height: number }) {
  const textures = [
    "/assets/concrete.jpg",
    "/assets/building1.jpg",
    "/assets/building2.jpg",
    "/assets/building3.jpg",
    "/assets/windows.jpg"
  ];
  const randomTexture = textures[Math.floor(Math.random() * textures.length)];
  const texture = useLoader(THREE.TextureLoader, randomTexture);

  return (
    <mesh position={[position[0], height / 2, position[2]]} castShadow receiveShadow>
      <boxGeometry args={[3, height, 3]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}

function Buildings() {
  const b = [];
  for (let i = -10; i <= 10; i++) {
    for (let j = -10; j <= 10; j++) {
      if (i % 2 === 0 || j % 2 === 0) continue;
      const height = 4 + Math.random() * 10;
      b.push(<Building key={`${i}-${j}`} position={[i * 5, 0, j * 5]} height={height} />);
    }
  }
  return <>{b}</>;
}

function Taxi({ speed }: { speed: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.position.x += speed * delta;
      if (ref.current.position.x > 100) ref.current.position.x = -100;
    }
  });
  return (
    <mesh ref={ref} position={[-100 + Math.random() * 200, 0.25, Math.random() * 100 - 50]}>
      <boxGeometry args={[2, 1, 1]} />
      <meshStandardMaterial color="yellow" emissive="#ff0" emissiveIntensity={0.3} />
    </mesh>
  );
}

function Pedestrian({ speed }: { speed: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.position.z += speed * delta;
      if (ref.current.position.z > 100) ref.current.position.z = -100;
    }
  });
  return (
    <mesh ref={ref} position={[Math.random() * 100 - 50, 0.5, -100 + Math.random() * 200]}>
      <boxGeometry args={[0.5, 1, 0.5]} />
      <meshStandardMaterial color="#f0f" />
    </mesh>
  );
}

function Traffic() {
  const taxis = Array.from({ length: 10 }, (_, i) => <Taxi key={`taxi-${i}`} speed={2 + Math.random() * 2} />);
  const people = Array.from({ length: 10 }, (_, i) => <Pedestrian key={`ped-${i}`} speed={1 + Math.random()} />);
  return <>{[...taxis, ...people]}</>;
}

function Skyline() {
  const buildings = [];
  const radius = 120;
  const count = 100;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const height = 20 + Math.random() * 60;
    buildings.push(
      <mesh key={i} position={[x, height / 2, z]}>
        <boxGeometry args={[3 + Math.random() * 3, height, 3 + Math.random() * 3]} />
        <meshStandardMaterial color="#111" emissive="#222" />
      </mesh>
    );
  }
  return <>{buildings}</>;
}

function CityBox() {
  return (
    <mesh position={[0, 50, 0]}>
      <boxGeometry args={[500, 100, 500]} />
      <meshStandardMaterial side={THREE.BackSide} color="#000010" />
    </mesh>
  );
}

function Skybox() {
  const { scene } = useThree();
  useEffect(() => {
    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
      "/skybox/space_bk.png",
      "/skybox/space_dn.png",
      "/skybox/space_ft.png",
      "/skybox/space_lf.png",
      "/skybox/space_rt.png",
      "/skybox/space_up.png",
    ]);
    scene.background = texture;
  }, [scene]);
  return null;
}

function Scene() {
  const playerRef = useRef<THREE.Mesh>(null);
  return (
    <Canvas shadows>
      <Skybox />
      <PlayerCamera target={playerRef} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 10, 5]} castShadow intensity={1} />
      <CityBox />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[500, 500]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <Streets />
      <Buildings />
      <Skyline />
      <Traffic />
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
