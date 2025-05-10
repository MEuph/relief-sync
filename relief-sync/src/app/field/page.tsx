'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/useAuth';
import RolePageHeader from '@/components/RolePageHeader';

export default function FieldCoordinatorPage() {
  const { creds, loading } = useAuth();
  const router = useRouter();
  const [volunteerId] = useState(101); // Set or fetch this dynamically later

  const [resources, setResources] = useState<any[]>([]);
  const [pendingDeliveries, setPendingDeliveries] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [selectedResourceId, setSelectedResourceId] = useState('');
  const [requestAmount, setRequestAmount] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!loading && (!creds || creds.role !== 'Field Coordinator')) {
      router.push('/');
    }
  }, [loading, creds]);

  const fetchAll = async () => {
    if (!creds) return;

    const headers = { 'Content-Type': 'application/json' };
    const authBody = JSON.stringify({ username: creds.username, password: creds.password });

    const [res1, res2, res3] = await Promise.all([
      fetch('http://localhost:8000/get-pending-deliveries', { method: 'POST', headers, body: authBody }),
      fetch('http://localhost:8000/get-distribution-metrics', { method: 'POST', headers, body: authBody }),
      fetch('http://localhost:8000/get-inventory', {
        method: 'POST',
        headers,
        body: authBody.replace('}', `, "type": "Food", "amount": 1, "warehouse": "placeholder"}`), // reuse model workaround
      }),
    ]);

    setPendingDeliveries(await res1.json());
    setMetrics(await res2.json());
    setResources(await res3.json());
  };

  useEffect(() => {
    fetchAll();
  }, [creds]);

  const submitRequest = async () => {
    const now = new Date().toISOString();
    const body = {
      username: creds?.username,
      password: creds?.password,
      volunteer_id: volunteerId,
      resource_id: Number(selectedResourceId),
      request_datetime: now,
      request_amount: Number(requestAmount)
    };
  
    const res = await fetch('http://localhost:8000/submit-resource-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  
    const data = await res.json();
    setFeedback(data.message || 'Request submitted.');
    setTimeout(() => setFeedback(''), 4000);
  };

  if (loading || !creds) return null;

  return (
    <main className="p-10 text-white max-w-6xl mx-auto space-y-6">
      <RolePageHeader />

      <section>
        <h2 className="text-xl font-semibold">Request Resources</h2>
        <select
          className="bg-gray-800 px-3 py-2 w-full"
          value={selectedResourceId}
          onChange={(e) => setSelectedResourceId(e.target.value)}
        >
          <option value="">Select Resource</option>
          {resources.map((r) => (
            <option key={r.resource_id} value={r.resource_id}>
              {r.resource_type} (Available: {r.amount_remaining})
            </option>
          ))}
        </select>
        <input
          className="bg-gray-800 px-3 py-2 w-full"
          placeholder="Amount"
          type="number"
          value={requestAmount}
          onChange={(e) => setRequestAmount(e.target.value)}
        />
        <button onClick={submitRequest} className="bg-blue-600 px-4 py-2 rounded mt-2">
          Submit Request
        </button>
        {feedback && <p className="text-green-400 text-sm">{feedback}</p>}
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6">Pending Deliveries</h2>
        <table className="w-full bg-gray-800 rounded text-sm">
          <thead>
            <tr className="bg-gray-700">
              <th className="p-2">Drone ID</th>
              <th className="p-2">Resource</th>
              <th className="p-2">Delivery Location</th>
              <th className="p-2">Time</th>
            </tr>
          </thead>
          <tbody>
            {pendingDeliveries.map((d, i) => (
              <tr key={i} className="border-t border-gray-600">
                <td className="p-2">{d.drone_id}</td>
                <td className="p-2">{d.resource_type}</td>
                <td className="p-2">{d.delivery_location}</td>
                <td className="p-2">{d.delivery_time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6">Distribution Metrics</h2>
        <table className="w-full bg-gray-800 rounded text-sm">
          <thead>
            <tr className="bg-gray-700">
              <th className="p-2">Resource</th>
              <th className="p-2">Deliveries</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((m, i) => (
              <tr key={i} className="border-t border-gray-600">
                <td className="p-2">{m.resource_type}</td>
                <td className="p-2">{m.deliveries}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
