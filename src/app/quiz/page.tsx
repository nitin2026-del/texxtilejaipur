'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BottomNav } from '@/components/BottomNav';
import { CartSidebar } from '@/components/CartSidebar';
import { CheckoutModal } from '@/components/CheckoutModal';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function QuizPage() {
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const questions = [
    {
      title: "What's your primary occasion?",
      options: [
        { label: 'Everyday Casual', desc: 'Comfortable, breathable cottons for daily wear', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80' },
        { label: 'Festive & Weddings', desc: 'Rich silks, zari work, and heavy embroidery', img: 'https://images.unsplash.com/photo-1610030469983-98e550d615ef?w=400&q=80' },
        { label: 'Workwear', desc: 'Elegant, subtle prints and structured fits', img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80' },
      ]
    },
    {
      title: "Which color palette speaks to you?",
      options: [
        { label: 'Earth & Indigo', desc: 'Deep blues, rust reds, and muddy browns', img: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=400&q=80' },
        { label: 'Vibrant Brights', desc: 'Rani pink, mustard yellow, and emerald green', img: 'https://images.unsplash.com/photo-1605656515822-7f28b49e1eec?w=400&q=80' },
        { label: 'Pastel Dreams', desc: 'Soft mint, blush pink, and powder blue', img: 'https://images.unsplash.com/photo-1583391265517-35bbd697f353?w=400&q=80' },
      ]
    },
    {
      title: "What's your preferred craft technique?",
      options: [
        { label: 'Hand Block Print', desc: 'Classic Bagru, Sanganeri, or Ajrakh prints', img: 'https://images.unsplash.com/photo-1620614389947-f50ec58a8a65?w=400&q=80' },
        { label: 'Intricate Embroidery', desc: 'Zardosi, Gota Patti, or Chikankari', img: 'https://images.unsplash.com/photo-1622396481328-9b1b28cdd09d?w=400&q=80' },
        { label: 'Pure Handloom', desc: 'Woven textures, Ikat, or Banarasi brocade', img: 'https://images.unsplash.com/photo-1604085449557-0a158b0682fa?w=400&q=80' },
      ]
    }
  ];

  const handleSelect = (label: string) => {
    setAnswers({ ...answers, [currentStep]: label });
    if (currentStep < questions.length) {
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 300);
    }
  };

  const isComplete = currentStep === questions.length;

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-zinc-900 flex flex-col">
      <Navbar onCartOpen={() => setCartOpen(true)} />
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} />
      <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
      
      <div className="flex-1 flex flex-col items-center justify-center pt-24 pb-20 px-6 max-w-5xl mx-auto w-full">
        
        {!isComplete ? (
          <div className="w-full max-w-4xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-10">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">
                <span>Question {currentStep + 1} of {questions.length}</span>
                <span>{Math.round(((currentStep) / questions.length) * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-brand-700 transition-all duration-500 ease-out"
                  style={{ width: `${((currentStep) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-5xl font-serif font-bold text-zinc-900 mb-4">
                {questions[currentStep].title}
              </h1>
              <p className="text-zinc-500">Select one option to continue</p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {questions[currentStep].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(opt.label)}
                  className={`group relative overflow-hidden rounded-3xl border-2 transition-all duration-300 text-left bg-white
                    ${answers[currentStep] === opt.label ? 'border-brand-600 shadow-xl ring-4 ring-brand-600/20' : 'border-zinc-100 shadow-sm hover:border-brand-300 hover:shadow-md'}
                  `}
                >
                  <div className="aspect-[4/3] w-full relative overflow-hidden">
                    <img 
                      src={opt.img} 
                      alt={opt.label} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80" />
                    
                    {answers[currentStep] === opt.label && (
                      <div className="absolute top-4 right-4 bg-brand-600 text-white rounded-full p-1 z-10 animate-scale-in">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                      <h3 className="text-white font-bold text-xl mb-1">{opt.label}</h3>
                      <p className="text-zinc-200 text-xs leading-relaxed">{opt.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {currentStep > 0 && (
              <div className="mt-10 flex justify-center">
                <button 
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors font-bold text-sm"
                >
                  <ArrowLeft className="h-4 w-4" /> Previous Question
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Results State */
          <div className="text-center w-full max-w-2xl mx-auto animate-fade-in-up">
            <div className="w-24 h-24 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-8 relative">
              <Sparkles className="h-10 w-10 text-brand-600 absolute animate-spin-slow" />
              <CheckCircle2 className="h-12 w-12 text-brand-700" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-zinc-900 mb-6">
              Your Style Profile is Ready!
            </h1>
            <p className="text-lg text-zinc-600 mb-10 leading-relaxed">
              Based on your answers, we've curated a personalized collection just for you. You lean towards <strong className="text-brand-800">{answers[0]}</strong> occasions, love <strong className="text-brand-800">{answers[1]}</strong> palettes, and appreciate <strong className="text-brand-800">{answers[2]}</strong>.
            </p>

            <Link 
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-brand-700 hover:bg-brand-800 text-white font-bold text-lg py-5 px-10 rounded-2xl transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              Shop Your Matches <ArrowRight className="h-5 w-5" />
            </Link>

            <div className="mt-8 pt-8 border-t border-zinc-200">
              <p className="text-sm text-zinc-500">
                A copy of your results and a special 10% discount code has been unlocked.
              </p>
            </div>
          </div>
        )}

      </div>
      
      <BottomNav onCartOpen={() => setCartOpen(true)} />
    </main>
  );
}
