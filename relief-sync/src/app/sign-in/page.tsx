'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/useAuth';

export default function SignInPage() {
  const router = useRouter();
  const { setCreds } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [host, setHost] = useState('localhost');
  const [database, setDatabase] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const handleSignIn = async () => {
    const res = await fetch('http://localhost:8000/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, host, database }),
    });

    const data = await res.json();
    setMessage(data.message);
    setTimeout(() => setMessage(null), 5000);

    if (data.message.includes('successful')) {
      const newCreds = { username, password, host, database };
      setCreds(newCreds); // ✅ Saves to both context and localStorage
      router.push('/test-queries');
    }
  };

  return (
    <main className="flex flex-col items-center p-10 space-y-4">
      <input className="bg-gray-800 text-white px-3 py-2 w-80" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
      <input className="bg-gray-800 text-white px-3 py-2 w-80" placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} />
      <input className="bg-gray-800 text-white px-3 py-2 w-80" placeholder="Host" value={host} onChange={(e) => setHost(e.target.value)} />
      <input className="bg-gray-800 text-white px-3 py-2 w-80" placeholder="Database" onChange={(e) => setDatabase(e.target.value)} />
      <button onClick={handleSignIn} className="bg-blue-600 text-white px-4 py-2">Sign In</button>
      {message && <p className="text-white text-sm">{message}</p>}
    </main>
  );
}
