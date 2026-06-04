import React from 'react';
import MainLayout from '../layouts/MainLayout';

export default function FAQPage() {
  const faqs = [
    {
      question: "What is your return policy?",
      answer: "We accept returns within 14 days of delivery for unworn, unwashed merchandise with all original tags attached. Custom or altered pieces cannot be returned."
    },
    {
      question: "Do you ship internationally?",
      answer: "Yes, we ship globally via DHL Express. International shipping usually takes 3-7 business days depending on the destination."
    },
    {
      question: "How do I care for my silk sarees?",
      answer: "We recommend dry cleaning only for all our pure silk and embroidered garments to preserve the delicate handwork and fabric integrity."
    },
    {
      question: "Can I track my order?",
      answer: "Absolutely. Once your order is dispatched, you will receive a tracking link via email. You can also view your order status in your User Dashboard."
    },
    {
      question: "Do you offer custom tailoring?",
      answer: "Currently, custom tailoring is available only at our flagship stores. Online, we offer a comprehensive sizing guide to help you find the perfect fit."
    }
  ];

  return (
    <MainLayout title="FAQ" description="Frequently asked questions.">
      <div className="max-w-4xl mx-auto py-16 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600">Find answers to common questions about our products, shipping, and returns.</p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white/40 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{faq.question}</h3>
              <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <a href="/contact" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-8 rounded-full transition-colors">
            Contact Support
          </a>
        </div>
      </div>
    </MainLayout>
  );
}
