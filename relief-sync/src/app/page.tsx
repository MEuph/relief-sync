'use client';

import './globals.css';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/useAuth';

export default function Home() {
  const { creds, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Wait for hydration
    if (creds) {
      router.replace('/test-queries');
    } else {
      router.replace('/sign-in');
    }
  }, [creds, loading]);

  if (loading) {
    return (
      <main className="flex items-center justify-center h-screen bg-black text-white">
        <div className="animate-spin h-10 w-10 border-4 border-white border-t-transparent rounded-full"></div>
        <span className="ml-4 text-lg">Loading...</span>
      </main>
    );
  }

  return null;
}