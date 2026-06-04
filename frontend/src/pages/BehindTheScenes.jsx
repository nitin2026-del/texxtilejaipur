import React from 'react';
import MainLayout from '../layouts/MainLayout';
import { PlayIcon, CameraIcon, VideoCameraIcon } from '@heroicons/react/24/outline';

const VIDEOS = [
  {
    title: 'Inside Our Banarasi Silk Weaving Studio',
    desc: 'Watch master weavers create intricate brocade patterns that have been handed down for 15 generations.',
    thumbnail: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    duration: '8:24',
  },
  {
    title: 'The Making of a Royal Lehenga',
    desc: 'From raw silk to the finished embroidered masterpiece — a 72-hour process captured in full.',
    thumbnail: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    duration: '12:05',
  },
  {
    title: 'Zardozi Embroidery — Close Up',
    desc: 'An intimate look at the painstaking goldwork embroidery tradition from Lucknow.',
    thumbnail: 'https://images.unsplash.com/photo-1583391733958-650ac5d2bc50?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    duration: '5:47',
  },
  {
    title: 'Dyeing Fabrics with Natural Pigments',
    desc: 'Our artisan partners in Jaipur use ancient natural dyeing techniques — indigo, madder, and turmeric.',
    thumbnail: 'https://images.unsplash.com/photo-1608064971701-d8ec1adbf30d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    duration: '6:12',
  },
];

export default function BehindTheScenes() {
  return (
    <MainLayout title="Behind the Scenes – Gupta International" description="Witness the artistry and craftsmanship behind every garment we create.">
      <div className="max-w-6xl mx-auto py-12 px-4">
        
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-2xl mb-5">
            <VideoCameraIcon className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Behind the Scenes</h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Every thread tells a story. Step inside the workshops of the master artisans who bring our collections to life.
          </p>
        </div>

        {/* Featured Video */}
        <div className="relative rounded-3xl overflow-hidden mb-14 group cursor-pointer shadow-2xl" style={{ height: 420 }}>
          <img src={VIDEOS[0].thumbnail} alt={VIDEOS[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/50 group-hover:scale-110 transition-transform">
              <PlayIcon className="w-9 h-9 text-white fill-white ml-1" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <span className="bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3 inline-block">Featured</span>
            <h2 className="text-white text-2xl md:text-3xl font-bold mb-1">{VIDEOS[0].title}</h2>
            <p className="text-gray-300 text-sm">{VIDEOS[0].desc}</p>
          </div>
          <span className="absolute top-4 right-4 bg-black/60 text-white text-xs font-mono px-2 py-1 rounded-lg">{VIDEOS[0].duration}</span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {VIDEOS.slice(1).map((v, i) => (
            <div key={i} className="group relative bg-white/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/80 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="relative overflow-hidden" style={{ height: 200 }}>
                <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/50">
                    <PlayIcon className="w-5 h-5 text-white fill-white ml-0.5" />
                  </div>
                </div>
                <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs font-mono px-2 py-0.5 rounded">{v.duration}</span>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-gray-900 text-lg mb-2 leading-snug group-hover:text-indigo-600 transition-colors">{v.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-10 text-center text-white">
          <CameraIcon className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl font-bold mb-3">Visit Our Atelier</h2>
          <p className="text-indigo-100 max-w-xl mx-auto mb-6">Interested in a live tour of our partner studios? We host monthly visits for wholesale partners and loyal customers.</p>
          <a href="/contact" className="inline-block bg-white text-indigo-600 font-semibold px-8 py-3 rounded-full hover:bg-indigo-50 transition-colors">Get in Touch</a>
        </div>
      </div>
    </MainLayout>
  );
}
