import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Instagram, Facebook, Twitter, Shield, Truck, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-24 border-t border-zinc-800/60 bg-zinc-950/80">
      {/* Trust Strip */}
      <div className="border-b border-zinc-800/60">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-950/30 rounded-xl border border-yellow-800/30">
                <Truck className="h-6 w-6 text-gold" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Global DDP Shipping</h4>
                <p className="text-xs text-zinc-500 mt-0.5">All duties paid. Zero customs surprises.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-950/30 rounded-xl border border-yellow-800/30">
                <Shield className="h-6 w-6 text-gold" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Secure Payments</h4>
                <p className="text-xs text-zinc-500 mt-0.5">PCI-DSS Level 1 via Stripe. 3D Secure 2.0.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-950/30 rounded-xl border border-yellow-800/30">
                <Award className="h-6 w-6 text-gold" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Artisan Certified</h4>
                <p className="text-xs text-zinc-500 mt-0.5">Sourced directly from Jaipur master weavers.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="lg:col-span-1">
          <Link to="/" className="inline-block">
            <span className="font-serif text-2xl font-bold tracking-wide">
              HIYA<span className="text-gold">WEAR</span>
            </span>
          </Link>
          <p className="text-xs text-zinc-500 mt-3 leading-relaxed">
            Premium Indian ethnic wear and sustainable fashion, shipped worldwide from Jaipur, Rajasthan. Handcrafted with love.
          </p>
          <div className="flex items-center gap-3 mt-5">
            {[
              { icon: Instagram, href: '#', label: 'Instagram' },
              { icon: Facebook, href: '#', label: 'Facebook' },
              { icon: Twitter, href: '#', label: 'Twitter' },
            ].map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-gold hover:border-gold/30 transition-colors"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Shop Links */}
        <div>
          <h5 className="text-xs font-semibold text-zinc-300 uppercase tracking-widest mb-4">Shop</h5>
          <ul className="space-y-2.5">
            {[
              { to: '/catalog', label: 'All Collections' },
              { to: '/catalog?category=ethnic-wear', label: 'Ethnic Wear' },
              { to: '/catalog?category=sarees', label: 'Sarees' },
              { to: '/catalog?category=fusion', label: 'Fusion Apparel' },
              { to: '/catalog?featured=true', label: 'Featured' },
              { to: '/catalog?sale=true', label: 'Sale' },
            ].map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="text-sm text-zinc-500 hover:text-gold transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company Links */}
        <div>
          <h5 className="text-xs font-semibold text-zinc-300 uppercase tracking-widest mb-4">Company</h5>
          <ul className="space-y-2.5">
            {[
              { to: '/', label: 'About Hiya Wear' },
              { to: '/', label: 'Wholesale Enquiries' },
              { to: '/', label: 'Shipping & Returns' },
              { to: '/', label: 'Privacy Policy' },
              { to: '/', label: 'Terms of Service' },
              { to: '/', label: 'Sustainability' },
            ].map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="text-sm text-zinc-500 hover:text-gold transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h5 className="text-xs font-semibold text-zinc-300 uppercase tracking-widest mb-4">Contact</h5>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-gold shrink-0 mt-0.5" />
              <span className="text-sm text-zinc-500 leading-relaxed">
                Export Zone, Jaipur<br />Rajasthan 302001, India
              </span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gold shrink-0" />
              <a href="mailto:export@hiyawear.com" className="text-sm text-zinc-500 hover:text-gold transition-colors">
                export@hiyawear.com
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-gold shrink-0" />
              <a href="tel:+911412345678" className="text-sm text-zinc-500 hover:text-gold transition-colors">
                +91 141 234 5678
              </a>
            </li>
          </ul>

          {/* Newsletter */}
          <div className="mt-6">
            <p className="text-xs text-zinc-500 mb-2">Get exclusive offers & new arrivals:</p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="your@email.com"
                className="input-luxury flex-1 text-xs py-2"
              />
              <button type="submit" className="btn-premium px-3 py-2 rounded-lg text-xs shrink-0">
                Join
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-zinc-800/60 py-5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-600">
          <span>© {new Date().getFullYear()} Hiya Wear Exports Pvt. Ltd. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <span>DGFT Registered · IEC Holder</span>
            <span className="text-zinc-700">·</span>
            <span>Secure Payments by Stripe</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
