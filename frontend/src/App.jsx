import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useStore } from './store/useStore';
import LoadingSpinner from './components/LoadingSpinner';

// ── Eagerly loaded (critical path, no lazy) ──
import WhatsAppButton from './components/WhatsAppButton';

// ── Lazy-loaded pages (code-split per route) ──
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const ProductListing = lazy(() => import('./pages/ProductListing'));
const CollectionPage = lazy(() => import('./pages/CollectionPage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const OrderTracking = lazy(() => import('./pages/OrderTracking'));
const BlogIndex = lazy(() => import('./pages/BlogIndex'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const WholesalePage = lazy(() => import('./pages/WholesalePage'));

// ── Admin Pages (lazy-loaded — heavy, only needed for admins) ──
const ProtectedAdminRoute = lazy(() => import('./components/ProtectedAdminRoute'));
const AdminLayout = lazy(() => import('./admin/layouts/AdminLayout'));
const AdminDashboard = lazy(() => import('./admin/pages/AdminDashboard'));
const ProductsAdmin = lazy(() => import('./admin/pages/ProductsAdmin'));
const AddEditProduct = lazy(() => import('./admin/pages/AddEditProduct'));
const OrdersAdmin = lazy(() => import('./admin/pages/OrdersAdmin'));
const BlogAdmin = lazy(() => import('./admin/pages/BlogAdmin'));
const BannersAdmin = lazy(() => import('./admin/pages/BannersAdmin'));
const CategoriesAdmin = lazy(() => import('./admin/pages/CategoriesAdmin'));
const SettingsAdmin = lazy(() => import('./admin/pages/SettingsAdmin'));
const CouponsAdmin = lazy(() => import('./admin/pages/CouponsAdmin'));
const CustomersAdmin = lazy(() => import('./admin/pages/CustomersAdmin'));
const InquiriesAdmin = lazy(() => import('./admin/pages/InquiriesAdmin'));

// ── Protected route (keep non-lazy so it loads fast) ──
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { initAuth } = useStore();
  useEffect(() => {
    initAuth();
  }, []);

  return (
    <Router>
      {/* Global WhatsApp Floating Button */}
      <WhatsAppButton />
      <Suspense fallback={<LoadingSpinner message="Loading page..." />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/update-password" element={<ResetPassword />} />
          <Route path="/shop" element={<ProductListing />} />
          <Route path="/collection/:slug" element={<CollectionPage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/orders" element={<OrderTracking />} />
          <Route path="/blog" element={<BlogIndex />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/wholesale" element={<WholesalePage />} />
          <Route path="/track-order" element={<OrderTracking />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedAdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<ProductsAdmin />} />
              <Route path="products/new" element={<AddEditProduct />} />
              <Route path="products/:id" element={<AddEditProduct />} />
              <Route path="orders" element={<OrdersAdmin />} />
              <Route path="blog" element={<BlogAdmin />} />
              <Route path="banners" element={<BannersAdmin />} />
              <Route path="categories" element={<CategoriesAdmin />} />
              <Route path="settings" element={<SettingsAdmin />} />
              <Route path="coupons" element={<CouponsAdmin />} />
              <Route path="customers" element={<CustomersAdmin />} />
              <Route path="inquiries" element={<InquiriesAdmin />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
