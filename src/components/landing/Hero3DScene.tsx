import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Rotating Octahedron with glow effect
const Octahedron = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.003;
      meshRef.current.rotation.y += 0.005;
    }
    if (glowRef.current) {
      glowRef.current.rotation.x += 0.003;
      glowRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group position={[0, 0.5, 0]}>
      {/* Inner glow */}
      <mesh ref={glowRef} scale={1.1}>
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial 
          color="#ff6b35" 
          transparent 
          opacity={0.15}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Main octahedron - wireframe */}
      <mesh ref={meshRef}>
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial 
          color="#ffffff" 
          wireframe 
          transparent 
          opacity={0.9}
        />
      </mesh>
      
      {/* Edge highlight */}
      <mesh rotation={[0.1, 0.1, 0]}>
        <octahedronGeometry args={[1.02, 0]} />
        <meshBasicMaterial 
          color="#ff9f6b" 
          wireframe 
          transparent 
          opacity={0.5}
        />
      </mesh>
    </group>
  );
};

// 3D Grid Terrain
const GridTerrain = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(30, 30, 40, 40);
    const positions = geo.attributes.position.array as Float32Array;
    
    // Create wave-like terrain
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const distance = Math.sqrt(x * x + y * y);
      positions[i + 2] = Math.sin(distance * 0.5) * 0.3 + Math.sin(x * 0.3) * 0.2;
    }
    
    geo.computeVertexNormals();
    return geo;
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
      const time = state.clock.elapsedTime;
      
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        const distance = Math.sqrt(x * x + y * y);
        positions[i + 2] = Math.sin(distance * 0.5 + time * 0.5) * 0.3 + Math.sin(x * 0.3 + time * 0.3) * 0.2;
      }
      
      meshRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <mesh 
      ref={meshRef} 
      rotation={[-Math.PI / 2.5, 0, 0]} 
      position={[0, -2, -5]}
      geometry={geometry}
    >
      <meshBasicMaterial 
        color="#c45c3a" 
        wireframe 
        transparent 
        opacity={0.6}
      />
    </mesh>
  );
};

// Floating particles
const Particles = () => {
  const particlesRef = useRef<THREE.Points>(null);
  
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(200 * 3);
    const cols = new Float32Array(200 * 3);
    
    for (let i = 0; i < 200; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5;
      
      cols[i * 3] = 0.8 + Math.random() * 0.2;
      cols[i * 3 + 1] = 0.5 + Math.random() * 0.3;
      cols[i * 3 + 2] = 0.3 + Math.random() * 0.2;
    }
    
    return [pos, cols];
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={200}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={200}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.05} 
        vertexColors 
        transparent 
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
};

export const Hero3DScene = () => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={0.5} color="#ff6b35" />
        <pointLight position={[-5, -5, 5]} intensity={0.3} color="#4a90d9" />
        
        <Octahedron />
        <GridTerrain />
        <Particles />
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
    </div>
  );
};

export default Hero3DScene;
