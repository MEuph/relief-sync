'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/useAuth';
import RolePageHeader from '@/components/RolePageHeader';

export default function InventoryManagerPage() {
  const { creds, loading } = useAuth();
  const router = useRouter();

  const [inventory, setInventory] = useState<any[]>([]);
  const [report, setReport] = useState<any>({});
  const [drones, setDrones] = useState<any>({ en_route: [], charging: [] });

  const [newResource, setNewResource] = useState({ id: '', type: '', amount: '', food_type: '', medicine_type: '' });
  const [newDrone, setNewDrone] = useState({ drone_id: '', destination: '', resource: '' });
  const [newDelivery, setNewDelivery] = useState({drone_id: '', warehouse_id: '', resource_id: ''})

  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');

  const [selectedResourceId, setSelectedResourceId] = useState('');

  const [availableDrones, setAvailableDrones] = useState<any[]>([]);
  const [selectedDroneId, setSelectedDroneId] = useState('');

  const [feedback, setFeedback] = useState('');

  const [error, setError] = useState('');

  const fetchInventory = async () => {
    if (!creds) return;
    const res = await fetch('http://localhost:8000/get-inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: creds.username,
        password: creds.password
      }),
    });
    const data = await res.json();
    console.log(data);
    setInventory(Array.isArray(data) ? data : []); // Just in case we don't get an array back
  };
  
  const fetchWarehouses = async () => {
    const res = await fetch('http://localhost:8000/get-warehouses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: creds?.username,
        password: creds?.password,
      }),
    });
    const data = await res.json();
    setWarehouses(data);
  };

  const fetchDrones = async () => {
    const res = await fetch('http://localhost:8000/get-available-drones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: creds?.username,
        password: creds?.password,
      }),
    });
    const data = await res.json();
    setAvailableDrones(data);
  };

  const fetchDeliveries = async () => {
    const res = await fetch('http://localhost:8000/get-deliveries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: creds?.username,
        password: creds?.password,
      }),
    });
    const data = await res.json();
    setDrones(data);
  };  

  useEffect(() => {
    if (creds) {
      fetchDrones();
      fetchWarehouses();
      fetchInventory();
      fetchDeliveries();
    }
  }, [creds]);

  const handleAddResource = async () => {
    const { id, type, amount, food_type, medicine_type } = newResource;
  
    // Client-side validations
    if (!type || !amount || !selectedWarehouseId) {
      setError('All fields are required.');
    } else if (parseInt(amount) < 1 || parseInt(amount) > 1000) {
      setError('Amount must be between 1 and 1000.');
    } else {
      try {
        const res = await fetch('http://localhost:8000/add-resource', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: creds?.username,
            password: creds?.password,
            type,
            amount: parseInt(amount),
            warehouse_id: selectedWarehouseId,
            resource_id: id,
            food_type: type === 'Food' ? food_type : null,
            medicine_type: type === 'Medicine' ? medicine_type : null,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          setFeedback('Resource added.');
          setNewResource({ id: '', type: '', amount: '', food_type: '', medicine_type: '' });
          setSelectedWarehouseId('');
          fetchInventory();
        } else {
          setError(data.detail || 'An error occurred.');
        }
      } catch {
        setError('Connection failed.');
      }
    }
  
    setTimeout(() => {
      setError('');
      setFeedback('');
    }, 5000);
  };

  const handleSendDrone = async () => {
    try {
      const res = await fetch('http://localhost:8000/send-drone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: creds?.username,
          password: creds?.password,
          drone_id: selectedDroneId,
          warehouse_id: selectedWarehouseId,
          resource_id: selectedResourceId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedback("Sent drone.");
        fetchDrones();
        fetchInventory();
      } else {
        setError(data.detail || 'An error occurred.');
      }
    } catch {
      setError('Connection failed.');
    }
    
    setTimeout(() => {
      setError('');
      setFeedback('');
    }, 5000);
  };

  useEffect(() => {
    if (!loading && (!creds || creds.role !== 'Inventory Manager')) {
      router.push('/');
    }
  }, [loading, creds]);

  useEffect(() => {
    const fetchData = async () => {
      const [repRes] = await Promise.all([
        fetch('http://localhost:8000/dummy-inventory-report'),
      ]);

      const rep = await repRes.json();

      setReport(rep);
    };

    fetchData();
  }, []);

  if (loading || !creds) return null;

  return (
    <main className="p-10 text-white max-w-6xl mx-auto space-y-8">
      <RolePageHeader />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Inventory Management</h2>
        <button
          onClick={fetchInventory}
          className="bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
        >
          🔄 Refresh
        </button>
        <table className="w-full text-sm bg-gray-800 rounded">
          <thead>
            <tr className="bg-gray-700 text-left">
              <th className="p-2">Resource ID</th>
              <th className="p-2">Type</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Warehouse Lat.</th>
              <th className="p-2">Warehouse Lon.</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.resource_id} className="border-t border-gray-600">
                <td className="p-2">{item.resource_id}</td>
                <td className="p-2">{item.resource_type}</td>
                <td className="p-2">{item.amount_remaining}</td>
                <td className="p-2">{item.latitude}</td>
                <td className="p-2">{item.longitude}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Add New Resource</h2>
        <select
          className="bg-gray-800 px-3 py-2 w-full"
          value={newResource.type}
          onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
        >
          <option value="">Select Resource Type</option>
          <option value="Food">Food</option>
          <option value="Water">Water</option>
          <option value="Medicine">Medicine</option>
        </select>
        {newResource.type === 'Food' && (
          <input
            className="bg-gray-800 px-3 py-2 w-full"
            placeholder="Food Type (e.g., Rice)"
            value={newResource.food_type || ''}
            onChange={(e) => setNewResource({ ...newResource, food_type: e.target.value })}
          />
        )}

        {newResource.type === 'Medicine' && (
          <input
            className="bg-gray-800 px-3 py-2 w-full"
            placeholder="Medicine Type (e.g., Insulin)"
            value={newResource.medicine_type || ''}
            onChange={(e) => setNewResource({ ...newResource, medicine_type: e.target.value })}
          />
        )}
        <input
          className="bg-gray-800 px-3 py-2 w-full"
          placeholder="Resource ID (Must be Unique)"
          type="number"
          value={newResource.id}
          onChange={(e) => setNewResource({ ...newResource, id: e.target.value })}
        />
        <input
          className="bg-gray-800 px-3 py-2 w-full"
          placeholder="Amount"
          type="number"
          value={newResource.amount}
          onChange={(e) => setNewResource({ ...newResource, amount: e.target.value })}
        />
        <select
          className="bg-gray-800 px-3 py-2 w-full"
          value={selectedWarehouseId}
          onChange={(e) => setSelectedWarehouseId(e.target.value)}
        >
          <option value="">Select Warehouse</option>
          {warehouses.map((w) => (
            <option key={w.warehouse_id} value={w.warehouse_id}>
              Warehouse #{w.warehouse_id} (Lat/Long: {w.lat.toFixed(4)}, {w.lng.toFixed(4)})
            </option>
          ))}
        </select>
        <button onClick={handleAddResource} className="bg-blue-600 px-4 py-2 rounded">
          Add Resource
        </button>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {feedback && <p className="text-green-400 text-sm">{feedback}</p>}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Send Delivery Drone</h2>
        <select
          className="bg-gray-800 px-3 py-2 w-full"
          value={selectedDroneId}
          onChange={(e) => setSelectedDroneId(e.target.value)}
        >
          <option value="">Select Drone</option>
          {availableDrones.map((w) => (
            <option key={w.drone_id} value={w.drone_id}>
              Drone #{w.drone_id}
            </option>
          ))}
        </select>
        <select
          className="bg-gray-800 px-3 py-2 w-full"
          value={selectedWarehouseId}
          onChange={(e) => setSelectedWarehouseId(e.target.value)}
        >
          <option value="">Select Destination</option>
          {warehouses.map((w) => (
            <option key={w.warehouse_id} value={w.warehouse_id}>
              Warehouse #{w.warehouse_id} (Lat/Long: {w.lat.toFixed(4)}, {w.lng.toFixed(4)})
            </option>
          ))}
        </select>
        <select
          className="bg-gray-800 px-3 py-2 w-full"
          value={selectedResourceId}
          onChange={(e) => setSelectedResourceId(e.target.value)}
        >
          <option value="">Resource Payload</option>
          {inventory.map((w) => (
            <option key={w.resource_id} value={w.resource_id}>
              Resource #{w.resource_id} ({w.resource_type} | {w.amount_remaining})
            </option>
          ))}
        </select>
        <button onClick={handleSendDrone} className="bg-blue-600 px-4 py-2 rounded">
          Dispatch Drone
        </button>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Drones Currently En Route</h2>
        <table className="w-full text-sm bg-gray-800 rounded">
          <thead>
            <tr className="bg-gray-700 text-left">
              <th className="p-2">Drone ID</th>
              <th className="p-2">Destination</th>
              <th className="p-2">ETA</th>
            </tr>
          </thead>
          <tbody>
            {drones.en_route.map((d: any, i: number) => (
              <tr key={i} className="border-t border-gray-600">
                <td className="p-2">{d.drone_id}</td>
                <td className="p-2">{d.destination}</td>
                <td className="p-2">{d.eta_min}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
