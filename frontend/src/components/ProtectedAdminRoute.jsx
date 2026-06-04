import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function ProtectedAdminRoute() {
  const { auth, loading } = useStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If not logged in, redirect to login
  if (!auth?.user) {
    return <Navigate to="/login" replace />;
  }

  // If logged in but not admin, redirect to home
  if (auth.profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
