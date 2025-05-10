'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/useAuth';

export default function Home() {
  const { creds, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!creds) {
      router.replace('/sign-in');
    } else {
      switch (creds.role) {
        case 'Administrator':
          router.replace('/admin');
          break;
        case 'Inventory Manager':
          router.replace('/inventory');
          break;
        case 'Field Coordinator':
          router.replace('/field');
          break;
        case 'Donor or Supplier':
          router.replace('/donate-supply');
          break;
        case 'Government or NGO':
          router.replace('/monitor');
          break;
        default:
          router.replace('/sign-in');
      }
    }
  }, [creds, loading]);

  return (
    <main className="flex items-center justify-center h-screen text-white">
      <div className="animate-spin h-10 w-10 border-4 border-white border-t-transparent rounded-full"></div>
      <span className="ml-4 text-lg">Redirecting...</span>
    </main>
  );
}
