import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '.env.local');

const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const val = parts.slice(1).join('=').trim();
    envVars[key] = val;
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase URL or Anon Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log('Seeding database with premium dummy products...');

  // 1. Update existing products to INR prices if they exist
  console.log('Updating legacy products to INR prices...');
  const { data: existingProds, error: fetchErr } = await supabase
    .from('products')
    .select('*');

  if (fetchErr) {
    console.error('Failed to fetch existing products:', fetchErr);
  } else {
    for (const prod of existingProds) {
      if (prod.price === 299.99) {
        const { error } = await supabase
          .from('products')
          .update({ price: 24999 })
          .eq('id', prod.id);
        if (error) console.error(`Failed to update price for ${prod.name}:`, error);
        else console.log(`Updated ${prod.name} price to ₹24,999`);
      } else if (prod.price === 450) {
        const { error } = await supabase
          .from('products')
          .update({ price: 36999 })
          .eq('id', prod.id);
        if (error) console.error(`Failed to update price for ${prod.name}:`, error);
        else console.log(`Updated ${prod.name} price to ₹36,999`);
      }
    }
  }

  // 2. Setup categories
  const targetCategories = [
    { name: 'Embroidered Jackets', slug: 'embroidered-jackets', description: 'Premium hand-embroidered suzani and velvet jackets', image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363' },
    { name: 'Boho Dresses', slug: 'boho-dresses', description: 'Artisanal and sustainable maxi/midi boho dresses', image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8' },
    { name: 'Banarasi Silk', slug: 'banarasi-silk', description: 'Exquisite handloomed Banarasi silk garments', image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c' },
    { name: 'Sarees', slug: 'sarees', description: 'Handwoven silk, cotton and designer sarees', image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c' },
    { name: 'Kurtas', slug: 'kurtas', description: 'Classic and contemporary kurta collections', image_url: 'https://images.unsplash.com/photo-1583391733958-650ac5d2bc50' },
    { name: 'Lehengas', slug: 'lehengas', description: 'Bridal and festive lehengas', image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8' },
    { name: 'Sherwanis', slug: 'sherwanis', description: "Men's festive and bridal sherwanis", image_url: 'https://images.unsplash.com/photo-1594912952549-fb93be3d5fc4' }
  ];

  const categoryMap = {};

  console.log('Ensuring categories exist...');
  for (const cat of targetCategories) {
    // Check if category exists
    const { data: existing, error } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', cat.slug)
      .maybeSingle();

    if (error) {
      console.error(`Error checking category ${cat.name}:`, error);
      continue;
    }

    if (existing) {
      console.log(`Category "${cat.name}" already exists: ${existing.id}`);
      categoryMap[cat.name] = existing.id;
    } else {
      const { data: inserted, error: insertErr } = await supabase
        .from('categories')
        .insert(cat)
        .select('id')
        .single();

      if (insertErr) {
        console.error(`Error inserting category ${cat.name}:`, insertErr);
      } else {
        console.log(`Inserted category "${cat.name}": ${inserted.id}`);
        categoryMap[cat.name] = inserted.id;
      }
    }
  }

  // 3. Define dummy products to insert
  const dummyProducts = [
    {
      name: 'Vintage Suzani Embroidered Jacket',
      slug: 'vintage-suzani-embroidered-jacket',
      description: 'An exquisite heritage piece from Jaipur. Hand-embroidered vintage suzani motifs on premium cotton velvet with silk thread work. Fully lined and perfect for layering.',
      price: 18999,
      stock_quantity: 12,
      stock: 12,
      status: 'active',
      categoryName: 'Embroidered Jackets',
      is_featured: true,
      imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80'
    },
    {
      name: 'Royal Velvet Zardozi Cape',
      slug: 'royal-velvet-zardozi-cape',
      description: 'Stunning midnight blue velvet jacket adorned with meticulous gold zardozi hand embroidery along the cuffs and lapels. A premium design for grand celebrations.',
      price: 22999,
      stock_quantity: 8,
      stock: 8,
      status: 'active',
      categoryName: 'Embroidered Jackets',
      is_featured: true,
      imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80'
    },
    {
      name: 'Jaipur Floral Tiered Maxi Dress',
      slug: 'jaipur-floral-tiered-maxi-dress',
      description: 'Crafted from lightweight organic cotton, featuring hand-block printed botanical patterns, a smocked bodice, and floating tiered skirt. Perfect resort wear.',
      price: 8499,
      stock_quantity: 25,
      stock: 25,
      status: 'active',
      categoryName: 'Boho Dresses',
      is_featured: true,
      imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80'
    },
    {
      name: 'Indigo Handblock Artisan Midi',
      slug: 'indigo-handblock-artisan-midi',
      description: 'Naturally dyed indigo cotton midi dress with authentic hand-carved block prints. Breathable, eco-friendly, and effortlessly stylish.',
      price: 7999,
      stock_quantity: 20,
      stock: 20,
      status: 'active',
      categoryName: 'Boho Dresses',
      is_featured: false,
      imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80'
    },
    {
      name: 'Luxury Katan Silk Brocade Dupatta',
      slug: 'luxury-katan-silk-brocade-dupatta',
      description: 'A masterclass in Banarasi weaving. Woven with pure silk threads and gold zari, showcasing traditional paisley and floral creepers. Adds instant elegance to any ensemble.',
      price: 12499,
      stock_quantity: 15,
      stock: 15,
      status: 'active',
      categoryName: 'Banarasi Silk',
      is_featured: true,
      imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80'
    },
    {
      name: 'Lucknowi Chikankari Georgette Kurta',
      slug: 'lucknowi-chikankari-georgette-kurta',
      description: 'Classic pastel green georgette kurta adorned with intricate shadows and handwork Chikankari embroidery. Includes matching inner slips.',
      price: 9499,
      stock_quantity: 18,
      stock: 18,
      status: 'active',
      categoryName: 'Kurtas',
      is_featured: false,
      imageUrl: 'https://images.unsplash.com/photo-1583391733958-650ac5d2bc50?w=800&auto=format&fit=crop&q=80'
    }
  ];

  console.log('Inserting dummy products...');
  for (const prod of dummyProducts) {
    const categoryId = categoryMap[prod.categoryName];
    if (!categoryId) {
      console.error(`Skipping product ${prod.name}: Category ID not found`);
      continue;
    }

    // Check if product already exists
    const { data: existing, error } = await supabase
      .from('products')
      .select('id')
      .eq('slug', prod.slug)
      .maybeSingle();

    if (error) {
      console.error(`Error checking product ${prod.name}:`, error);
      continue;
    }

    let productId;

    if (existing) {
      console.log(`Product "${prod.name}" already exists: ${existing.id}. Updating details...`);
      productId = existing.id;
      const { error: updateErr } = await supabase
        .from('products')
        .update({
          name: prod.name,
          description: prod.description,
          price: prod.price,
          stock: prod.stock,
          stock_quantity: prod.stock_quantity,
          status: prod.status,
          category_id: categoryId,
          is_featured: prod.is_featured
        })
        .eq('id', productId);
      
      if (updateErr) {
        console.error(`Error updating product ${prod.name}:`, updateErr);
      }
    } else {
      const { data: inserted, error: insertErr } = await supabase
        .from('products')
        .insert({
          name: prod.name,
          slug: prod.slug,
          description: prod.description,
          price: prod.price,
          stock: prod.stock,
          stock_quantity: prod.stock_quantity,
          status: prod.status,
          category_id: categoryId,
          is_featured: prod.is_featured
        })
        .select('id')
        .single();

      if (insertErr) {
        console.error(`Error inserting product ${prod.name}:`, insertErr);
        continue;
      }
      productId = inserted.id;
      console.log(`Inserted product "${prod.name}": ${productId}`);
    }

    // Sync image
    const { data: imgExisting, error: imgCheckErr } = await supabase
      .from('product_images')
      .select('id')
      .eq('product_id', productId)
      .eq('url', prod.imageUrl)
      .maybeSingle();

    if (imgCheckErr) {
      console.error(`Error checking images for ${prod.name}:`, imgCheckErr);
    } else if (!imgExisting) {
      // Delete any other images for this product to keep it clean (since it's a seed script)
      await supabase.from('product_images').delete().eq('product_id', productId);

      const { error: imgInsertErr } = await supabase
        .from('product_images')
        .insert({
          product_id: productId,
          url: prod.imageUrl,
          is_primary: true,
          display_order: 1
        });

      if (imgInsertErr) {
        console.error(`Error inserting product image for ${prod.name}:`, imgInsertErr);
      } else {
        console.log(`Associated image with product "${prod.name}"`);
      }
    }
  }

  console.log('Seeding completed successfully!');
}

run().catch(console.error);
