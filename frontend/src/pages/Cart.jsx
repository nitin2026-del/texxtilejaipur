import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import MainLayout from '../layouts/MainLayout';
import { TrashIcon, ShoppingBagIcon, ArrowRightIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function Cart() {
  const navigate = useNavigate();
  const { items, removeItem, addItem, updateQuantity, totalQuantity, totalPrice } = useStore();

  if (items.length === 0) {
    return (
      <MainLayout title="Your Cart - Gupta International" description="View your shopping cart.">
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
          <ShoppingBagIcon className="w-24 h-24 text-gray-200 dark:text-gray-800 mb-6" />
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">Your Cart is Empty</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8 text-center max-w-md">
            Looks like you haven't added anything to your cart yet. Discover our latest collections and find your new style.
          </p>
          <Link to="/shop" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-full transition-colors shadow-lg shadow-indigo-200 dark:shadow-none inline-flex items-center gap-2">
            Start Shopping <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Your Cart - Gupta International" description="View your shopping cart.">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-12 text-center md:text-left">Shopping Bag</h1>
        
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Cart Items */}
          <div className="flex-1 space-y-6">
            {items.map((item) => (
              <div key={item.id} className="flex gap-6 p-6 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="w-32 h-40 shrink-0 bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden">
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">{item.name}</h3>
                      <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 p-1 transition-colors">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Premium Collection</p>
                  </div>
                  
                  <div className="flex items-end justify-between mt-4">
                    <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800">
                      <button className="p-2 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" onClick={() => updateQuantity(item.id, -1)}>
                        <MinusIcon className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-medium text-gray-900 dark:text-white text-sm">{item.quantity}</span>
                      <button className="p-2 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" onClick={() => updateQuantity(item.id, 1)}>
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-96 shrink-0">
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-3xl p-8 sticky top-32">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Order Summary</h2>
              
              <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal ({totalQuantity()} items)</span>
                  <span className="font-medium text-gray-900 dark:text-white">${totalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-medium text-gray-900 dark:text-white">Calculated at checkout</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span className="font-medium text-gray-900 dark:text-white">Calculated at checkout</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-gray-900 dark:text-white">Estimated Total</span>
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">${totalPrice().toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-4 bg-gray-900 dark:bg-indigo-600 hover:bg-gray-800 dark:hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-lg dark:shadow-none flex justify-center items-center gap-2"
              >
                Checkout Now <ArrowRightIcon className="w-5 h-5" />
              </button>
              
              <div className="mt-6 flex justify-center items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                 <ShoppingBagIcon className="w-4 h-4" /> Secure Checkout 
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </MainLayout>
  );
}
