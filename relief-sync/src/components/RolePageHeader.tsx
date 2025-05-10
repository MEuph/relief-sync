'use client';

import { useAuth } from './useAuth';
import { useRouter } from 'next/navigation';

export default function RolePageHeader() {
  const { creds, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/sign-in');
  };

  return (
    <div className="w-full flex justify-between items-center mb-6">
      <div className="text-white text-sm">
        Logged in as <strong>{creds?.username}</strong> ({creds?.role})
      </div>
      <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded">
        Log Out
      </button>
    </div>
  );
}
