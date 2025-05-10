'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/useAuth';
import RolePageHeader from '@/components/RolePageHeader';

export default function DonateSupplyPage() {
  const { creds, loading } = useAuth();
  const router = useRouter();

  const [supplierId] = useState(801); // hardcoded known good value
  const [neededResources, setNeededResources] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [resourceId, setResourceId] = useState('');
  const [amount, setAmount] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!loading && (!creds || creds.role !== 'Donor or Supplier')) {
      router.push('/');
    }
  }, [loading, creds]);

  const fetchResources = async () => {
    const base = { username: creds?.username, password: creds?.password };
    const headers = { 'Content-Type': 'application/json' };

    const res1 = await fetch('http://localhost:8000/get-needed-resources', {
      method: 'POST',
      headers,
      body: JSON.stringify(base),
    });
    setNeededResources(await res1.json());

    const res2 = await fetch('http://localhost:8000/get-donation-history', {
      method: 'POST',
      headers,
      body: JSON.stringify({ ...base, supplier_id: supplierId, resource_id: 1, supply_amount: 0 }),
    });
    setHistory(await res2.json());
  };

  useEffect(() => {
    if (creds) {
      fetchResources();
    }
  }, [creds]);

  const handleDonate = async () => {
    try {
      const res = await fetch('http://localhost:8000/submit-donation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: creds?.username,
          password: creds?.password,
          supplier_id: supplierId,
          resource_id: Number(resourceId),
          supply_amount: Number(amount),
        }),
      });
  
      const data = await res.json();
      if (!res.ok) {
        setFeedback(`Error: ${data.detail || 'Unknown error.'}`);
      } else {
        setFeedback(data.message || 'Submitted.');
        fetchResources();
      }
    } catch (err) {
      setFeedback('Failed to connect to server.');
    }
  
    setTimeout(() => setFeedback(''), 5000);
  };

  if (loading || !creds) return null;

  return (
    <main className="p-10 text-white max-w-6xl mx-auto space-y-6">
      <RolePageHeader />

      <section>
        <h2 className="text-xl font-semibold">Resources Needed</h2>
        <table className="w-full bg-gray-800 rounded text-sm">
          <thead>
            <tr className="bg-gray-700">
              <th className="p-2">ID</th>
              <th className="p-2">Type</th>
              <th className="p-2">Remaining</th>
            </tr>
          </thead>
          <tbody>
            {neededResources.map((r) => (
              <tr key={r.resource_id} className="border-t border-gray-600">
                <td className="p-2">{r.resource_id}</td>
                <td className="p-2">{r.resource_type}</td>
                <td className="p-2">{r.amount_remaining}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6">Submit Donation</h2>
        <select
          className="bg-gray-800 px-3 py-2 w-full"
          value={resourceId}
          onChange={(e) => setResourceId(e.target.value)}
        >
          <option value="">Select Resource</option>
          {neededResources.map((r) => (
            <option key={r.resource_id} value={r.resource_id}>
              {r.resource_type} (Remaining: {r.amount_remaining})
            </option>
          ))}
        </select>
        <input
          className="bg-gray-800 px-3 py-2 w-full mt-2"
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button onClick={handleDonate} className="bg-blue-600 px-4 py-2 rounded mt-2">
          Donate
        </button>
        {feedback && <p className="text-green-400 mt-1 text-sm">{feedback}</p>}
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6">Donation History</h2>
        <table className="w-full bg-gray-800 rounded text-sm">
          <thead>
            <tr className="bg-gray-700">
              <th className="p-2">Resource</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h, i) => (
              <tr key={i} className="border-t border-gray-600">
                <td className="p-2">{h.resource_type}</td>
                <td className="p-2">{h.supply_amount}</td>
                <td className="p-2">{new Date(h.supply_date).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
