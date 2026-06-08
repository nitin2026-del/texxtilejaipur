import React from 'react';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

/**
 * MainLayout wraps every page with a consistent header, footer, and SEO meta tags.
 * It receives optional `title` and `description` props to set page‑specific metadata.
 */
export default function MainLayout({
  children,
  title = 'Textile Jaipur — Premium Global Clothing Exporter from India',
  description = 'Discover luxury ethnic wear, fusion clothing, and premium fabrics exported directly from India. Shop Textile Jaipur online!',
  keywords = 'Indian ethnic wear, global clothing export, sustainable fashion, designer sarees, wholesale kurtas',
  canonicalUrl = window.location.href,
  ogImage = 'https://images.unsplash.com/photo-1594912952549-fb93be3d5fc4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  ogType = 'website',
  robots = 'index, follow',
  schemaMarkup = null
}) {
  return (
    <HelmetProvider>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        {keywords && <meta name="keywords" content={keywords} />}
        <meta name="robots" content={robots} />
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content={ogType} />
        <meta property="og:url" content={canonicalUrl} />
        {ogImage && <meta property="og:image" content={ogImage} />}
        <meta property="og:site_name" content="Gupta International" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        {ogImage && <meta name="twitter:image" content={ogImage} />}

        {/* Structured Schema Markup */}
        {schemaMarkup && (
          <script type="application/ld+json">
            {JSON.stringify(schemaMarkup)}
          </script>
        )}
      </Helmet>
      
      {/* Luxury Layout Wrapper */}
      <div className="flex flex-col min-h-screen bg-[var(--color-ivory)] dark:bg-[#0e0d0c] text-[var(--color-charcoal)] dark:text-[#f0ede8] transition-colors duration-500">
        <Navbar />
        {/* Added top padding to account for fixed navbar, removed max-w container to allow full-bleed sections */}
        <main className="flex-1 pt-[72px] sm:pt-[84px] w-full animate-fade-in">{children}</main>
        <Footer />
      </div>
    </HelmetProvider>
  );
}
