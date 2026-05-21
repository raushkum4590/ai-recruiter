'use client';

import { useUser } from '@/app/provider';
import { supabase } from '@/services/superbaseClient';
import { LogOut, User } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user } = useUser();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
    router.push('/auth');
  };

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <User className="w-5 h-5" /> Profile
        </h2>
        <div className="flex items-center gap-4">
          {user?.picture ? (
            <Image
              src={user.picture}
              alt={user.name || 'User'}
              width={64}
              height={64}
              className="rounded-full"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
              {user?.name?.[0]?.toUpperCase() || '?'}
            </div>
          )}
          <div>
            <p className="text-lg font-semibold text-gray-900">{user?.name || '—'}</p>
            <p className="text-sm text-gray-500">{user?.email || '—'}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Account</h2>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-medium"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
