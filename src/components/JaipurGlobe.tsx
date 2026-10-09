'use client';
import React from 'react';
import { MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export const JaipurGlobe = () => {
  return (
    <div className="w-full h-[500px] relative bg-[#fdfbf7] rounded-3xl overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.05)] border border-[#e5e5df] my-12 flex items-center justify-center">
      <div className="absolute top-8 left-0 w-full text-center z-10 pointer-events-none">
        <h2 className="text-3xl md:text-4xl font-serif text-[#1a1464] mb-2">Our Artisan Heritage</h2>
        <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">
          Authentic Jaipur Textiles
        </p>
      </div>

      {/* The Globe Illusion */}
      <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full overflow-hidden shadow-[inset_-25px_-25px_50px_rgba(0,0,0,0.6),_0_20px_40px_rgba(0,0,0,0.2)] border border-black/10 mt-10">
        <motion.div
          animate={{ backgroundPositionX: ["0%", "100%"] }}
          transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
          className="w-full h-full"
          style={{
            backgroundImage: "url('/jaipur_pattern.jpg')",
            backgroundSize: "cover",
            backgroundRepeat: "repeat-x"
          }}
        />
        
        {/* 3D Shading Overlay to make it look spherical */}
        <div className="absolute inset-0 rounded-full shadow-[inset_25px_25px_50px_rgba(255,255,255,0.4)] pointer-events-none" />

        {/* Map Pin floating on top */}
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center drop-shadow-xl"
        >
          <div className="bg-[#1a1464] text-white text-[10px] font-bold px-2 py-1 rounded mb-1 whitespace-nowrap border border-amber-400">
            Handcrafted in Jaipur
          </div>
          <MapPin className="text-amber-500 fill-amber-100" size={32} />
        </motion.div>
      </div>
    </div>
  );
};
