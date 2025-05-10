'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/useAuth';
import RolePageHeader from '@/components/RolePageHeader';

export default function AdminPage() {
  const { creds, logout, loading } = useAuth();
  const router = useRouter();

  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'Inventory Manager',
  });

  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!creds || creds.role !== 'Administrator')) {
      router.push('/');
    }
  }, [creds, loading]);

  const sendQuery = async () => {
    const res = await fetch('http://localhost:8000/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...creds, query }),
    });

    const data = await res.json();
    setResult(data.error || JSON.stringify(data.result, null, 2));
  };

  const addUser = async () => {
    const res = await fetch('http://localhost:8000/add-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...creds, new_user: newUser }),
    });
  
    const data = await res.json();
    setFeedback(data.message);
    setTimeout(() => setFeedback(null), 4000);
  };

  const downloadAudit = () => {
    window.open('http://localhost:8000/audit-log?username=' + creds?.username, '_blank');
  };

  const performBackup = async () => {
    const res = await fetch('http://localhost:8000/backup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: creds?.username }),
    });
    const data = await res.json();
    setFeedback(data.message);
    setTimeout(() => setFeedback(null), 4000);
  };

  if (loading || !creds) return null;

  return (
    <main className="flex flex-col items-center p-10 text-white font-sans space-y-6">
      <RolePageHeader/>
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      {feedback && <div className="text-green-400">{feedback}</div>}

      {/* Add User */}
      <details className="w-full max-w-xl bg-gray-800 rounded p-4">
        <summary className="cursor-pointer text-lg font-semibold">Add New User</summary>
        <div className="mt-4 space-y-3">
          <input
            placeholder="Username"
            className="w-full px-3 py-2 bg-gray-700 text-white font-mono"
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
          />
          <input
            placeholder="Password"
            type="password"
            className="w-full px-3 py-2 bg-gray-700 text-white font-mono"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          />
          <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 text-white"
          >
            <option>Administrator</option>
            <option>Inventory Manager</option>
            <option>Field Coordinator</option>
            <option>Donor or Supplier</option>
            <option>Government or NGO</option>
          </select>
          <button onClick={addUser} className="bg-blue-600 px-4 py-2 rounded">
            Add User
          </button>
        </div>
      </details>

      {/* SQL Query */}
      <details className="w-full max-w-xl bg-gray-800 rounded p-4">
        <summary className="cursor-pointer text-lg font-semibold">Run Custom SQL Query</summary>
        <div className="mt-4 space-y-3">
          <textarea
            className="w-full h-32 px-3 py-2 bg-gray-700 text-white font-mono"
            placeholder="Enter SQL query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={sendQuery} className="bg-green-600 px-4 py-2 rounded">
            Run Query
          </button>
          {result && (
            <pre className="bg-gray-100 text-black p-4 rounded max-h-64 overflow-auto text-sm">
              {result}
            </pre>
          )}
        </div>
      </details>

      {/* Audit Log */}
      <details className="w-full max-w-xl bg-gray-800 rounded p-4">
        <summary className="cursor-pointer text-lg font-semibold">Download Audit Log</summary>
        <div className="mt-4">
          <button onClick={downloadAudit} className="bg-yellow-600 px-4 py-2 rounded">
            Download Audit Log
          </button>
        </div>
      </details>

      {/* Backups */}
      <details className="w-full max-w-xl bg-gray-800 rounded p-4">
        <summary className="cursor-pointer text-lg font-semibold">Perform Backup</summary>
        <div className="mt-4">
          <button onClick={performBackup} className="bg-purple-600 px-4 py-2 rounded">
            Trigger Backup
          </button>
        </div>
      </details>
    </main>
  );
}
