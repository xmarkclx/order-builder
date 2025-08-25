'use client';

import { useEffect, useState } from 'react';
import { deleteOrder, getOrders } from '@/lib/ordersStorage';

type Order = any; // Replace with your actual Order type if desired
type StoredOrder = Order & { id: string; createdAt: string };

export function OrdersList() {
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setOrders(getOrders<Order>());
    setLoading(false);
  }, []);

  const handleDelete = (id: string) => {
    deleteOrder(id);
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  if (loading) {
    return <div className="text-sm text-neutral-500">Loading orders...</div>;
  }

  if (orders.length === 0) {
    return <div className="text-neutral-600">No orders yet.</div>;
  }

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <div
          key={o.id}
          className="border rounded p-3 flex items-start justify-between gap-4 bg-white"
        >
          <div className="space-y-1">
            <div className="font-medium">Order #{o.id}</div>
            <div className="text-sm text-neutral-600">
              Created: {new Date(o.createdAt).toLocaleString()}
            </div>
            {/* Optional: Render key order fields here, e.g., customer name, plan, total */}
          </div>
          <button
            onClick={() => handleDelete(o.id)}
            className="text-sm text-red-600 hover:underline"
            aria-label={`Delete order ${o.id}`}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default OrdersList;
