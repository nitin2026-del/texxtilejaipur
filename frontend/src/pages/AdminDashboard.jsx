import React from 'react';
import useStore from '../store/useStore';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { user, logout } = useStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <section className="p-8 min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Logged in as: {user?.email}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Manage Products</h2>
            <p className="text-gray-600 mb-4">Add, update, or remove products from the store.</p>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded w-full">Products</button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Orders</h2>
            <p className="text-gray-600 mb-4">View and manage customer orders.</p>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded w-full">View Orders</button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Customers</h2>
            <p className="text-gray-600 mb-4">Manage users and roles.</p>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded w-full">View Customers</button>
          </div>
        </div>
      </div>
    </section>
  );
}
