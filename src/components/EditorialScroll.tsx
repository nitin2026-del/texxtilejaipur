'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface EditorialScrollProps {
  products: any[];
}

export const EditorialScroll: React.FC<EditorialScrollProps> = ({ products }) => {
  // Grab top 3 products with images for the editorial layout
  const featured = products.filter(p => p.images && p.images.length > 0).slice(0, 3);
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Create subtle parallax scroll effects for each image
  const y1 = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const y2 = useTransform(scrollYProgress, [0, 1], [150, -150]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -100]);

  // If we don't have enough products, don't render to prevent crashes
  if (featured.length < 3) return null;

  return (
    <section ref={containerRef} className="py-32 bg-[#FDFBF7] overflow-hidden relative border-t border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            
            {/* Text Content */}
            <div className="md:col-span-5 relative z-10">
                <motion.h2 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-5xl lg:text-7xl font-serif text-zinc-900 leading-tight mb-6"
                >
                    Timeless <br />
                    <span className="italic text-brand-600 font-light">Elegance</span>
                </motion.h2>
                <motion.p 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-zinc-600 text-lg leading-relaxed mb-10 max-w-md font-light"
                >
                    Discover our most coveted pieces. Handcrafted by artisans in Jaipur using centuries-old block printing and Suzani embroidery techniques. 
                    True wearable art, designed for the modern muse.
                </motion.p>
                <motion.a 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    href={`/product/${featured[0].id}`}
                    className="inline-block border-b-2 border-zinc-900 pb-1 text-sm font-bold text-zinc-900 hover:text-brand-600 hover:border-brand-600 transition-colors uppercase tracking-widest"
                >
                    Shop The Edit
                </motion.a>
            </div>

            {/* Images Grid (Desktop Parallax) */}
            <div className="md:col-span-7 relative h-[700px] lg:h-[800px] hidden md:block">
                {/* Image 1 (Front, Left) */}
                <motion.div 
                    style={{ y: y1 }}
                    className="absolute top-10 left-0 w-64 lg:w-72 h-[400px] lg:h-[450px] overflow-hidden shadow-2xl z-20"
                >
                    <img src={featured[0].images[0]} alt={featured[0].name} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                </motion.div>

                {/* Image 2 (Back, Right) */}
                <motion.div 
                    style={{ y: y2 }}
                    className="absolute top-48 right-0 w-72 lg:w-80 h-[450px] lg:h-[550px] overflow-hidden shadow-xl z-10"
                >
                    <img src={featured[1].images[0]} alt={featured[1].name} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                </motion.div>

                {/* Image 3 (Front, Bottom Center) */}
                <motion.div 
                    style={{ y: y3 }}
                    className="absolute bottom-0 left-32 w-56 lg:w-64 h-[350px] lg:h-[400px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-30"
                >
                    <img src={featured[2].images[0]} alt={featured[2].name} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                </motion.div>
            </div>
            
            {/* Mobile Fallback Layout (No heavy parallax on mobile to preserve performance) */}
            <div className="md:hidden flex flex-col gap-6 mt-8">
               {featured.map((p, i) => (
                   <motion.div 
                        key={p.id} 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6, delay: i * 0.2 }}
                        className="w-full aspect-[3/4] overflow-hidden shadow-lg"
                    >
                       <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                   </motion.div>
               ))}
            </div>

        </div>
    </section>
  );
}
