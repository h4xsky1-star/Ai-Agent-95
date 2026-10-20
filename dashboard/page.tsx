'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Sparkles, LogOut, Settings, Plus, LayoutDashboard, PenSquare } from 'lucide-react';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Sparkles className="w-12 h-12 mx-auto text-blue-500 animate-pulse" />
          <p className="mt-3 text-gray-600">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-white border-r border-gray-100 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">MarketAI</h2>
            <p className="text-xs text-gray-500">Marketing Agent</p>
          </div>
        </div>

        <nav className="space-y-1 flex-1">
          <a href="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl font-medium">
            <LayoutDashboard className="w-5 h-5" /> ড্যাশবোর্ড
          </a>
          <a href="/generate" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition">
            <PenSquare className="w-5 h-5" /> নতুন পোস্ট
          </a>
          <a href="/settings" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition">
            <Settings className="w-5 h-5" /> সেটিংস
          </a>
        </nav>

        <div className="pt-6 border-t">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user.email?.[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
              <p className="text-xs text-gray-500">Free Plan</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition">
            <LogOut className="w-4 h-4" /> লগআউট
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-72 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">স্বাগতম!</h1>
            <p className="text-gray-600 mt-1">আজকে কী মার্কেটিং করবে?</p>
          </div>
          <a
            href="/generate"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-md shadow-blue-200 transition"
          >
            <Plus className="w-5 h-5" /> নতুন পোস্ট
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'মোট পোস্ট', value: '0', color: 'text-gray-900' },
            { label: 'প্রকাশিত', value: '0', color: 'text-green-600' },
            { label: 'ড্রাফট', value: '0', color: 'text-amber-600' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">এখনও কোনো পোস্ট নেই</h3>
          <p className="text-gray-500 mb-6">প্রথম পোস্ট তৈরি করে শুরু করো</p>
          <a href="/generate" className="inline-flex items-center gap-2 text-blue-600 font-medium hover:underline">
            পোস্ট তৈরি করো →
          </a>
        </div>
      </main>
    </div>
  );
}
