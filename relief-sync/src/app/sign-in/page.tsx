'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/useAuth';

export default function SignInPage() {
  const router = useRouter();
  const { setCreds } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Administrator');
  const [message, setMessage] = useState<string | null>(null);

  const handleSignIn = async () => {
    const res = await fetch('http://localhost:8000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    setMessage(data.message || 'Login failed.');
    setTimeout(() => setMessage(null), 5000);

    if (data.success) {
      setCreds({ username, password, role });
      router.push(getRoleRedirectPath(role));
    }
  };

  const getRoleRedirectPath = (role: string): string => {
    switch (role) {
      case 'Administrator': return '/admin';
      case 'Inventory Manager': return '/inventory';
      case 'Field Coordinator': return '/field';
      case 'Donor or Supplier': return '/donate-supply';
      case 'Government or NGO': return '/monitor';
      default: return '/sign-in';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-md p-6 bg-gray-800 rounded space-y-4 shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">Sign In</h1>
        <input
          className="w-full px-3 py-2 bg-gray-700 rounded"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="w-full px-3 py-2 bg-gray-700 rounded"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <select
          className="w-full px-3 py-2 bg-gray-700 rounded"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option>Administrator</option>
          <option>Inventory Manager</option>
          <option>Field Coordinator</option>
          <option>Donor or Supplier</option>
          <option>Government or NGO</option>
        </select>
        <button
          onClick={handleSignIn}
          className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-semibold"
        >
          Sign In
        </button>

        {/* Message feedback */}
        {message && (
          <p className="text-center text-red-400 text-sm mt-2">{message}</p>
        )}
      </div>
    </div>
  );
}
