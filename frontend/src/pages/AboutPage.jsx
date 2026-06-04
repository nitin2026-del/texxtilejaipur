import React from 'react';
import MainLayout from '../layouts/MainLayout';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <MainLayout title="Our Story – Gupta International" description="Discover the heritage, craftsmanship, and conscious design behind Gupta International.">
      
      {/* Hero Section */}
      <div className="relative w-full h-[60vh] min-h-[500px] -mt-[72px] sm:-mt-[84px] mb-24 overflow-hidden bg-black reveal">
        <img 
          src="https://images.unsplash.com/photo-1550614000-4b95d415f309?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=90" 
          alt="Artisans at work" 
          className="w-full h-full object-cover opacity-70" 
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4 pt-16">
          <p className="text-white/80 label-luxury tracking-[0.3em] mb-4 animate-fade-up">Our Heritage</p>
          <h1 className="text-white font-editorial text-5xl md:text-7xl mb-6 animate-fade-up delay-100">Gupta International</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 mb-32">
        {/* The Story */}
        <div className="text-center prose prose-lg mx-auto reveal delay-200">
          <p className="display-md text-[var(--color-espresso)] dark:text-[#f0ede8] mb-12 leading-snug">
            At Gupta International, we celebrate craftsmanship, creativity, and conscious design. What began as a small creative endeavor has grown into a purpose-driven brand rooted in authenticity and handmade excellence.
          </p>

          <p className="text-[var(--color-bronze)] text-lg md:text-xl font-light mb-8 leading-relaxed">
            We believe in the beauty of slow fashion — where every piece tells a story and reflects the hands that made it. Our focus is on creating with intention, using thoughtful materials, and honoring the process behind every detail.
          </p>

          <p className="text-[var(--color-bronze)] text-lg md:text-xl font-light mb-16 leading-relaxed">
            Driven by passion and purpose, our team is committed to offering more than just style — we offer meaning, individuality, and a connection to something real. Thank you for being part of our journey.
          </p>

          <p className="font-editorial text-2xl text-[var(--color-espresso)] dark:text-[#f0ede8] italic">
            — Gupta International
          </p>
        </div>
      </div>

      {/* Editorial Split Banner */}
      <section className="max-w-[1600px] mx-auto px-4 md:px-6 mb-[var(--section-gap)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:h-[600px] bg-[var(--color-parchment)] dark:bg-[#161412] reveal">
          <div className="flex flex-col justify-center items-center text-center p-8 md:p-12 lg:p-24 order-2 lg:order-1">
            <p className="label-luxury mb-4">Conscious Design</p>
            <h2 className="display-md mb-6 text-[var(--color-espresso)] dark:text-[#f0ede8]">Honoring the Process</h2>
            <p className="text-[var(--color-bronze)] mb-10 max-w-md">
              Every detail is meticulously crafted with intention, ensuring our creations respect both the artisan and the environment.
            </p>
            <Link to="/shop" className="btn-luxury">Discover Our Work</Link>
          </div>
          <div className="h-[400px] lg:h-full img-zoom order-1 lg:order-2">
            <img 
              src="https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
              alt="Craftsmanship details" 
              className="w-full h-full object-cover object-center"
              loading="lazy"
            />
          </div>
        </div>
      </section>

    </MainLayout>
  );
}
