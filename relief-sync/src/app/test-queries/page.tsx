'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/useAuth';

export default function TestQueriesPage() {
  const router = useRouter();
  const { creds, logout, loading } = useAuth();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (!loading && !creds) {
      router.push('/sign-in');
    }
  }, [loading, creds]);

  const handleQuery = async () => {
    const res = await fetch('http://localhost:8000/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...creds, query }),
    });
    const data = await res.json();
    setResult(data.error || JSON.stringify(data.result, null, 2));
  };

  if (loading || !creds) return null;

  return (
    <main className="flex flex-col items-center p-10 space-y-4">
      <div className="text-white">
        Connected as <b>{creds.username}</b> to <b>{creds.database}</b> on <b>{creds.host}</b>
      </div>
      <button onClick={logout} className="text-red-400 text-sm">Log out</button>
      <textarea
        className="w-[500px] h-[150px] bg-gray-800 text-white px-3 py-2 font-mono"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter SQL query"
      />
      <button onClick={handleQuery} className="bg-green-600 text-white px-4 py-2">Run Query</button>
      {result && (
        <pre className="bg-gray-100 text-black text-sm p-4 rounded w-[500px] max-h-[300px] overflow-auto">
          {result}
        </pre>
      )}
    </main>
  );
}
