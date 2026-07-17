'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import imageCompression from 'browser-image-compression';
import { v4 as uuidv4 } from 'uuid';
import { compressVideo } from '@/utils/videoCompression';
import { 
  ShieldCheck, AlertCircle, ShoppingBag, 
  Trash2, Edit, Plus, LayoutDashboard, Database, 
  ArrowLeft, Loader2, DollarSign, Package, Truck, 
  CheckCircle, Save, Tag, BookOpen, ChevronUp, ChevronDown, UploadCloud, X, GripVertical, ChevronLeft, ChevronRight, Star, MessageCircleQuestion, ArrowUp, ArrowDown, Search, Video, RefreshCcw
} from 'lucide-react';

interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  price_inr: number;
  category: string;
  images: string[];
  stock: number;
  details: { material?: string; origin?: string; care?: string; video_url?: string; translations?: any; culturalContext?: string; stylingAdvice?: string };
  is_featured?: boolean;
  display_rank?: number;
  image_url?: string;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_inr: number;
  products?: {
    name: string;
    sku: string;
  };
}

interface Shipment {
  id: string;
  order_id: string;
  courier: string;
  tracking_number: string;
  status: 'pending' | 'shipped' | 'delivered';
  created_at: string;
}

interface ProfileSummary {
  name: string;
  email: string;
}

interface Order {
  id: string;
  user_id: string;
  status: string;
  payment_status: string;
  total: number;
  subtotal: number;
  shipping_address_id: string;
  tracking_number: string;
  shipping_provider: string;
  shipping_address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  created_at: string;
  profiles?: { first_name?: string; last_name?: string; phone?: string; };
  shipping_addresses?: { full_name?: string; address_line1?: string; address_line2?: string; city?: string; state?: string; postal_code?: string; country?: string; phone?: string; };
  order_items?: OrderItem[];
  payments?: {
    id: string;
    gateway: string;
    amount: number;
    currency: string;
    status: string;
  }[];
}

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url: string;
  status: string;
  created_at: string;
}

interface Inquiry {
  id: string;
  product_id: string;
  customer_email: string;
  question: string;
  status: string;
  created_at: string;
  products?: { name: string, sku: string };
}
interface Coupon {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  min_order_value?: number;
  max_uses?: number;
  uses: number;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
}

interface BehindTheScenesItem {
  id: string;
  title: string;
  description?: string;
  media_url?: string;
  status: 'published' | 'draft';
  display_order: number;
  created_at: string;
}

