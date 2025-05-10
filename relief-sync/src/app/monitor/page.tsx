'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/useAuth';
import RolePageHeader from '@/components/RolePageHeader';

export default function MonitorPage() {
  const { creds, loading } = useAuth();
  const router = useRouter();
  const [inventory, setInventory] = useState<any[]>([]);
  const [distribution, setDistribution] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && (!creds || creds.role !== 'Government or NGO')) {
      router.push('/');
    }
  }, [loading, creds]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const body = JSON.stringify({
          username: creds?.username,
          password: creds?.password,
        });

        const [invRes, distRes] = await Promise.all([
          fetch('http://localhost:8000/monitor/inventory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
          }),
          fetch('http://localhost:8000/monitor/aid-distribution', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
          }),
        ]);

        const invData = await invRes.json();
        const distData = await distRes.json();

        setInventory(invData);
        setDistribution(distData);
      } catch (err) {
        setError('Failed to load monitoring data.');
      }
    };

    if (creds) fetchData();
  }, [creds]);

  if (loading || !creds) return null;

  return (
    <main className="p-10 text-white max-w-6xl mx-auto space-y-6">
      <RolePageHeader />
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <section>
        <h2 className="text-xl font-semibold">Inventory Overview</h2>
        <table className="w-full bg-gray-800 rounded text-sm mt-2">
          <thead>
            <tr className="bg-gray-700">
              <th className="p-2">ID</th>
              <th className="p-2">Type</th>
              <th className="p-2">Remaining</th>
              <th className="p-2">Expires</th>
              <th className="p-2">Latitude</th>
              <th className="p-2">Longitude</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.resource_id} className="border-t border-gray-600">
                <td className="p-2">{item.resource_id}</td>
                <td className="p-2">{item.resource_type}</td>
                <td className="p-2">{item.amount_remaining}</td>
                <td className="p-2">{item.expiration_date}</td>
                <td className="p-2">{item.latitude}</td>
                <td className="p-2">{item.longitude}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6">Aid Distribution Records</h2>
        <table className="w-full bg-gray-800 rounded text-sm mt-2">
          <thead>
            <tr className="bg-gray-700">
              <th className="p-2">Volunteer ID</th>
              <th className="p-2">Shelter ID</th>
              <th className="p-2">Resource</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Date/Time</th>
            </tr>
          </thead>
          <tbody>
            {distribution.map((d, i) => (
              <tr key={i} className="border-t border-gray-600">
                <td className="p-2">{d.volunteer_id}</td>
                <td className="p-2">{d.shelter_id}</td>
                <td className="p-2">{d.resource_type}</td>
                <td className="p-2">{d.resource_amount}</td>
                <td className="p-2">{d.date_and_time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
