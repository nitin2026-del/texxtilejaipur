import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent('Hi! I\'m interested in Gupta International\'s collection.')}`;

  return (
    <footer className="bg-gray-950 text-gray-400 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-5 gap-10">
        
        {/* Brand */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">IT</span>
            </div>
            <span className="text-white font-bold text-lg">Gupta International</span>
          </div>
          <p className="text-sm leading-relaxed mb-5 max-w-xs">
            Handcrafted luxury ethnic wear from India's finest artisans. Celebrating heritage, one thread at a time. Shipping to 50+ countries.
          </p>

          {/* WhatsApp CTA */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors mb-5"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Chat on WhatsApp
          </a>

          <div className="flex gap-4">
            {['Instagram', 'Pinterest', 'Facebook'].map(s => (
              <a key={s} href="#" className="text-xs text-gray-500 hover:text-white transition-colors">{s}</a>
            ))}
          </div>
        </div>

        {/* Shop */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm">Shop</h4>
          <ul className="space-y-3">
            {[
              { name: 'Kimonos', link: '/category/kimonos' },
              { name: 'Jackets', link: '/category/jackets' },
              { name: 'Vests', link: '/category/vests' },
              { name: 'Bags', link: '/category/bags' },
              { name: 'Shorts', link: '/category/cotton-suzani-shorts' },
              { name: 'Dresses', link: '/category/girls-dresses' },
              { name: 'Pajamas', link: '/category/pajamas' },
              { name: 'Quilt Sets', link: '/category/quilt-sets' },
              { name: 'Skirts', link: '/category/skirts' }
            ].map(item => (
              <li key={item.name}>
                <Link to={item.link} className="text-sm hover:text-white transition-colors">{item.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm">Company</h4>
          <ul className="space-y-3">
            {[
              { label: 'About Us', to: '/about' },
              { label: 'Blog', to: '/blog' },
              { label: 'Wholesale', to: '/wholesale' },
            ].map(({ label, to }) => (
              <li key={label}>
                <Link to={to} className="text-sm hover:text-white transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
          <div className="mt-5 pt-5 border-t border-gray-800">
            <h5 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">Download Catalog</h5>
            <a href="/catalogs/sarees-catalog-2024.pdf" download className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Product Catalog (PDF)
            </a>
          </div>
        </div>

        {/* Help */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm">Help</h4>
          <ul className="space-y-3">
            {[
              { label: 'FAQ', to: '/faq' },
              { label: 'Contact Us', to: '/contact' },
              { label: 'Order Tracking', to: '/track-order' },
              { label: 'Returns & Refunds', to: '/faq' },
              { label: 'Wholesale Inquiry', to: '/wholesale' },
            ].map(({ label, to }) => (
              <li key={label}>
                <Link to={to} className="text-sm hover:text-white transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">© 2024 Gupta International. All rights reserved. Proudly Made in India 🇮🇳</p>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(item => (
              <a key={item} href="#" className="text-xs text-gray-600 hover:text-white transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
