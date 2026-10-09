'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader, Mesh } from 'three';
import { OrbitControls, Environment, Html } from '@react-three/drei';
import { MapPin } from 'lucide-react';

const RotatingSphere = () => {
  const sphereRef = useRef<Mesh>(null);
  const texture = useLoader(TextureLoader, '/jaipur_pattern.jpg');

  useFrame(() => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y += 0.003;
    }
  });

  return (
    <mesh ref={sphereRef} castShadow receiveShadow>
      <sphereGeometry args={[2.5, 64, 64]} />
      <meshStandardMaterial 
        map={texture}
        roughness={0.6}
        metalness={0.1}
      />
      
      {/* Pin attached to the rotating sphere */}
      <group position={[1.8, 1.2, 1.2]}>
        <Html distanceFactor={10} center>
          <div className="flex flex-col items-center drop-shadow-md">
            <div className="bg-[#1a1464] text-white text-[11px] font-bold px-2.5 py-1.5 rounded mb-1 whitespace-nowrap border border-amber-400">
              Handcrafted in Jaipur
            </div>
            <MapPin className="text-amber-500 fill-amber-100" size={28} />
          </div>
        </Html>
      </group>
    </mesh>
  );
};

export const JaipurGlobe = () => {
  return (
    <div className="w-full h-[500px] relative bg-[#fdfbf7] rounded-3xl overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.05)] border border-[#e5e5df] my-12">
      <div className="absolute top-8 left-0 w-full text-center z-10 pointer-events-none">
        <h2 className="text-3xl md:text-4xl font-serif text-[#1a1464] mb-2">Our Artisan Heritage</h2>
        <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">
          Drag to explore our authentic textiles
        </p>
      </div>
      
      <Canvas camera={{ position: [0, 0, 6.5], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />
        <Environment preset="city" />
        
        <React.Suspense fallback={
          <Html center>
            <div className="text-zinc-400 font-bold tracking-widest text-sm uppercase">Loading Globe...</div>
          </Html>
        }>
          <RotatingSphere />
        </React.Suspense>
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
        />
      </Canvas>
    </div>
  );
};