export default function AdminPortal() {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const { formatPrice } = useCart();

  // Admin Login States
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState('');

  const [activeTab, setActiveTab] = useState<'overview' | 'catalog' | 'form' | 'categories' | 'blogs' | 'coupons' | 'inquiries' | 'behind_the_scenes'>('overview');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [videoUploadLoading, setVideoUploadLoading] = useState(false);
  // Image reorder: click position number to edit
  const [editingPosIdx, setEditingPosIdx] = useState<number | null>(null);
  const [editingPosValue, setEditingPosValue] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isBypassed, setIsBypassed] = useState(false);

  useEffect(() => {
    // Admin access strictly requires profile role to be 'admin'
  }, []);

  // Access Denied countdown state
  const [countdown, setCountdown] = useState(5);

  // Database states
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [behindTheScenesItems, setBehindTheScenesItems] = useState<BehindTheScenesItem[]>([]);
  const [btsUploadLoading, setBtsUploadLoading] = useState(false);
  const [btsTitle, setBtsTitle] = useState('');
  const [btsDescription, setBtsDescription] = useState('');
  const [btsFile, setBtsFile] = useState<File | null>(null);
  const [btsUploadProgress, setBtsUploadProgress] = useState(0);
  const [editingBtsId, setEditingBtsId] = useState<string | null>(null);
  const [dbCategories, setDbCategories] = useState<string[]>([]);
  const [dbCategoryObjects, setDbCategoryObjects] = useState<{id: string, name: string, parent_id: string | null, display_order?: number}[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryParentId, setNewCategoryParentId] = useState<string>('');

  // Selected order details modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [shipmentStatusInput, setShipmentStatusInput] = useState<'pending' | 'shipped' | 'delivered'>('pending');
  const [shippingProviderInput, setShippingProviderInput] = useState('ups');

  // Form states (Add/Edit Product)
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPriceInr, setFormPriceInr] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formStock, setFormStock] = useState('50');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formMaterial, setFormMaterial] = useState('');
  const [formOrigin, setFormOrigin] = useState('Jaipur, Rajasthan');
  const [formCare, setFormCare] = useState('');
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formDisplayRank, setFormDisplayRank] = useState('');
  
  // International AI features
  const [formCulturalContext, setFormCulturalContext] = useState('');
  const [formStylingAdvice, setFormStylingAdvice] = useState('');
  const [formTranslations, setFormTranslations] = useState('');

  // Blog states
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [formBlogTitle, setFormBlogTitle] = useState('');
  const [formBlogSlug, setFormBlogSlug] = useState('');
  const [formBlogExcerpt, setFormBlogExcerpt] = useState('');
  const [formBlogContent, setFormBlogContent] = useState('');
  const [formBlogImageUrl, setFormBlogImageUrl] = useState('');
  const [formBlogStatus, setFormBlogStatus] = useState('draft');
  const [isBlogFormOpen, setIsBlogFormOpen] = useState(false);

  // Coupon states
  const [coupons, setCoupons] = useState<any[]>([]);
  const [formCouponCode, setFormCouponCode] = useState('');
  const [formCouponType, setFormCouponType] = useState<'percent' | 'fixed'>('percent');
  const [formCouponValue, setFormCouponValue] = useState('');

  // Inquiries states
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  // Bulk Edit States
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [bulkPriceInput, setBulkPriceInput] = useState('');
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [dragOverItemIndex, setDragOverItemIndex] = useState<number | null>(null);

  const filteredProducts = products.filter(p => 
    (p.sku?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
    (p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || '')
  );

  const handleDragStart = (index: number) => {
    setDraggedItemIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (index !== dragOverItemIndex) {
      setDragOverItemIndex(index);
    }

    const SCROLL_SPEED = 20;
    const SCROLL_THRESHOLD = 150;
    
    // Check if we need to scroll the window
    if (e.clientY < SCROLL_THRESHOLD) {
      window.scrollBy({ top: -SCROLL_SPEED, behavior: 'instant' });
    } else if (window.innerHeight - e.clientY < SCROLL_THRESHOLD) {
      window.scrollBy({ top: SCROLL_SPEED, behavior: 'instant' });
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedItemIndex === null || dragOverItemIndex === null || draggedItemIndex === dragOverItemIndex) {
      setDraggedItemIndex(null);
      setDragOverItemIndex(null);
      return;
    }
    if (searchQuery.trim() !== '') {
      showNotification('Clear search query to reorder products.', true);
      setDraggedItemIndex(null);
      setDragOverItemIndex(null);
      return;
    }

    const newOrder = [...products];
    const draggedItem = newOrder.splice(draggedItemIndex, 1)[0];
    newOrder.splice(dragOverItemIndex, 0, draggedItem);

    const updatedProducts = newOrder.map((prod, index) => ({
      ...prod,
      display_rank: index + 1
    }));

    setProducts(updatedProducts);
    setDraggedItemIndex(null);
    setDragOverItemIndex(null);

    try {
      const promises = updatedProducts.map(u => 
        supabase.from('products').update({ display_rank: u.display_rank }).eq('id', u.id)
      );
      await Promise.all(promises);
      showNotification('Product order saved successfully!');
    } catch(err) {
      console.error(err);
      showNotification('Failed to save product order', true);
      fetchDashboardData();
    }
  };

  // AI States
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isBulkAiGenerating, setIsBulkAiGenerating] = useState(false);
  const [bulkAiProgress, setBulkAiProgress] = useState(0);

  const handleAutoGenerateDescription = async () => {
    if (!formName) {
      showNotification('Please enter a Product Name first.', true);
      return;
    }
    setIsAiGenerating(true);
    try {
      const res = await fetch('/api/admin/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: formName, 
          category: formCategory, 
          material: formMaterial, 
          origin: formOrigin,
          imageUrl: formImageUrl || null
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || data.error);
      setFormDescription(data.description || '');
      if (data.culturalContext) setFormCulturalContext(data.culturalContext);
      if (data.stylingAdvice) setFormStylingAdvice(data.stylingAdvice);
      if (data.translations) setFormTranslations(JSON.stringify(data.translations, null, 2));
      showNotification('AI completely generated all descriptions, context, and translations! ✨');
    } catch (err: any) {
      console.error(err);
      showNotification(err.message || 'Failed to generate description', true);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleBulkGenerateDescriptions = async () => {
    const emptyProducts = products.filter(p => !p.description || p.description.length < 20 || !p.details?.translations);
    if (emptyProducts.length === 0) {
      showNotification('All products already have AI descriptions and translations!', true);
      return;
    }
    
    if (!confirm(`Are you sure you want to AI-generate descriptions for ${emptyProducts.length} products? This may take a few minutes.`)) {
      return;
    }

    setIsBulkAiGenerating(true);
    setBulkAiProgress(0);

    let successCount = 0;
    for (let i = 0; i < emptyProducts.length; i++) {
      const p = emptyProducts[i];
      try {
        const res = await fetch('/api/admin/generate-description', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name: p.name, 
            category: p.category, 
            material: p.details?.material, 
            origin: p.details?.origin,
            imageUrl: p.image_url || null
          })
        });
        const data = await res.json();
        
        if (data.success && data.description) {
          const updatedDetails = {
            ...p.details,
            culturalContext: data.culturalContext || p.details?.culturalContext,
            stylingAdvice: data.stylingAdvice || p.details?.stylingAdvice,
            translations: data.translations || p.details?.translations
          };
          
          await supabase.from('products').update({ 
            description: data.description,
            details: updatedDetails
          }).eq('id', p.id);
          successCount++;
        }
      } catch (err) {
        console.error('Failed for product:', p.name, err);
      }
      setBulkAiProgress(i + 1);
      
      // Delay to avoid Gemini Rate Limit (15 Requests Per Minute on Free Tier)
      // 6000ms ensures we only make 10 requests per minute, perfectly safe!
      if (i < emptyProducts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 6000));
      }
    }

    setIsBulkAiGenerating(false);
    showNotification(`Successfully generated ${successCount} descriptions!`);
    fetchDashboardData();
  };

  // Bulk Price Update Handler
  const handleBulkPriceUpdate = async () => {
    const price = parseFloat(bulkPriceInput);
    if (isNaN(price) || price <= 0) {
      showNotification('Please enter a valid positive price.', true);
      return;
    }
    
    if (!confirm(`Are you sure you want to update the price of ${selectedProductIds.length} products to ₹${price}?`)) {
      return;
    }

    setIsBulkLoading(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({ price: price })
        .in('id', selectedProductIds);

      if (error) throw error;
      
      showNotification(`Successfully updated ${selectedProductIds.length} products to ₹${price}!`);
      setSelectedProductIds([]);
      setBulkPriceInput('');
      fetchDashboardData();
    } catch (err: any) {
      console.error('Bulk price update failed:', err);
      showNotification(err.message || 'Bulk price update failed', true);
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleToggleProductSelect = (id: string) => {
    setSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedProductIds(filteredProducts.map(p => p.id));
    } else {
      setSelectedProductIds([]);
    }
  };

  // Admin Authentication Actions
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginLoading(true);
    setAdminLoginError('');
    try {
      const { error: err } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword,
      });
      if (err) throw err;
    } catch (e: any) {
      setAdminLoginError(e.message || 'Authentication failed');
    } finally {
      setAdminLoginLoading(false);
    }
  };

  const handleSwitchAccount = async () => {
    await signOut();
    setAdminEmail('');
    setAdminPassword('');
  };

  const handleCreateCategory = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      showNotification('Please type a category name first!', true);
      return;
    }
    
    // Check if category already exists in our state
    if (dbCategories.includes(trimmed)) {
      setFormCategory(trimmed);
      setIsCategoryModalOpen(false);
      setNewCategoryName('');
      return;
    }

    setActionLoading(true);
    try {
      const catSlug = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: trimmed,
          slug: catSlug,
          description: `Artisanal garments in the ${trimmed} category`,
          image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
          parent_id: newCategoryParentId || null
        })
        .select()
        .single();

      if (error) throw error;
      
      // Update states
      const updatedCats = [...dbCategories, trimmed].sort();
      setDbCategories(updatedCats);
      setFormCategory(trimmed);
      setIsCategoryModalOpen(false);
      setNewCategoryName('');
      setNewCategoryParentId('');
      showNotification(`Category "${trimmed}" generated successfully!`);
      // Refresh to get the new object with ID
      fetchDashboardData();
    } catch (e: any) {
      console.error('Error creating category:', e);
      showNotification(e.message || 'Failed to create category', true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMoveCategory = async (catObj: any, direction: 'up' | 'down') => {
    const siblings = dbCategoryObjects
      .filter(c => c.parent_id === catObj.parent_id)
      .sort((a, b) => ((a.display_order || 0) - (b.display_order || 0)) || a.name.localeCompare(b.name));
    
    const currentIndex = siblings.findIndex(c => c.id === catObj.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= siblings.length) return;
    
    const newSiblings = [...siblings];
    const temp = newSiblings[currentIndex];
    newSiblings[currentIndex] = newSiblings[targetIndex];
    newSiblings[targetIndex] = temp;
    
    setActionLoading(true);
    
    const updatedCategories = dbCategoryObjects.map(c => {
      const siblingIndex = newSiblings.findIndex(s => s.id === c.id);
      if (siblingIndex !== -1 && c.parent_id === catObj.parent_id) {
        return { ...c, display_order: siblingIndex };
      }
      return c;
    });
    
    // Also sort the updatedCategories so they immediately reflect in the UI correctly
    updatedCategories.sort((a, b) => ((a.display_order || 0) - (b.display_order || 0)) || a.name.localeCompare(b.name));
    setDbCategoryObjects(updatedCategories);

    const updates = newSiblings.map((s, idx) => {
      return supabase.from('categories').update({ display_order: idx }).eq('id', s.id);
    });
    
    await Promise.all(updates);
    setActionLoading(false);
  };

  const handleDeleteCategory = async (categoryToDelete?: string) => {
    const target = categoryToDelete || formCategory;
    if (!target) return;
    
    if (dbCategories.length <= 1) {
      showNotification('Cannot delete the last remaining category.', true);
      return;
    }

    if (!window.confirm(`Are you sure you want to delete the category "${target}"? Any products in this category will be uncategorized.`)) {
      return;
    }

    setActionLoading(true);
    try {
      // Find the category ID from the name
      const { data: catData, error: findErr } = await supabase
        .from('categories')
        .select('id')
        .eq('name', target)
        .maybeSingle();

      if (findErr) throw findErr;
      
      if (catData) {
        // 1. Uncategorize products belonging to this category (set category_id = null)
        const { error: updateErr } = await supabase
          .from('products')
          .update({ category_id: null })
          .eq('category_id', catData.id);

        if (updateErr) throw updateErr;

        // 2. Delete the category from database
        const { error: deleteErr } = await supabase
          .from('categories')
          .delete()
          .eq('id', catData.id);

        if (deleteErr) {
          if (deleteErr.code === '23503') {
            throw new Error(`Cannot delete "${target}" because it is currently assigned to one or more products. Reassign those products first.`);
          }
          throw deleteErr;
        }

        showNotification(`Category "${target}" deleted successfully.`);
      }

      // Update state list
      const updatedCats = dbCategories.filter((c) => c !== target);
      setDbCategories(updatedCats);
      
      // If the deleted category was currently selected, reset it
      if (formCategory === target) {
        setFormCategory(updatedCats[0] || '');
      }

      // Refresh dashboard data to reflect uncategorized products in catalog
      fetchDashboardData();
    } catch (e: any) {
      console.error('Error deleting category:', e);
      showNotification(e.message || 'Failed to delete category', true);
    } finally {
      setActionLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [
        { data: prodData, error: prodErr },
        { data: catData, error: catErr },
        { data: orderData, error: orderErr },
        { data: blogData, error: blogErr },
        { data: couponsData, error: couponsErr },
        { data: inquiryData, error: inquiryErr },
        { data: btsData, error: btsErr }
      ] = await Promise.all([
        supabase
          .from('products')
          .select('*, categories (name), product_images (url, is_primary, display_order)')
          .order('display_rank', { ascending: true, nullsFirst: false }),
        supabase
          .from('categories')
          .select('id, name, parent_id, display_order')
          .order('display_order', { ascending: true })
          .order('name', { ascending: true }),
        supabase
          .from('orders')
          .select('*, shipping_addresses (*), order_items (*, products (name, slug)), payments (*)')
          .order('created_at', { ascending: false }),
        supabase
          .from('blogs')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('coupons')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('product_inquiries')
          .select('*, products (name, sku)')
          .order('created_at', { ascending: false }),
        supabase
          .from('behind_the_scenes')
          .select('*')
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: false })
      ]);

      if (prodErr) throw prodErr;

      // 1.5 Fetch Categories from DB
      if (!catErr && catData) {
        setDbCategoryObjects(catData);
        const uniqueNames = Array.from(new Set(catData.map((c: any) => c.name).filter(Boolean))) as string[];
        if (uniqueNames.length > 0) {
          setDbCategories(uniqueNames);
        }
      }

      // 1. Fetch Products
      if (prodData) {
        const mapped = (prodData as any[]).map((item) => {
          const sortedImages = item.product_images
            ? [...item.product_images]
                .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                .map((img) => img.url)
            : [];

          return {
            id: item.id,
            sku: item.slug ? `HT-${item.slug.toUpperCase()}` : `HT-${item.id.slice(0, 8).toUpperCase()}`,
            name: item.name,
            description: item.description || '',
            price_inr: item.price || 0,
            category: item.categories?.name || 'Uncategorized',
            images: sortedImages.length > 0 ? sortedImages : ['https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80'],
            stock: item.stock_quantity || item.stock || 0,
            details: {
              ...item.details,
              material: item.details?.material || (item.description?.includes('Silk') ? 'Pure Silk' : item.description?.includes('Cotton') ? 'Premium Cotton' : 'Handloom Fabric'),
              origin: item.details?.origin || 'Jaipur, Rajasthan',
              care: item.details?.care || 'Dry clean only'
            },
            is_featured: item.is_featured || false,
            display_rank: item.display_rank
          };
        });
        setProducts(mapped);
      }

      // 2. Fetch Orders with relations
      if (orderErr) {
        console.warn('Relationships fetch warning:', orderErr);
        const { data: fallbackOrders } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (fallbackOrders) {
          const enriched = await Promise.all(
            fallbackOrders.map(async (ord) => {
              const { data: items } = await supabase.from('order_items').select('*, products(name, slug)').eq('order_id', ord.id);
              const { data: ships } = await supabase.from('shipments').select('*').eq('order_id', ord.id);
              const { data: pays } = await supabase.from('payments').select('*').eq('order_id', ord.id);
              return {
                ...ord,
                order_items: items || [],
                payments: pays || []
              };
            })
          );
          setOrders(enriched as Order[]);
        }
      } else {
        setOrders((orderData as Order[]) || []);
      }

      // 3. Fetch Blogs
      if (!blogErr && blogData) {
        setBlogs(blogData);
      }

      // 4. Fetch Coupons
      if (!couponsErr && couponsData) {
        const formattedCoupons = couponsData.map((c: any) => ({
          id: c.id,
          code: c.code,
          type: c.discount_type === 'percentage' ? 'percent' : 'fixed',
          value: c.discount_value
        }));
        setCoupons(formattedCoupons);
      }

      // 5. Fetch Inquiries
      if (!inquiryErr && inquiryData) {
        setInquiries(inquiryData as Inquiry[]);
      }

      // 6. Fetch Behind The Scenes Items
      if (!btsErr && btsData) {
        setBehindTheScenesItems(btsData);
      }

    } catch (err) {
      console.error('Error fetching admin details:', err);
      showNotification('Error loading dashboard data.', true);
    } finally {
      setLoading(false);
    }
  };

  const profileRole = profile?.role;
  useEffect(() => {
    if (profileRole === 'admin' || isBypassed) {
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileRole, isBypassed]);



  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(''), 4000);
    } else {
      setSuccessMessage(msg);
      setTimeout(() => setSuccessMessage(''), 4000);
    }
  };

  // Product CRUD Handlers
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setImageUploadLoading(true);
    
    try {
      const files = Array.from(e.target.files);
      const uploadedUrls: string[] = [];

      for (const file of files) {
        const options = {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1200,
          useWebWorker: true,
          fileType: 'image/webp'
        };
        const compressedFile = await imageCompression(file, options);
        
        const fileName = `${uuidv4()}.webp`;
        const { error } = await supabase.storage
          .from('product-images')
          .upload(fileName, compressedFile, { contentType: 'image/webp' });
          
        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);
          
        uploadedUrls.push(publicUrl);
      }

      const existingUrls = formImageUrl.split(',').map(u => u.trim()).filter(u => u);
      const allUrls = [...existingUrls, ...uploadedUrls];
      setFormImageUrl(allUrls.join(', '));
      
      showNotification(`Successfully uploaded ${uploadedUrls.length} image(s).`);
    } catch (err: any) {
      console.error('Upload Error:', err);
      showNotification(err.message || 'Error uploading images', true);
    } finally {
      setImageUploadLoading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setVideoUploadLoading(true);
    
    try {
      const file = e.target.files[0];
      // File size validation (e.g. limit to 50MB)
      if (file.size > 50 * 1024 * 1024) {
        throw new Error('Video is too large. Please upload a file smaller than 50MB.');
      }

      let fileToUpload = file;
      if (file.type.startsWith('video/')) {
        showNotification('Compressing video... This may take a minute.');
        fileToUpload = await compressVideo(file, (progress) => {
          console.log(`Video compression progress: ${Math.round(progress * 100)}%`);
        });
      }

      const fileExt = fileToUpload.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('product-images')
        .upload(fileName, fileToUpload, { contentType: fileToUpload.type });
        
      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);
        
      setFormVideoUrl(publicUrl);
      showNotification('Video uploaded successfully!');
    } catch (err: any) {
      console.error('Upload Error:', err);
      showNotification(err.message || 'Error uploading video', true);
    } finally {
      setVideoUploadLoading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleBtsPublish = async () => {
    if (!editingBtsId && !btsFile) return;
    if (!btsTitle.trim()) {
      showNotification('Please enter a title.', true);
      return;
    }
    setBtsUploadLoading(true);
    
    try {
      let publicUrl = '';

      if (btsFile) {
        const file = btsFile;
        if (file.size > 50 * 1024 * 1024) {
          throw new Error('File is too large. Please upload a file smaller than 50MB.');
        }

        let fileToUpload = file;
        if (file.type.startsWith('video/')) {
          showNotification('Compressing video... This may take a minute.');
          setBtsUploadProgress(1); // Start at 1%
          fileToUpload = await compressVideo(file, (progress) => {
            setBtsUploadProgress(Math.round(progress * 100));
          });
          setBtsUploadProgress(0); // Reset after compression
        }

        const fileExt = fileToUpload.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        
        const { error } = await supabase.storage
          .from('product-images')
          .upload(fileName, fileToUpload, { contentType: fileToUpload.type });
          
        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);
          
        publicUrl = urlData.publicUrl;
      }
        
      if (editingBtsId) {
        // Update existing record
        const updateData: any = {
          title: btsTitle,
          description: btsDescription,
        };
        if (publicUrl) {
          updateData.media_url = publicUrl;
        }

        const { error: dbErr } = await supabase
          .from('behind_the_scenes')
          .update(updateData)
          .eq('id', editingBtsId);
          
        if (dbErr) throw dbErr;
        showNotification('Behind the scenes item updated successfully!');
      } else {
        // Create new record
        const { error: dbErr } = await supabase
          .from('behind_the_scenes')
          .insert({
            title: btsTitle,
            description: btsDescription,
            media_url: publicUrl,
            status: 'published',
            display_order: behindTheScenesItems.length
          });
          
        if (dbErr) throw dbErr;
        showNotification('Behind the scenes item added successfully!');
      }

      setBtsTitle('');
      setBtsDescription('');
      setBtsFile(null);
      setEditingBtsId(null);
      fetchDashboardData();
    } catch (err: any) {
      console.error('BTS Upload Error:', err);
      showNotification(err.message || 'Error uploading BTS item', true);
    } finally {
      setBtsUploadLoading(false);
    }
  };

  const handleBtsEditClick = (item: BehindTheScenesItem) => {
    setEditingBtsId(item.id);
    setBtsTitle(item.title);
    setBtsDescription(item.description || '');
    setBtsFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBtsCancelEdit = () => {
    setEditingBtsId(null);
    setBtsTitle('');
    setBtsDescription('');
    setBtsFile(null);
  };

  const handleBtsDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this Behind The Scenes item?')) return;
    setActionLoading(true);
    try {
      const { error } = await supabase.from('behind_the_scenes').delete().eq('id', id);
      if (error) throw error;
      showNotification('Item deleted successfully.');
      fetchDashboardData();
    } catch (err: any) {
      showNotification(err.message || 'Failed to delete item', true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBtsShuffle = async () => {
    if (!window.confirm('Are you sure you want to shuffle the display order of all published moments?')) return;
    setActionLoading(true);
    try {
      const shuffled = [...behindTheScenesItems].sort(() => Math.random() - 0.5);
      
      const updates = shuffled.map((item, index) => 
        supabase.from('behind_the_scenes').update({ display_order: index }).eq('id', item.id)
      );
      
      await Promise.all(updates);
      showNotification('Moments shuffled successfully!');
      fetchDashboardData();
    } catch (err: any) {
      showNotification(err.message || 'Failed to shuffle items', true);
    } finally {
      setActionLoading(false);
    }
  };
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setErrorMessage('');

    try {
      const price = parseFloat(formPriceInr);
      const stockInt = parseInt(formStock);

      if (isNaN(price) || price <= 0) throw new Error('Price must be a valid positive number');
      if (isNaN(stockInt) || stockInt < 0) throw new Error('Stock must be a valid positive integer');
      if (!formName || !formSku) throw new Error('Name and SKU are required fields');

      const imageUrls = formImageUrl.split(',').map((url) => url.trim()).filter((url) => url.length > 0);
      if (imageUrls.length === 0) {
        // Fallback premium unsplash textile image
        imageUrls.push('https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80');
      }

      const baseSlug = formName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      // Get category ID
      let categoryId = null;
      if (formCategory) {
        const { data: catData, error: catErr } = await supabase
          .from('categories')
          .select('id')
          .eq('name', formCategory)
          .maybeSingle();
        
        if (catData) {
          categoryId = catData.id;
        } else {
          // Insert category
          const catSlug = formCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const { data: newCat, error: newCatErr } = await supabase
            .from('categories')
            .insert({ name: formCategory, slug: catSlug })
            .select('id')
            .single();
          
          if (newCatErr) throw newCatErr;
          categoryId = newCat.id;
        }
      }

      let parsedTranslations = null;
      try {
        if (formTranslations) parsedTranslations = JSON.parse(formTranslations);
      } catch (e) {
        console.error("Invalid translations JSON", e);
      }

      const basePayload = {
        name: formName,
        description: formDescription,
        price: price,
        stock: stockInt,
        stock_quantity: stockInt,
        status: 'active',
        category_id: categoryId,
        is_featured: formIsFeatured,
        display_rank: formDisplayRank ? parseInt(formDisplayRank) : 999,
        details: {
          material: formMaterial,
          origin: formOrigin,
          care: formCare,
          video_url: formVideoUrl,
          culturalContext: formCulturalContext,
          stylingAdvice: formStylingAdvice,
          translations: parsedTranslations
        }
      };

      let productId = editingProductId;

      if (editingProductId) {
        // UPDATE — never change the slug to avoid unique constraint conflicts
        const { error } = await supabase
          .from('products')
          .update(basePayload)
          .eq('id', editingProductId);

        if (error) throw error;
        showNotification('Product updated successfully!');
      } else {
        // INSERT — add a unique suffix to the slug to prevent duplicates
        const uniqueSuffix = Date.now().toString(36).slice(-4); // e.g. "k3f2"
        const uniqueSlug = `${baseSlug}-${uniqueSuffix}`;
        const { data: newProd, error } = await supabase
          .from('products')
          .insert({ ...basePayload, slug: uniqueSlug })
          .select('id')
          .single();

        if (error) throw error;
        productId = newProd.id;
        showNotification('Product created successfully!');
      }

      // Sync image URLs in product_images
      if (productId) {
        // Delete existing image mappings
        await supabase
          .from('product_images')
          .delete()
          .eq('product_id', productId);

        // Insert new image mappings
        const imgInserts = imageUrls.map((url, idx) => ({
          product_id: productId,
          url: url,
          is_primary: idx === 0,
          display_order: idx + 1
        }));

        const { error: imgErr } = await supabase
          .from('product_images')
          .insert(imgInserts);

        if (imgErr) {
          console.error('Failed to sync product images:', imgErr);
        }
      }

      resetProductForm();
      fetchDashboardData();
      setActiveTab('catalog');
    } catch (err) {
      const e = err as Error;
      showNotification(e.message || 'Operation failed', true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditProductClick = (prod: Product) => {
    setEditingProductId(prod.id);
    setFormName(prod.name || '');
    setFormSku(prod.sku || '');
    setFormDescription(prod.description || '');
    setFormPriceInr(prod.price_inr?.toString() || '');
    setFormCategory(prod.category || '');
    setFormStock(prod.stock?.toString() || '0');
    setFormImageUrl(prod.images?.join(', ') || '');
    setFormMaterial(prod.details?.material || '');
    setFormOrigin(prod.details?.origin || 'Jaipur, Rajasthan');
    setFormCare(prod.details?.care || '');
    setFormVideoUrl(prod.details?.video_url || '');
    setFormIsFeatured(prod.is_featured || false);
    setFormDisplayRank(prod.display_rank?.toString() || '');
    setFormCulturalContext(prod.details?.culturalContext || '');
    setFormStylingAdvice(prod.details?.stylingAdvice || '');
    setFormTranslations(prod.details?.translations ? JSON.stringify(prod.details.translations, null, 2) : '');
    setActiveTab('form');
  };

  const handleDeleteProductClick = async (prodId: string) => {
    if (!confirm('Are you absolutely sure you want to delete this product? This action is irreversible.')) return;
    
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', prodId);
      
      if (error) throw error;
      showNotification('Product deleted successfully!');
      fetchDashboardData();
    } catch (err) {
      const e = err as Error;
      showNotification(e.message || 'Failed to delete product', true);
    } finally {
      setActionLoading(false);
    }
  };

  const resetProductForm = () => {
    setEditingProductId(null);
    setFormName('');
    setFormSku('');
    setFormDescription('');
    setFormPriceInr('');
    setFormCategory('');
    setFormStock('50');
    setFormImageUrl('');
    setFormMaterial('');
    setFormOrigin('Jaipur, Rajasthan');
    setFormCare('');
    setFormVideoUrl('');
    setFormIsFeatured(false);
    setFormDisplayRank('');
  };

  const resetBlogForm = () => {
    setEditingBlogId(null);
    setFormBlogTitle('');
    setFormBlogSlug('');
    setFormBlogExcerpt('');
    setFormBlogContent('');
    setFormBlogImageUrl('');
    setFormBlogStatus('draft');
    setIsBlogFormOpen(false);
  };

  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setErrorMessage('');

    try {
      const payload = {
        title: formBlogTitle,
        slug: formBlogSlug,
        excerpt: formBlogExcerpt,
        content: formBlogContent,
        image_url: formBlogImageUrl,
        status: formBlogStatus,
        author_id: user?.id,
      };

      if (editingBlogId) {
        const { error } = await supabase.from('blogs').update(payload).eq('id', editingBlogId);
        if (error) throw error;
        showNotification('Blog post updated successfully!');
      } else {
        const { error } = await supabase.from('blogs').insert(payload);
        if (error) throw error;
        showNotification('Blog post created successfully!');
      }
      resetBlogForm();
      fetchDashboardData();
    } catch (err) {
      const e = err as Error;
      showNotification(e.message || 'Operation failed', true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditBlogClick = (blog: Blog) => {
    setEditingBlogId(blog.id);
    setFormBlogTitle(blog.title || '');
    setFormBlogSlug(blog.slug || '');
    setFormBlogExcerpt(blog.excerpt || '');
    setFormBlogContent(blog.content || '');
    setFormBlogImageUrl(blog.image_url || '');
    setFormBlogStatus(blog.status || 'draft');
    setIsBlogFormOpen(true);
  };

  const handleDeleteBlog = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    try {
      setActionLoading(true);
      const { error } = await supabase.from('blogs').delete().eq('id', id);
      if (error) throw error;
      setBlogs(blogs.filter(b => b.id !== id));
      showNotification('Blog post deleted successfully!');
    } catch (err: any) {
      showNotification(err.message || 'Failed to delete blog', true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCouponCode || !formCouponValue) return;

    try {
      const { data, error } = await supabase.from('coupons').insert({
        code: formCouponCode.toUpperCase(),
        discount_type: formCouponType === 'percent' ? 'percentage' : 'fixed',
        discount_value: parseFloat(formCouponValue),
        is_active: true
      }).select().single();

      if (error) throw error;

      const newCoupon = {
        id: data.id,
        code: data.code,
        type: formCouponType,
        value: parseFloat(formCouponValue)
      };
      
      setCoupons([newCoupon, ...coupons]);
      setFormCouponCode('');
      setFormCouponValue('');
      showNotification('Coupon created successfully!');
    } catch (err) {
      console.error('Error creating coupon', err);
      showNotification('Failed to create coupon', true);
    }
  };

  const handleMarkInquiryReplied = async (inquiryId: string) => {
    try {
      const { error } = await supabase
        .from('product_inquiries')
        .update({ status: 'replied' })
        .eq('id', inquiryId);
      if (error) throw error;
      setInquiries(inquiries.map(inq => inq.id === inquiryId ? { ...inq, status: 'replied' } : inq));
      showNotification('Inquiry marked as replied');
    } catch (err) {
      console.error('Error updating inquiry status', err);
      showNotification('Failed to update status', true);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    
    try {
      const { error } = await supabase.from('coupons').delete().eq('id', id);
      if (error) throw error;
      
      setCoupons(coupons.filter(c => c.id !== id));
      showNotification('Coupon deleted.');
    } catch (err) {
      console.error('Error deleting coupon', err);
      showNotification('Failed to delete coupon', true);
    }
  };

  // Shipping updates
  const handleOpenOrderShipment = (order: Order) => {
    setSelectedOrder(order);
    setTrackingNumberInput(order.tracking_number || '');
    setShipmentStatusInput(order.status === 'shipped' || order.status === 'delivered' ? order.status : 'pending');
    setShippingProviderInput(order.shipping_provider || 'ups');
  };

  const handleUpdateShipmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setActionLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch('/api/orders/shipment', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': session ? `Bearer ${session.access_token}` : ''
        },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          trackingNumber: trackingNumberInput,
          status: shipmentStatusInput,
          shippingProvider: shippingProviderInput,
          customerName: selectedOrder.shipping_addresses?.full_name,
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update tracking');

      if (data.emailSent) {
        showNotification(`Tracking updated! Email sent to customer. (Preview: ${data.previewUrl})`);
        console.log('Email preview URL:', data.previewUrl);
      } else {
        showNotification('Shipment tracking updated successfully!');
      }

      setSelectedOrder(null);
      fetchDashboardData();
    } catch (err) {
      const e = err as Error;
      showNotification(e.message || 'Failed to update tracking details', true);
    } finally {
      setActionLoading(false);
    }
  };

  // Loading indicator for Auth checking
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center text-zinc-900">
        <Loader2 className="h-10 w-10 text-brand-700 animate-spin mb-4" />
        <p className="text-zinc-500 text-sm font-semibold uppercase tracking-wider animate-pulse">Initializing Security Audit...</p>
      </div>
    );
  }

  // 🔒 ACCESS DENIED GATE
  if (!user || profile?.role !== 'admin') {
    if (!user) {
      return (
        <div className="min-h-screen bg-[#FDFBF7] text-zinc-900 flex items-center justify-center p-6 relative overflow-hidden">
          {/* Decorative background glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-100 blur-[120px] rounded-full pointer-events-none -z-10" />
          <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-zinc-900 text-white hover:bg-zinc-800/5 blur-[100px] rounded-full pointer-events-none -z-10" />

          <div className="max-w-md w-full glass-card p-8 rounded-3xl border border-zinc-200 shadow-2xl text-center space-y-6 glow-border">
            <div className="space-y-2">
              <div className="h-12 w-12 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="h-6 w-6 text-brand-600" />
              </div>
              <h2 className="text-2xl font-serif tracking-wide text-zinc-900">Admin Gate</h2>
              <p className="text-zinc-500 text-xs">
                Please enter your administrator credentials to access the backend dashboard.
              </p>
            </div>

            {adminLoginError && (
              <div className="py-2.5 px-4 bg-red-950/20 border border-red-900/40 rounded-xl text-xs text-red-400 font-medium text-left">
                ⚠️ {adminLoginError}
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full bg-zinc-100/60 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 transition-all font-light"
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Password</label>
                <input 
                  type="password" 
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-zinc-100/60 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 transition-all font-light"
                  placeholder="••••••••"
                />
              </div>

              <button 
                type="submit"
                disabled={adminLoginLoading}
                className="w-full py-2.5 mt-2 rounded-xl text-xs font-semibold text-zinc-950 bg-zinc-900 text-white hover:bg-zinc-800 hover:bg-zinc-900 text-white hover:bg-zinc-800-dark transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {adminLoginLoading ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin shrink-0" />
                    Verifying Credentials...
                  </>
                ) : (
                  'Authorize Session'
                )}
              </button>
            </form>

            <div className="border-t border-zinc-200 pt-4 flex flex-col gap-2">
              <button 
                onClick={() => window.location.href = '/'}
                className="w-full py-2 rounded-xl text-xs text-zinc-600 hover:text-zinc-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Return to Storefront
              </button>
            </div>
          </div>
        </div>
      );
    } else {
      // User is logged in but role !== admin
      return (
        <div className="min-h-screen bg-[#FDFBF7] text-zinc-900 flex items-center justify-center p-6 relative overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-600/5 blur-[120px] rounded-full pointer-events-none -z-10" />

          <div className="max-w-md w-full glass-card p-8 rounded-3xl border border-red-950/30 text-center space-y-6">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto stroke-[1.5] animate-bounce" />
            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-zinc-900">Access Restricted</h2>
              <p className="text-zinc-500 text-xs leading-relaxed">
                This system is restricted to verified administrators. Your current account (<span className="text-zinc-700 font-semibold">{user.email}</span>) does not have authorization to view database records.
              </p>
            </div>

            <div className="py-2.5 px-4 bg-red-950/15 border border-red-900/30 rounded-xl text-xs text-red-400 font-medium">
              🚨 Access RESTRICTED to verified admins.
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleSwitchAccount}
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-zinc-950 bg-zinc-900 text-white hover:bg-zinc-800 hover:bg-zinc-900 text-white hover:bg-zinc-800-dark transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Sign In with Different Account
              </button>
              
              <button 
                onClick={() => window.location.href = '/'}
                className="w-full py-2.5 rounded-xl text-xs font-semibold bg-white hover:bg-zinc-850 text-zinc-900 border border-zinc-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" /> Return to Storefront
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // Calculate quick metrics
  const totalRevenue = orders
    .filter(o => o.payment_status === 'paid' || o.payment_status === 'completed')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingShipmentsCount = orders.filter(o => {
    return !o.tracking_number || o.status === 'PENDING';
  }).length;

  const lowStockCount = products.filter(p => p.stock <= 5).length;

  return (
    <main className="min-h-screen text-zinc-900 pb-24">
      {/* Background Glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-brand-50 blur-[150px] rounded-full pointer-events-none -z-10" />

      {/* Header Bar */}
      <nav className="fixed top-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-md border-b border-zinc-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-brand-700" />
            <h1 className="text-xl font-black tracking-tight select-none">
              Indi<span className="text-brand-700">Thread</span> <span className="text-zinc-500 font-medium text-sm ml-1.5 uppercase tracking-widest">Admin</span>
            </h1>
          </div>

          <button
            onClick={() => window.location.href = '/'}
            className="px-3.5 py-1.5 rounded-lg border border-zinc-200 bg-zinc-100/40 hover:bg-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Store
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto pt-28 px-6 space-y-8">
        
        {/* Tab Controls Bar */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-zinc-200 pb-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
              Welcome Back, Admin
            </h2>
            <p className="text-xs text-zinc-500">Manage catalog and ship Indian block-print textile orders globally.</p>
          </div>

          <div className="flex items-center gap-2 bg-[#FDFBF7] border border-zinc-200 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'bg-violet-600 text-white'
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" /> Orders & Analytics
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'catalog'
                  ? 'bg-violet-600 text-white'
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <Database className="h-3.5 w-3.5" /> Catalog List
            </button>
            <button
              onClick={() => { resetProductForm(); setActiveTab('form'); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'form'
                  ? 'bg-violet-600 text-white'
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <Plus className="h-3.5 w-3.5" /> {editingProductId ? 'Edit Product' : 'Add Product'}
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'categories'
                  ? 'bg-violet-600 text-white'
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <Tag className="h-3.5 w-3.5" /> Categories
            </button>
            <button
              onClick={() => setActiveTab('blogs')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'blogs'
                  ? 'bg-violet-600 text-white'
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" /> Blogs
            </button>
            <button
              onClick={() => setActiveTab('coupons')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'coupons'
                  ? 'bg-amber-600 text-white'
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <Tag className="h-3.5 w-3.5" /> Coupons
            </button>
            <button
              onClick={() => setActiveTab('inquiries')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'inquiries'
                  ? 'bg-rose-600 text-white'
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <MessageCircleQuestion className="h-3.5 w-3.5" /> Inquiries
            </button>
            <button
              onClick={() => setActiveTab('behind_the_scenes')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'behind_the_scenes'
                  ? 'bg-emerald-600 text-white'
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <Video className="h-3.5 w-3.5" /> Behind The Scenes
            </button>
          </div>
        </div>

        {/* Global Toast Notification */}
        {successMessage && (
          <div className="rounded-xl bg-emerald-950/30 border border-emerald-900/40 p-4 text-xs text-emerald-400 flex items-center gap-2 animate-fadeIn">
            <CheckCircle className="h-4 w-4 stroke-[2]" />
            <span>{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="rounded-xl bg-red-950/30 border border-red-900/40 p-4 text-xs text-red-400 flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="h-4 w-4 stroke-[2]" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* TAB 1: OVERVIEW & ORDERS */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl glass-card border border-zinc-200 space-y-2 relative overflow-hidden">
                <div className="absolute top-4 right-4 text-brand-700 bg-brand-100/50 border border-brand-200 p-2 rounded-xl">
                  <DollarSign className="h-5 w-5" />
                </div>
                <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Verified Revenue</span>
                <h4 className="text-2xl font-black tracking-tight text-zinc-900">{formatPrice(totalRevenue)}</h4>
                <p className="text-[10px] text-zinc-600">Calculated direct from paid invoices</p>
              </div>

              <div className="p-6 rounded-2xl glass-card border border-zinc-200 space-y-2 relative overflow-hidden">
                <div className="absolute top-4 right-4 text-brand-700 bg-brand-100/50 border border-brand-200 p-2 rounded-xl">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Total Sales count</span>
                <h4 className="text-2xl font-black tracking-tight text-zinc-900">{orders.length}</h4>
                <p className="text-[10px] text-zinc-600">Orders logged in Supabase</p>
              </div>

              <div className="p-6 rounded-2xl glass-card border border-zinc-200 space-y-2 relative overflow-hidden">
                <div className="absolute top-4 right-4 text-amber-500 bg-amber-950/30 border border-amber-900/20 p-2 rounded-xl animate-pulse">
                  <Truck className="h-5 w-5" />
                </div>
                <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Pending Shipments</span>
                <h4 className="text-2xl font-black tracking-tight text-zinc-900">{pendingShipmentsCount}</h4>
                <p className="text-[10px] text-zinc-600">Awaiting UPS pickup & tracking ID</p>
              </div>

              <div className="p-6 rounded-2xl glass-card border border-zinc-200 space-y-2 relative overflow-hidden">
                <div className="absolute top-4 right-4 text-red-500 bg-red-950/30 border border-red-900/20 p-2 rounded-xl">
                  <Package className="h-5 w-5" />
                </div>
                <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Low Stock alerts</span>
                <h4 className="text-2xl font-black tracking-tight text-red-400">{lowStockCount}</h4>
                <p className="text-[10px] text-zinc-600">Products with stock level under 5</p>
              </div>
            </div>

            {/* Orders Management Panel */}
            <div className="glass-card rounded-3xl border border-zinc-200 overflow-hidden">
              <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
                <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                  <Truck className="h-4 w-4 text-brand-700" /> Woven Orders Fulfillments
                </h3>
                <span className="text-[10px] bg-white text-zinc-600 border border-zinc-200 px-3 py-1 rounded-full font-mono">
                  {orders.length} total entries
                </span>
              </div>

              {loading ? (
                <div className="p-20 text-center space-y-3">
                  <Loader2 className="h-8 w-8 text-brand-700 animate-spin mx-auto" />
                  <p className="text-xs text-zinc-500">Querying transaction ledgers...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="p-20 text-center space-y-2">
                  <ShoppingBag className="h-10 w-10 text-zinc-700 mx-auto stroke-[1.5]" />
                  <p className="text-xs font-semibold text-zinc-600">No export orders found</p>
                  <p className="text-[10px] text-zinc-600">Simulate order creation on the checkout screen to see results here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#FDFBF7]/50 border-b border-zinc-200 text-zinc-600 font-medium">
                        <th className="p-4">Order ID & Date</th>
                        <th className="p-4">Customer Details</th>
                        <th className="p-4">Items</th>
                        <th className="p-4">Destination</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">UPS Status</th>
                        <th className="p-4 text-center">Fulfill</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/60">
                      {orders.map((order) => {
                        return (
                          <tr key={order.id} className="hover:bg-white/10 transition-colors">
                            <td className="p-4">
                              <span className="block font-bold text-zinc-900 font-mono text-[10px] truncate max-w-[120px]">{order.id}</span>
                              <span className="text-[10px] text-zinc-500 mt-0.5 block">
                                {new Date(order.created_at).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className="block font-bold text-zinc-700">
                                {order.shipping_addresses?.full_name || `${order.profiles?.first_name || ''} ${order.profiles?.last_name || ''}`.trim() || 'Guest User'}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-col gap-1 max-w-[200px]">
                                {order.order_items?.map((item) => (
                                  <div key={item.id} className="text-[10px] text-zinc-700 leading-tight">
                                    • {item.products?.name || 'Handloom Garment'} <strong className="font-mono text-zinc-500 text-[9px]">(x{item.quantity})</strong>
                                  </div>
                                ))}
                                {(!order.order_items || order.order_items.length === 0) && (
                                  <span className="text-[10px] text-zinc-400 italic">No items found</span>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="block font-medium text-zinc-700">
                                {order.shipping_addresses?.city || 'Jaipur'}
                              </span>
                              <span className="text-[9px] text-zinc-500 uppercase font-semibold tracking-wider">
                                ✈️ {order.shipping_addresses?.country || 'India'}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className="font-extrabold text-zinc-900">{formatPrice(order.total)}</span>
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                                order.status === 'delivered'
                                  ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-400'
                                  : order.status === 'shipped'
                                  ? 'bg-sky-950/20 border-sky-900/40 text-sky-400'
                                  : 'bg-amber-950/20 border-amber-900/40 text-amber-400'
                              }`}>
                                {order.status || 'pending'}
                              </span>
                              <span className="block text-[9px] text-zinc-500 font-mono mt-1 select-all">
                                {order.tracking_number || 'No tracking ref'}
                              </span>
                              {(order.payment_status !== 'paid' && order.payment_status !== 'completed') ? (
                                <span className="block text-[9px] text-red-400 font-bold mt-1 tracking-widest uppercase">
                                  UNPAID
                                </span>
                              ) : (
                                <span className="block text-[9px] text-emerald-500 font-bold mt-1 tracking-widest uppercase">
                                  PAID
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleOpenOrderShipment(order)}
                                  className="px-2.5 py-1.5 rounded-lg bg-[#FDFBF7] border border-zinc-200 hover:border-violet-500 text-zinc-700 hover:text-zinc-900 transition-colors text-[10px] font-semibold"
                                >
                                  Edit Tracking
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CATALOG INVENTORY LIST */}
        {activeTab === 'catalog' && (
          <div className="glass-card rounded-3xl border border-zinc-200 overflow-hidden">
            <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
              <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                <Database className="h-4 w-4 text-brand-700" /> Active Slub & Silk Product Ledger
              </h3>
              <div className="flex items-center gap-3">
                {products.filter(p => !p.description || p.description.length < 20 || !p.details?.translations).length > 0 && (
                  <button
                    onClick={handleBulkGenerateDescriptions}
                    disabled={isBulkAiGenerating}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-amber-200 to-amber-300 hover:from-amber-300 hover:to-amber-400 rounded-xl text-xs font-bold text-amber-900 flex items-center gap-1.5 transition-all disabled:opacity-50 shadow-sm"
                  >
                    {isBulkAiGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : '✨'}
                    {isBulkAiGenerating 
                      ? `Writing (${bulkAiProgress}/${products.filter(p => !p.description || p.description.length < 20 || !p.details?.translations).length})...` 
                      : `Auto-Write ${products.filter(p => !p.description || p.description.length < 20 || !p.details?.translations).length} Descriptions`}
                  </button>
                )}
                <button
                  onClick={() => { resetProductForm(); setActiveTab('form'); }}
                  className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-500 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Plus className="h-4 w-4" /> Add Product
                </button>
              </div>
            </div>

            {/* SEARCH BAR */}
            <div className="bg-[#FDFBF7] border-b border-zinc-200 p-4 flex items-center gap-3">
              <Search className="h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by SKU or Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none text-sm text-zinc-900 placeholder-zinc-500 focus:outline-none focus:ring-0"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-zinc-400 hover:text-zinc-600">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* BULK ACTION TOOLBAR */}
            {selectedProductIds.length > 0 && (
              <div className="bg-brand-50 border-b border-brand-200 p-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-brand-700">
                  {selectedProductIds.length} product(s) selected
                </span>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="New Price (INR)"
                    value={bulkPriceInput}
                    onChange={(e) => setBulkPriceInput(e.target.value)}
                    className="border border-brand-200 rounded p-1.5 text-xs text-zinc-900 w-40"
                  />
                  <button
                    onClick={handleBulkPriceUpdate}
                    disabled={isBulkLoading}
                    className="px-4 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded text-xs font-bold disabled:opacity-50"
                  >
                    {isBulkLoading ? 'Updating...' : 'Update Price'}
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="p-20 text-center space-y-3">
                <Loader2 className="h-8 w-8 text-brand-700 animate-spin mx-auto" />
                <p className="text-xs text-zinc-500">Querying product tables...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="p-20 text-center space-y-2">
                <Database className="h-10 w-10 text-zinc-700 mx-auto stroke-[1.5]" />
                <p className="text-xs font-semibold text-zinc-600">Inventory catalog is empty</p>
                <p className="text-[10px] text-zinc-600">Click Add Product to inject a new handcrafted block-print or saree.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#FDFBF7]/50 border-b border-zinc-200 text-zinc-600 font-medium">
                      <th className="p-4 w-12 text-center">
                        <input 
                          type="checkbox" 
                          checked={filteredProducts.length > 0 && selectedProductIds.length === filteredProducts.length}
                          onChange={handleSelectAll}
                          className="rounded border-zinc-300 text-brand-600 focus:ring-brand-500 cursor-pointer w-4 h-4"
                        />
                      </th>
                      <th className="p-4">SKU & Image</th>
                      <th className="p-4">Product Name</th>
                      <th className="p-4">Category</th>
                      <th className="p-4 text-center">Display Tier</th>
                      <th className="p-4 text-right">Base Price (INR)</th>
                      <th className="p-4">Stock Level</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/60">
                    {filteredProducts.map((prod, index) => (
                      <tr 
                        key={prod.id} 
                        draggable={!searchQuery}
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={() => setDragOverItemIndex(null)}
                        onDrop={handleDrop}
                        className={`hover:bg-zinc-50 transition-colors ${draggedItemIndex === index ? 'opacity-40 bg-brand-50' : ''} ${dragOverItemIndex === index && draggedItemIndex !== index ? 'border-t-2 border-brand-600 bg-brand-50/30' : ''}`}
                      >
                        <td className="p-4 text-center">
                          <input 
                            type="checkbox" 
                            checked={selectedProductIds.includes(prod.id)}
                            onChange={() => handleToggleProductSelect(prod.id)}
                            className="rounded border-zinc-300 text-brand-600 focus:ring-brand-500 cursor-pointer w-4 h-4"
                          />
                        </td>
                        <td className="p-4 flex items-center gap-3">
                          <div className="h-12 w-12 rounded-lg bg-white overflow-hidden border border-zinc-200 shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={prod.images?.[0] || 'https://via.placeholder.com/80'} 
                              alt={prod.name} 
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <span className="font-mono text-[10px] font-semibold text-zinc-500 tracking-wider">
                            {prod.sku || 'NO-SKU'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="block font-bold text-zinc-900">{prod.name}</span>
                          <span className="text-[10px] text-zinc-500 line-clamp-1 max-w-[200px] mt-0.5">
                            {prod.description}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-0.5 rounded-full bg-white border border-zinc-200 text-zinc-700 font-medium text-[10px]">
                            {prod.category}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {prod.display_rank && prod.display_rank < 999 ? (
                              <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-brand-50 text-brand-700 border border-brand-200 font-bold text-[10px]">
                                Tier {prod.display_rank}
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-zinc-100 text-zinc-500 font-medium text-[10px]">
                                Standard
                              </span>
                            )}
                            {!searchQuery && (
                              <div className="ml-2 cursor-grab active:cursor-grabbing text-zinc-300 hover:text-brand-600 transition-colors">
                                <GripVertical className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <span className="font-extrabold text-zinc-900">₹{prod.price_inr?.toLocaleString() || '0'}</span>
                          <span className="text-[9px] text-zinc-500 block mt-0.5">${(prod.price_inr * 0.010769).toFixed(2)} USD (Auto)</span>
                          <span className="text-[9px] text-zinc-500 block mt-0.5">£{(prod.price_inr * 0.009579).toFixed(2)} GBP (Auto)</span>
                        </td>
                        <td className="p-4">
                          <span className={`font-bold font-mono text-sm ${prod.stock <= 5 ? 'text-red-400' : 'text-zinc-700'}`}>
                            {prod.stock}
                          </span>
                          <span className="text-[9px] text-zinc-600 block mt-0.5 uppercase tracking-widest font-semibold">
                            {prod.stock === 0 ? 'Out of stock' : prod.stock <= 5 ? 'Critical stock' : 'Units'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleDeleteProductClick(prod.id)}
                              className="p-2 rounded-lg border border-zinc-200 bg-[#FDFBF7] hover:bg-red-950/20 hover:border-red-900/30 text-zinc-500 hover:text-red-400 transition-colors"
                              title="Delete Item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditProductClick(prod)}
                              className="p-2 rounded-lg border border-zinc-200 bg-[#FDFBF7] hover:bg-violet-950/20 hover:border-violet-900/30 text-zinc-700 hover:text-brand-600 transition-colors"
                              title="Edit Details"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: UNIFIED PRODUCT FORM */}
        {activeTab === 'form' && (
          <div className="max-w-3xl mx-auto glass-card border border-zinc-200 p-8 rounded-3xl space-y-6">
            <div className="border-b border-zinc-200/60 pb-4">
              <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                <Database className="h-5 w-5 text-brand-700" />
                {editingProductId ? '✨ Refine Handloom Details' : '📦 Inject Handcrafted Textile to Ledger'}
              </h3>
              <p className="text-zinc-500 text-xs mt-1">
                {editingProductId 
                  ? 'Updating active catalog product. Changes are synced live on database save.' 
                  : 'Add authentic Jaipur print fabric, ethnic wear, or sarees to database catalog.'}
              </p>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., Jaipur Hand-Block Cotton Kurta"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-zinc-100/50 border border-zinc-200 rounded-xl py-2 px-3.5 text-xs text-zinc-900 placeholder-zinc-600 focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 mb-1.5">SKU Reference (Unique ID)</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., IND-JPR-SLUB-001"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    className="w-full bg-zinc-100/50 border border-zinc-200 rounded-xl py-2 px-3.5 text-xs text-zinc-900 placeholder-zinc-600 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-zinc-600">Description</label>
                  <button
                    type="button"
                    onClick={handleAutoGenerateDescription}
                    disabled={isAiGenerating || !formName}
                    className="text-[10px] font-bold bg-gradient-to-r from-amber-200 to-amber-300 hover:from-amber-300 hover:to-amber-400 text-amber-900 px-2.5 py-1 rounded-md transition-all disabled:opacity-50 flex items-center gap-1 shadow-sm"
                  >
                    {isAiGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : '✨'}
                    {isAiGenerating ? 'Writing...' : 'Auto-Write with AI'}
                  </button>
                </div>
                <textarea
                  required
                  rows={3}
                  placeholder="Detail the slub organic weave pattern, indigo dye technique, and comfort metrics..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-zinc-100/50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-xs text-zinc-900 placeholder-zinc-600 focus:outline-none focus:border-violet-500 resize-none"
                />
              </div>

              {(formCulturalContext || formStylingAdvice || formTranslations) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-amber-50/50 border border-amber-200/50 p-4 rounded-2xl">
                  <div className="col-span-1 md:col-span-2">
                    <h3 className="text-xs font-bold text-amber-900 mb-2 flex items-center gap-1.5">
                      ✨ AI-Generated International Context
                    </h3>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Cultural Context</label>
                    <textarea
                      rows={3}
                      value={formCulturalContext}
                      onChange={(e) => setFormCulturalContext(e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-xl py-2 px-3.5 text-xs text-zinc-900 focus:outline-none focus:border-violet-500 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Styling Advice</label>
                    <textarea
                      rows={3}
                      value={formStylingAdvice}
                      onChange={(e) => setFormStylingAdvice(e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-xl py-2 px-3.5 text-xs text-zinc-900 focus:outline-none focus:border-violet-500 resize-none"
                    />
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Translations (JSON)</label>
                    <textarea
                      rows={3}
                      value={formTranslations}
                      onChange={(e) => setFormTranslations(e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-xl py-2 px-3.5 text-xs font-mono text-zinc-900 focus:outline-none focus:border-violet-500 resize-none"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Base Price in INR (₹)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="E.g., 2499"
                    value={formPriceInr}
                    onChange={(e) => setFormPriceInr(e.target.value)}
                    className="w-full bg-zinc-100/50 border border-zinc-200 rounded-xl py-2 px-3.5 text-xs text-zinc-900 focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold text-zinc-600">Category</label>
                    <button
                      type="button"
                      onClick={() => setIsCategoryModalOpen(true)}
                      className="text-[10px] font-semibold text-brand-600 hover:text-violet-300 transition-colors"
                    >
                      + New Category
                    </button>
                  </div>
                  
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl py-2 px-3 text-xs text-zinc-900 focus:outline-none focus:border-violet-500"
                  >
                    {dbCategoryObjects.filter(c => !c.parent_id).map((mainCat) => {
                      const subs = dbCategoryObjects.filter(c => c.parent_id === mainCat.id);
                      return (
                        <React.Fragment key={mainCat.id}>
                          <option value={mainCat.name} className="font-bold">{mainCat.name}</option>
                          {subs.map(subCat => (
                            <option key={subCat.id} value={subCat.name}>
                              &nbsp;&nbsp;&nbsp;↳ {subCat.name}
                            </option>
                          ))}
                        </React.Fragment>
                      );
                    })}
                    {dbCategories.filter(name => !dbCategoryObjects.some(obj => obj.name === name)).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Warehouse Inventory Stock</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full bg-zinc-100/50 border border-zinc-200 rounded-xl py-2 px-3.5 text-xs text-zinc-900 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold text-zinc-600">Product Images</label>
                  <label className="cursor-pointer px-3 py-1.5 bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors">
                    {imageUploadLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <UploadCloud className="h-3 w-3" />}
                    {imageUploadLoading ? 'Uploading & Compressing...' : 'Upload Photos'}
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      disabled={imageUploadLoading}
                      className="hidden" 
                    />
                  </label>
                </div>
                
                {/* Visual Image Preview — Click number to reorder */}
                {formImageUrl.trim() && (() => {
                  const imageList = formImageUrl.split(',').map(u => u.trim()).filter(u => u);

                  const applyMove = (fromIdx: number, rawValue: string) => {
                    const target = parseInt(rawValue, 10);
                    if (isNaN(target) || target < 1 || target > imageList.length || target === fromIdx + 1) {
                      setEditingPosIdx(null);
                      setEditingPosValue('');
                      return;
                    }
                    const toIdx = target - 1; // convert 1-based to 0-based
                    const reordered = [...imageList];
                    const [moved] = reordered.splice(fromIdx, 1);
                    reordered.splice(toIdx, 0, moved);
                    setFormImageUrl(reordered.join(', '));
                    setEditingPosIdx(null);
                    setEditingPosValue('');
                  };

                  return (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-zinc-500">
                          Click the <span className="font-bold text-violet-600">position number</span> on any image to move it
                        </p>
                        <span className="text-[10px] text-zinc-400 font-mono">{imageList.length} image{imageList.length !== 1 ? 's' : ''}</span>
                      </div>

                      <div className="flex flex-wrap gap-3 p-4 bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-xl min-h-[100px] items-start">
                        {imageList.map((url, idx) => (
                          <div key={url + idx} className="relative group flex-shrink-0">
                            {/* Thumbnail */}
                            <div className={`relative h-24 w-24 rounded-xl overflow-hidden border-2 bg-white shadow-sm ${
                              idx === 0 ? 'border-violet-400 shadow-violet-100' : 'border-zinc-200'
                            }`}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={url} alt={`Product image ${idx + 1}`} className="h-full w-full object-cover" />

                              {/* COVER label on first image */}
                              {idx === 0 && (
                                <div className="absolute bottom-0 left-0 right-0 bg-violet-600/90 text-white text-[8px] font-bold text-center py-0.5 flex items-center justify-center gap-0.5">
                                  <Star className="h-2 w-2 fill-current" /> COVER
                                </div>
                              )}

                              {/* Delete button */}
                              <button
                                type="button"
                                onClick={() => {
                                  const newUrls = [...imageList];
                                  newUrls.splice(idx, 1);
                                  setFormImageUrl(newUrls.join(', '));
                                  setEditingPosIdx(null);
                                }}
                                className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-400 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
                              >
                                <X className="h-2.5 w-2.5" />
                              </button>
                            </div>

                            {/* Position badge / input below image */}
                            <div className="mt-1.5 flex justify-center">
                              {editingPosIdx === idx ? (
                                // ── Editable input mode ──
                                <input
                                  type="number"
                                  autoFocus
                                  min={1}
                                  max={imageList.length}
                                  value={editingPosValue}
                                  onChange={(e) => setEditingPosValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') applyMove(idx, editingPosValue);
                                    if (e.key === 'Escape') { setEditingPosIdx(null); setEditingPosValue(''); }
                                  }}
                                  onBlur={() => applyMove(idx, editingPosValue)}
                                  className="w-10 text-center text-xs font-bold bg-violet-600 text-white rounded-lg px-1 py-0.5 border-2 border-violet-400 outline-none focus:ring-2 focus:ring-violet-300"
                                />
                              ) : (
                                // ── Clickable number badge ──
                                <button
                                  type="button"
                                  title={`Click to move image ${idx + 1} to a different position`}
                                  onClick={() => {
                                    setEditingPosIdx(idx);
                                    setEditingPosValue(String(idx + 1));
                                  }}
                                  className={`w-8 h-6 rounded-lg text-[11px] font-bold transition-all ${
                                    idx === 0
                                      ? 'bg-violet-100 text-violet-700 border border-violet-300 cursor-default'
                                      : 'bg-zinc-200 hover:bg-violet-600 hover:text-white text-zinc-700 border border-zinc-300 hover:border-violet-500 cursor-pointer'
                                  }`}
                                >
                                  {idx + 1}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {editingPosIdx !== null && (
                        <p className="text-[10px] text-violet-500 font-medium">
                          Type a position (1–{imageList.length}) and press <kbd className="bg-zinc-100 border border-zinc-300 rounded px-1">Enter</kbd>
                        </p>
                      )}
                    </div>
                  );
                })()}


                
                <input
                  type="text"
                  placeholder="Or paste URLs separated by commas..."
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  className="w-full bg-zinc-100/50 border border-zinc-200 rounded-xl py-2 px-3.5 text-xs text-zinc-900 placeholder-zinc-600 focus:outline-none focus:border-violet-500 font-mono"
                />
              </div>

              {/* Craftsmanship Details (Geographic Tags) */}
              <div className="border-t border-zinc-200 pt-4 space-y-4">
                <h4 className="text-xs font-bold text-brand-600 uppercase tracking-widest">✨ Geographic Craft Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Fabric & Material</label>
                    <input
                      type="text"
                      placeholder="E.g., 100% Organic Slub Cotton"
                      value={formMaterial}
                      onChange={(e) => setFormMaterial(e.target.value)}
                      className="w-full bg-zinc-100/50 border border-zinc-200 rounded-xl py-2 px-3.5 text-xs text-zinc-900 placeholder-zinc-600 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Weaving Region / Origin</label>
                    <input
                      type="text"
                      placeholder="E.g., Jaipur, India"
                      value={formOrigin}
                      onChange={(e) => setFormOrigin(e.target.value)}
                      className="w-full bg-zinc-100/50 border border-zinc-200 rounded-xl py-2 px-3.5 text-xs text-zinc-900 placeholder-zinc-600 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Care Instructions</label>
                    <input
                      type="text"
                      list="care-options"
                      placeholder="E.g., Dry Clean Only / Cold Wash"
                      value={formCare}
                      onChange={(e) => setFormCare(e.target.value)}
                      className="w-full bg-zinc-100/50 border border-zinc-200 rounded-xl py-2 px-3.5 text-xs text-zinc-900 placeholder-zinc-600 focus:outline-none focus:border-violet-500"
                    />
                    <datalist id="care-options">
                      <option value="Machine wash" />
                      <option value="Hand wash only" />
                      <option value="Dry clean only" />
                      <option value="Cold wash" />
                      <option value="Do not bleach" />
                    </datalist>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-zinc-600">Video URL (Optional)</label>
                      <label className="cursor-pointer text-[10px] font-bold bg-violet-100 text-violet-700 hover:bg-violet-200 px-2 py-1 rounded-md transition-colors flex items-center gap-1">
                        {videoUploadLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <UploadCloud className="h-3 w-3" />}
                        {videoUploadLoading ? 'Uploading...' : 'Upload Video'}
                        <input 
                          type="file" 
                          accept="video/mp4,video/quicktime,video/webm" 
                          onChange={handleVideoUpload} 
                          disabled={videoUploadLoading}
                          className="hidden" 
                        />
                      </label>
                    </div>
                    <input
                      type="url"
                      placeholder="E.g., YouTube or direct MP4 link"
                      value={formVideoUrl}
                      onChange={(e) => setFormVideoUrl(e.target.value)}
                      className="w-full bg-zinc-100/50 border border-zinc-200 rounded-xl py-2 px-3.5 text-xs text-zinc-900 placeholder-zinc-600 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>
              </div>

              {/* Is Featured & Rank */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-1.5 uppercase tracking-widest">New Arrival</label>
                  <label className="flex items-center gap-3 p-3 border border-zinc-200 rounded-xl bg-zinc-100/30 cursor-pointer hover:bg-zinc-100/50 transition-colors h-11">
                    <input 
                      type="checkbox" 
                      checked={formIsFeatured}
                      onChange={(e) => setFormIsFeatured(e.target.checked)}
                      className="w-4 h-4 rounded border-zinc-300 text-brand-700 focus:ring-gold bg-[#FDFBF7]"
                    />
                    <div>
                      <span className="block text-xs font-bold text-zinc-900 uppercase tracking-widest">Mark as Featured</span>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-1.5 uppercase tracking-widest">Display Rank (1 = Best)</label>
                  <input 
                    type="number"
                    value={formDisplayRank}
                    onChange={(e) => setFormDisplayRank(e.target.value)}
                    placeholder="e.g. 1, 2, 3..."
                    className="w-full bg-[#FDFBF7] border border-zinc-200 rounded-xl py-3 px-3.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-brand-500 shadow-sm"
                  />
                </div>
              </div>

              {/* Form Action Controls */}
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200">
                {editingProductId && (
                  <button
                    type="button"
                    onClick={() => { resetProductForm(); setActiveTab('catalog'); }}
                    className="px-4 py-2 border border-zinc-200 hover:border-zinc-300 bg-[#FDFBF7] rounded-xl text-xs font-bold text-zinc-600 hover:text-zinc-900 transition-colors"
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-lg hover:shadow-violet-600/10 transition-all disabled:opacity-50"
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {editingProductId ? 'Update Product Details' : 'Inject Product to Ledger'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 4: MANAGE CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
            {/* Create Category Section */}
            <div className="glass-card border border-zinc-200 p-8 rounded-3xl space-y-6">
              <div className="border-b border-zinc-200/60 pb-4">
                <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                  <Tag className="h-5 w-5 text-brand-700" />
                  Generate New Category
                </h3>
                <p className="text-zinc-500 text-xs mt-1">
                  Add custom artisanal product categories to your database.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  placeholder="E.g., Indigo Blockprint, Banarasi Sarees..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 bg-zinc-100/50 border border-zinc-200 rounded-xl py-2.5 px-4 text-xs text-zinc-900 placeholder-zinc-600 focus:outline-none focus:border-violet-500"
                />
                <select
                  value={newCategoryParentId}
                  onChange={(e) => setNewCategoryParentId(e.target.value)}
                  className="bg-zinc-100/50 border border-zinc-200 rounded-xl py-2.5 px-4 text-xs text-zinc-900 focus:outline-none focus:border-violet-500 min-w-[200px]"
                >
                  <option value="">No Parent (Main Category)</option>
                  {dbCategoryObjects.filter(c => !c.parent_id).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={actionLoading}
                  className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shrink-0"
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Create Category
                </button>
              </div>
            </div>

            {/* List Categories Section */}
            <div className="glass-card rounded-3xl border border-zinc-200 overflow-hidden">
              <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
                <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                  <Database className="h-4 w-4 text-brand-700" /> Active Category Inventory
                </h3>
                <span className="text-[10px] bg-white text-zinc-600 border border-zinc-200 px-3 py-1 rounded-full font-mono">
                  {dbCategories.length} Categories
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#FDFBF7]/50 border-b border-zinc-200 text-zinc-600 font-medium">
                      <th className="p-4">Category Name</th>
                      <th className="p-4">Slug Reference</th>
                      <th className="p-4">Assigned Products</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/60 text-zinc-700">
                    {dbCategoryObjects.map((catObj) => {
                      const count = products.filter((p) => p.category === catObj.name).length;
                      const catSlug = catObj.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                      const parentObj = catObj.parent_id ? dbCategoryObjects.find(c => c.id === catObj.parent_id) : null;
                      return (
                        <tr key={catObj.id} className="hover:bg-white/10 transition-colors">
                          <td className="p-4">
                            <span className="font-bold text-zinc-900 block">{catObj.name}</span>
                            {parentObj && <span className="text-[10px] text-zinc-500 uppercase tracking-wider">↳ Sub of {parentObj.name}</span>}
                          </td>
                          <td className="p-4 font-mono text-[10px] text-zinc-500">{catSlug}</td>
                          <td className="p-4">
                            <span className={`font-semibold ${count === 0 ? 'text-zinc-600' : 'text-brand-600'}`}>
                              {count} {count === 1 ? 'product' : 'products'}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleMoveCategory(catObj, 'up')}
                                disabled={actionLoading}
                                className="p-2 rounded-lg border border-zinc-200 bg-[#FDFBF7] hover:bg-violet-950/20 hover:border-violet-900/30 text-zinc-500 hover:text-brand-600 transition-colors disabled:opacity-50"
                                title="Move Up"
                              >
                                <ChevronUp className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleMoveCategory(catObj, 'down')}
                                disabled={actionLoading}
                                className="p-2 rounded-lg border border-zinc-200 bg-[#FDFBF7] hover:bg-violet-950/20 hover:border-violet-900/30 text-zinc-500 hover:text-brand-600 transition-colors disabled:opacity-50"
                                title="Move Down"
                              >
                                <ChevronDown className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(catObj.name)}
                                disabled={actionLoading}
                                className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-[#FDFBF7] hover:bg-red-950/20 hover:border-red-900/30 text-red-400/80 hover:text-red-400 transition-colors text-[11px] font-medium disabled:opacity-50"
                              >
                                Delete Category
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: BLOGS */}
        {activeTab === 'blogs' && (
          <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
            {/* Form to create/edit Blog */}
            {isBlogFormOpen ? (
              <div className="glass-card border border-zinc-200 p-8 rounded-3xl space-y-6">
                <div className="border-b border-zinc-200/60 pb-4">
                  <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-brand-700" />
                    {editingBlogId ? '✨ Edit Blog Post' : '📝 Write New Blog Post'}
                  </h3>
                </div>
                <form onSubmit={handleBlogSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Title</label>
                      <input
                        type="text"
                        required
                        value={formBlogTitle}
                        onChange={(e) => setFormBlogTitle(e.target.value)}
                        className="w-full bg-zinc-100/50 border border-zinc-200 rounded-xl py-2 px-3.5 text-xs text-zinc-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Slug</label>
                      <input
                        type="text"
                        required
                        value={formBlogSlug}
                        onChange={(e) => setFormBlogSlug(e.target.value)}
                        className="w-full bg-zinc-100/50 border border-zinc-200 rounded-xl py-2 px-3.5 text-xs text-zinc-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Excerpt (Short Description)</label>
                    <textarea
                      required
                      rows={2}
                      value={formBlogExcerpt}
                      onChange={(e) => setFormBlogExcerpt(e.target.value)}
                      className="w-full bg-zinc-100/50 border border-zinc-200 rounded-xl py-2 px-3.5 text-xs text-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Content (Markdown / HTML / Text)</label>
                    <textarea
                      required
                      rows={10}
                      value={formBlogContent}
                      onChange={(e) => setFormBlogContent(e.target.value)}
                      className="w-full bg-zinc-100/50 border border-zinc-200 rounded-xl py-2 px-3.5 text-xs text-zinc-900 font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Image URL</label>
                      <input
                        type="text"
                        value={formBlogImageUrl}
                        onChange={(e) => setFormBlogImageUrl(e.target.value)}
                        className="w-full bg-zinc-100/50 border border-zinc-200 rounded-xl py-2 px-3.5 text-xs text-zinc-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Status</label>
                      <select
                        value={formBlogStatus}
                        onChange={(e) => setFormBlogStatus(e.target.value)}
                        className="w-full bg-white border border-zinc-200 rounded-xl py-2 px-3 text-xs text-zinc-900"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200">
                    <button
                      type="button"
                      onClick={() => setIsBlogFormOpen(false)}
                      className="px-4 py-2 border border-zinc-200 bg-[#FDFBF7] rounded-xl text-xs font-bold text-zinc-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-lg disabled:opacity-50"
                    >
                      {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save Blog Post
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="glass-card rounded-3xl border border-zinc-200 overflow-hidden">
                <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
                  <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-brand-700" /> Blog Articles
                  </h3>
                  <button
                    onClick={() => { resetBlogForm(); setIsBlogFormOpen(true); }}
                    className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-500 rounded-xl text-xs font-bold text-white flex items-center gap-1.5"
                  >
                    <Plus className="h-4 w-4" /> New Post
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#FDFBF7]/50 border-b border-zinc-200 text-zinc-600 font-medium">
                        <th className="p-4">Title & Slug</th>
                        <th className="p-4">Excerpt</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/60">
                      {blogs.map((blog) => (
                        <tr key={blog.id} className="hover:bg-white/10">
                          <td className="p-4">
                            <span className="block font-bold text-zinc-900">{blog.title}</span>
                            <span className="text-[10px] text-zinc-500">/{blog.slug}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-zinc-600 line-clamp-1 max-w-[200px]">{blog.excerpt}</span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${blog.status === 'published' ? 'bg-emerald-950/30 text-emerald-400' : 'bg-amber-950/30 text-amber-400'}`}>
                              {blog.status}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => handleDeleteBlog(blog.id)} className="p-2 rounded-lg text-zinc-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                              <button onClick={() => handleEditBlogClick(blog)} className="p-2 rounded-lg text-zinc-700 hover:text-brand-600"><Edit className="h-4 w-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {blogs.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-10 text-center text-zinc-500">
                            No blog posts found. Create one to get started.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: COUPONS */}
        {activeTab === 'coupons' && (
          <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-serif font-bold text-zinc-900">Manage Coupons</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="bg-white rounded-3xl border border-zinc-200 p-6">
                  <h3 className="text-lg font-serif font-bold text-zinc-900 mb-6">Create New Coupon</h3>
                  <form onSubmit={handleCreateCoupon} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1.5">Coupon Code</label>
                      <input
                        type="text"
                        value={formCouponCode}
                        onChange={(e) => setFormCouponCode(e.target.value.toUpperCase())}
                        placeholder="e.g. DIWALI20"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1.5">Discount Type</label>
                      <select
                        value={formCouponType}
                        onChange={(e) => setFormCouponType(e.target.value as 'percent' | 'fixed')}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="percent">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (₹)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1.5">Discount Value</label>
                      <input
                        type="number"
                        value={formCouponValue}
                        onChange={(e) => setFormCouponValue(e.target.value)}
                        placeholder={formCouponType === 'percent' ? "e.g. 20" : "e.g. 500"}
                        min="1"
                        step="0.01"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-lg px-4 py-2.5 text-sm font-bold transition-colors mt-4 flex justify-center items-center gap-2"
                    >
                      <Plus className="h-4 w-4" /> Create Coupon
                    </button>
                  </form>
                </div>
              </div>
              <div className="lg:col-span-2">
                <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-200">
                        <th className="px-6 py-3 text-[10px] uppercase tracking-wider font-bold text-zinc-500">Code</th>
                        <th className="px-6 py-3 text-[10px] uppercase tracking-wider font-bold text-zinc-500">Type</th>
                        <th className="px-6 py-3 text-[10px] uppercase tracking-wider font-bold text-zinc-500">Value</th>
                        <th className="px-6 py-3 text-[10px] uppercase tracking-wider font-bold text-zinc-500 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {coupons.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-zinc-500 text-sm">
                            No active coupons. Create one to get started.
                          </td>
                        </tr>
                      ) : (
                        coupons.map((coupon) => (
                          <tr key={coupon.id} className="hover:bg-zinc-50/50">
                            <td className="px-6 py-4">
                              <span className="inline-block px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-mono font-bold rounded">
                                {coupon.code}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-medium text-zinc-700 capitalize">
                                {coupon.type}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-bold text-zinc-900">
                                {coupon.type === 'percent' ? `${coupon.value}%` : `₹${coupon.value}`}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleDeleteCoupon(coupon.id)}
                                className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                                title="Delete Coupon"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inquiries' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-zinc-200">
              <div>
                <h2 className="text-2xl font-serif text-zinc-900 font-bold mb-1">Product Inquiries</h2>
                <p className="text-zinc-500 text-sm">View and manage customer questions about products.</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200">
                    <th className="px-6 py-3 text-[10px] uppercase tracking-wider font-bold text-zinc-500">Date</th>
                    <th className="px-6 py-3 text-[10px] uppercase tracking-wider font-bold text-zinc-500">Product</th>
                    <th className="px-6 py-3 text-[10px] uppercase tracking-wider font-bold text-zinc-500">Customer</th>
                    <th className="px-6 py-3 text-[10px] uppercase tracking-wider font-bold text-zinc-500">Question</th>
                    <th className="px-6 py-3 text-[10px] uppercase tracking-wider font-bold text-zinc-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {inquiries.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-zinc-500 text-sm">
                        No product inquiries found.
                      </td>
                    </tr>
                  ) : (
                    inquiries.map((inquiry) => (
                      <tr key={inquiry.id} className="hover:bg-zinc-50/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                          {new Date(inquiry.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-900 font-medium">
                          {inquiry.products?.name || 'Unknown Product'}
                          <div className="text-xs text-zinc-400 font-mono mt-0.5">{inquiry.products?.sku}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-900">
                          <a href={`mailto:${inquiry.customer_email}?subject=Reply to your inquiry regarding ${inquiry.products?.name}`} className="text-brand-600 hover:underline">
                            {inquiry.customer_email}
                          </a>
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-700 max-w-md">
                          <p className="line-clamp-3">{inquiry.question}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {inquiry.status === 'replied' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Replied
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                Pending
                              </span>
                              <button
                                onClick={() => handleMarkInquiryReplied(inquiry.id)}
                                className="text-xs text-brand-600 hover:text-brand-800 font-semibold"
                              >
                                Mark Replied
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 8: BEHIND THE SCENES */}
        {activeTab === 'behind_the_scenes' && (
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-3xl border border-zinc-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold flex items-center gap-2 text-zinc-900">
                  {editingBtsId ? <Edit className="h-4 w-4 text-emerald-600" /> : <UploadCloud className="h-4 w-4 text-emerald-600" />} 
                  {editingBtsId ? 'Edit Moment' : 'Add New Moment'}
                </h3>
                {editingBtsId && (
                  <button onClick={handleBtsCancelEdit} className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1">
                    <X className="h-3 w-3" /> Cancel Edit
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-zinc-600">Title</label>
                  <input
                    type="text"
                    value={btsTitle}
                    onChange={(e) => setBtsTitle(e.target.value)}
                    placeholder="e.g. Block Printing in Jaipur"
                    className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-zinc-600">Description (Optional)</label>
                  <input
                    type="text"
                    value={btsDescription}
                    onChange={(e) => setBtsDescription(e.target.value)}
                    placeholder="Brief details about this moment..."
                    className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-zinc-600">
                  {editingBtsId ? 'Upload new Photo/Video to replace (optional)' : 'Upload Photo or Video (Max 50MB)'}
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setBtsFile(e.target.files[0]);
                      }
                    }}
                    disabled={btsUploadLoading || actionLoading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                  />
                  <div className={`w-full border-2 border-dashed border-emerald-200 bg-emerald-50/50 rounded-2xl p-6 text-center transition-colors ${(btsUploadLoading || btsFile) ? 'opacity-50' : 'hover:bg-emerald-50'}`}>
                    {btsFile ? (
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle className="h-6 w-6 text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-700">{btsFile.name} selected</span>
                        <span className="text-[10px] text-zinc-500">{(btsFile.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <UploadCloud className="h-6 w-6 text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-700">Click or drag file here</span>
                        <span className="text-[10px] text-zinc-500">Supports JPG, PNG, WEBP, MP4, MOV</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <button 
                onClick={handleBtsPublish}
                disabled={(!editingBtsId && !btsFile) || btsUploadLoading}
                className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {btsUploadLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> {btsUploadProgress > 0 ? `Compressing Video (${btsUploadProgress}%)...` : (editingBtsId ? 'Updating Moment...' : 'Publishing Moment...')}
                  </>
                ) : (
                  <>
                    {editingBtsId ? <Edit className="h-4 w-4" /> : <UploadCloud className="h-4 w-4" />} 
                    {editingBtsId ? 'Update Moment' : 'Publish Moment'}
                  </>
                )}
              </button>
            </div>

            <div className="glass-card p-6 rounded-3xl border border-zinc-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold flex items-center gap-2 text-zinc-900">
                  <Video className="h-4 w-4 text-emerald-600" /> Published Moments
                </h3>
                <button
                  onClick={handleBtsShuffle}
                  disabled={actionLoading || behindTheScenesItems.length < 2}
                  className="text-xs px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <RefreshCcw className="h-3 w-3" /> Shuffle
                </button>
              </div>
              {behindTheScenesItems.length === 0 ? (
                <div className="text-center py-12 border border-zinc-200 border-dashed rounded-2xl bg-white/50">
                  <Video className="h-8 w-8 mx-auto text-zinc-300 mb-2" />
                  <p className="text-sm font-semibold text-zinc-600">No moments uploaded yet</p>
                  <p className="text-xs text-zinc-500">Upload your first photo or video above.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {behindTheScenesItems.map((item) => (
                    <div key={item.id} className="relative group rounded-xl overflow-hidden border border-zinc-200 bg-white shadow-sm">
                      <div className="aspect-[4/5] bg-zinc-100 relative">
                        {item.media_url?.toLowerCase().includes('.mp4') || item.media_url?.toLowerCase().includes('.mov') ? (
                          <video src={item.media_url} className="w-full h-full object-cover" muted loop autoPlay playsInline controls />
                        ) : (
                          <img src={item.media_url} alt={item.title} className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <div className="absolute top-2 right-2 flex gap-2 pointer-events-auto">
                            <button
                              onClick={() => handleBtsEditClick(item)}
                              disabled={actionLoading}
                              className="p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleBtsDelete(item.id)}
                              disabled={actionLoading}
                              className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <p className="text-xs font-bold text-white truncate">{item.title}</p>
                            {item.description && <p className="text-[10px] text-white/80 line-clamp-2 mt-0.5">{item.description}</p>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
      {/* TRACKING AND SHIPMENT EDIT MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl glass-card p-8 border border-zinc-200 glow-border max-h-[85vh] flex flex-col">
            
            {/* Close Button */}
            <button 
              onClick={() => setSelectedOrder(null)}
              className="absolute right-5 top-5 text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            {/* Modal Header */}
            <div className="mb-6 border-b border-zinc-200/60 pb-4">
              <h2 className="text-lg font-black tracking-tight">UPS Shipping Fulfillments</h2>
              <p className="text-zinc-500 text-[10px] mt-0.5">Assign courier dispatch parameters for order direct export.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdateShipmentSubmit} className="space-y-6 overflow-y-auto pr-1">
              
              {/* Order Info */}
              <div className="rounded-2xl border border-zinc-200 bg-zinc-100/30 p-4 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Invoice Target:</span>
                  <span className="text-zinc-900 font-bold">{selectedOrder.shipping_addresses?.full_name || 'N/A'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-zinc-500">Destination Address:</span>
                  <div className="text-zinc-700 font-semibold bg-white p-2 rounded border border-zinc-200">
                    <p>{selectedOrder.shipping_addresses?.full_name}</p>
                    {selectedOrder.shipping_addresses?.address_line1 && <p>{selectedOrder.shipping_addresses.address_line1}</p>}
                    {selectedOrder.shipping_addresses?.address_line2 && <p>{selectedOrder.shipping_addresses.address_line2}</p>}
                    <p>
                      {selectedOrder.shipping_addresses?.city}{selectedOrder.shipping_addresses?.state ? `, ${selectedOrder.shipping_addresses.state}` : ''} {selectedOrder.shipping_addresses?.postal_code}
                    </p>
                    <p>{selectedOrder.shipping_addresses?.country}</p>
                    {selectedOrder.shipping_addresses?.phone && <p className="mt-1">Phone: {selectedOrder.shipping_addresses.phone}</p>}
                  </div>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-zinc-500">Tracking Reference:</span>
                  <span className="text-brand-600 font-bold truncate max-w-[150px]">{selectedOrder.id}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Garment Line Items</label>
                <div className="space-y-2 max-h-32 overflow-y-auto bg-white/10 border border-zinc-200 p-2.5 rounded-xl">
                  {selectedOrder.order_items?.map((item) => (
                    <div key={item.id} className="flex flex-col gap-1 text-xs py-1.5 border-b border-zinc-200 last:border-b-0">
                      <div className="flex justify-between w-full">
                        <span className="text-zinc-800 font-semibold truncate max-w-[250px]">
                          {item.products?.name || 'Handloom Garment'} 
                        </span>
                        <span className="text-zinc-600 font-bold ml-2">x{item.quantity}</span>
                      </div>
                      <span className="text-[9px] text-zinc-400 font-mono tracking-widest break-all">ID: {item.product_id}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tracking input */}
              <div className="space-y-4 border-t border-zinc-200 pt-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Tracking Number</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., JD1234567890"
                    value={trackingNumberInput}
                    onChange={(e) => setTrackingNumberInput(e.target.value)}
                    className="w-full bg-zinc-100/50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-xs text-zinc-900 placeholder-zinc-600 focus:outline-none focus:border-violet-500 font-mono"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Shipping Carrier</label>
                  <select
                    value={shippingProviderInput}
                    onChange={(e) => setShippingProviderInput(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl py-2.5 px-3 text-xs text-zinc-900 focus:outline-none focus:border-violet-500"
                  >
                    <option value="ups">UPS</option>
                    <option value="dhl">DHL Express</option>
                    <option value="dpd">DPD</option>
                    <option value="shipglobal">ShipGlobal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Shipping Transit State</label>
                  <select
                    value={shipmentStatusInput}
                    onChange={(e) => setShipmentStatusInput(e.target.value as 'pending' | 'shipped' | 'delivered')}
                    className="w-full bg-white border border-zinc-200 rounded-xl py-2.5 px-3 text-xs text-zinc-900 focus:outline-none focus:border-violet-500"
                  >
                    <option value="pending">Pending Dispatch</option>
                    <option value="shipped">Shipped (In Transit)</option>
                    <option value="delivered">Delivered Successfully</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 border border-zinc-200 bg-[#FDFBF7] rounded-xl text-xs font-bold text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 rounded-xl text-xs font-bold text-zinc-900 flex items-center gap-1.5 shadow-lg transition-all"
                >
                  {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Tracking Ref
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY QUICK-CREATE MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl glass-card p-8 border border-zinc-200 glow-border">
            
            {/* Close Button */}
            <button 
              onClick={() => setIsCategoryModalOpen(false)}
              className="absolute right-5 top-5 text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            {/* Modal Header */}
            <div className="mb-6 border-b border-zinc-200/60 pb-4">
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                <Tag className="h-5 w-5 text-brand-700" />
                Add New Category
              </h2>
              <p className="text-zinc-500 text-[10px] mt-0.5">Inject a new artisanal textile or apparel category into the ledger.</p>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Indigo Blockprint"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full bg-zinc-100/50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-xs text-zinc-900 placeholder-zinc-600 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 border border-zinc-200 bg-[#FDFBF7] rounded-xl text-xs font-bold text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={actionLoading}
                  className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 rounded-xl text-xs font-bold text-zinc-900 flex items-center gap-1.5 shadow-lg transition-all"
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
