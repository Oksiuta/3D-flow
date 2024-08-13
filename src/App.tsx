import React from "react";

import { Canvas, useFrame, useLoader, extend } from "@react-three/fiber";
import { TextureLoader } from "three/src/loaders/TextureLoader";
import { OrbitControls, Effects } from "@react-three/drei";

import { BackSide, RepeatWrapping } from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass";

const woodColor = require("./textures/Wood068_1K_Color.jpg");
const woodNormalGL = require("./textures/Wood068_1K_NormalGL.jpg");
const woodRoughness = require("./textures/Wood068_1K_Roughness.jpg");

const skyColor = require("./textures/SkyOnlyHDRI010_1K-TONEMAPPED.jpg");

// Makes these prototypes available as "native" jsx-string elements
extend({ EffectComposer, UnrealBloomPass, FilmPass });

// const grassColor = require("./textures/Grass001_1K_Color.jpg");
// const grassRoughness = require("./textures/Grass001_1K_Roughness.jpg");

const PLATE_WIDTH = 0.25;
const PLATE_ROTATE = 0.04;

function Plane() {
  const [colorMap, normalMap, roughnessMap] = useLoader(TextureLoader, [
    woodColor,
    woodNormalGL,
    woodRoughness
  ]);
  colorMap.wrapS = colorMap.wrapT = RepeatWrapping;

  return (
    <mesh position={[0, -12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeBufferGeometry attach="geometry" args={[200, 200]} />
      <meshStandardMaterial
        map={colorMap}
        normalMap={normalMap}
        roughnessMap={roughnessMap}
      />
    </mesh>
  );
}

function Sky() {
  const [colorMap] = useLoader(TextureLoader, [skyColor]);

  return (
    <mesh visible position={[0, -12, 0]}>
      <sphereGeometry args={[100, 16, 16]} />
      <meshStandardMaterial map={colorMap} side={BackSide} />
    </mesh>
  );
}

function Box(props) {
  // This reference will give us direct access to the THREE.Mesh object
  const ref = React.useRef();
  const { speed } = props;

  const [colorMap, normalMap, roughnessMap] = useLoader(TextureLoader, [
    woodColor,
    woodNormalGL,
    woodRoughness
  ]);

  // Set up state for the hovered and active state
  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);
  // Subscribe this component to the render-loop, rotate the mesh every frame
  useFrame((state, delta) => (ref.current.rotation.x += speed));
  // Return the view, these are regular Threejs elements expressed in JSX
  return (
    <mesh
      {...props}
      ref={ref}
      scale={hover ? 1.2 : 1}
      onClick={(event) => setActive(!active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}
    >
      <boxGeometry args={[0.25, 5, 5]} />
      <meshStandardMaterial
        map={colorMap}
        normalMap={normalMap}
        roughnessMap={roughnessMap}
      />
    </mesh>
  );
}

function RepeatBoxes({ amount, spacer }: { amount: number; spacer: number }) {
  const boxes = [];
  const startPositionX = (amount * (PLATE_WIDTH + spacer)) / 2;
  for (let i = 0; i < (amount || 1); i++) {
    const positionX = -startPositionX + i * (PLATE_WIDTH + spacer);
    const rotateX = i * PLATE_ROTATE;
    const speed = 0.01 + 0.00001 * i;
    boxes.push(
      <Box
        position={[positionX, 0, 0]}
        rotation={[rotateX, 0, 0]}
        speed={speed}
      />
    );
  }
  return boxes;
}

const camera = { fov: 75, near: 0.1, far: 1000, position: [0, 0, 10] };

export function App() {
  return (
    <Canvas camera={camera}>
      <OrbitControls />
      <React.Suspense fallback={null}>
        <ambientLight intensity={0.15} />
        <pointLight intensity={0.15} color="white" />
        <spotLight intensity={0.1} position={[20, 100, 20]} color="white" />
        <RepeatBoxes amount={80} spacer={0.04} />
        <Plane />
        <Sky />
        <Effects>
          {/*
          const bloomPass = new BloomPass(
          1,    // strength
          25,   // kernel size
          4,    // sigma ?
          256,  // blur render target resolution
          */}
          <unrealBloomPass attachArray="passes" args={[1, 25, 4, 256]} />
          {/*
              0.35,   // noise intensity
              0.025,  // scanline intensity
              648,    // scanline count
              false,  // grayscale
          */}
          <filmPass attachArray="passes" args={[0.25, 0.1, 900, 0]} />
        </Effects>
      </React.Suspense>
    </Canvas>
  );
}
