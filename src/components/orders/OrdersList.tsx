'use client';

import { useEffect, useState } from 'react';
import { deleteOrder, getOrders, type StoredOrder as StoredOrderGeneric } from '@/lib/ordersStorage';
import { formatCurrency } from '@/lib/format';
import type { Order, AddOn } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type OrderBreakdown = { total: number; planTotal?: number; addOnsTotal?: number; subtotal?: number; tax?: number; mrr?: number };
type StoredOrder = StoredOrderGeneric<Order & { breakdown?: OrderBreakdown }>;

export function OrdersList() {
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setOrders(getOrders<Order>());
    setLoading(false);
  }, []);

  const handleRequestDelete = (id: string) => {
    setTargetDeleteId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!targetDeleteId) return;
    const id = targetDeleteId;
    setConfirmOpen(false);
    setDeletingId(id);
    // Wait for animation then remove
    setTimeout(() => {
      deleteOrder(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
      setDeletingId(null);
      setTargetDeleteId(null);
    }, 350);
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setTargetDeleteId(null);
  };

  if (loading) {
    return <div className="text-sm text-neutral-500">Loading orders...</div>;
  }

  if (orders.length === 0) {
    return <div className="text-neutral-600">No orders yet.</div>;
  }

  return (
    <div className="space-y-3">
      {orders.map((o: StoredOrder) => {
        const customerName = o?.customer?.name || '—';
        const productName = o?.product?.name || '—';
        const planName = o?.selectedPlan?.name || '—';
        const planPrice = typeof o?.selectedPlan?.price === 'number' ? o.selectedPlan.price : 0;
        const durationMonths = o?.contract?.durationMonths || 0;
        const includedAddOns: AddOn[] = Array.isArray(o?.addOns)
          ? (o.addOns as AddOn[]).filter((a) => a.included && a.quantity > 0)
          : [];
        const breakdownTotal = typeof o?.breakdown?.total === 'number'
          ? o.breakdown.total
          : (planPrice + includedAddOns.reduce((s: number, a: AddOn) => s + (a.price || 0) * (a.quantity || 0), 0));
        const contractTotal = breakdownTotal * (durationMonths || 1);

        return (
          <div
            key={o.id}
            className={`group border rounded-lg p-4 bg-white transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 hover:border-amber-300 focus-within:ring-2 focus-within:ring-amber-200 ${deletingId === o.id ? 'opacity-0 translate-y-2 scale-[0.98]' : ''}`}
         >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="font-medium">Order #{o.id}</div>
                <div className="text-sm text-neutral-600">
                  Created: {new Date(o.createdAt).toLocaleString()}
                </div>
              </div>
              <Button
                variant="ghost"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleRequestDelete(o.id)}
                aria-label={`Delete order ${o.id}`}
              >
                Delete
              </Button>
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="space-y-1">
                <div className="text-xs uppercase text-neutral-500">Customer</div>
                <div className="font-semibold">{customerName}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs uppercase text-neutral-500">Product & Plan</div>
                <div className="font-medium">{productName}</div>
                <div className="text-neutral-600">{planName} · {formatCurrency(planPrice)}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs uppercase text-neutral-500">Monthly Total</div>
                <div className="text-base font-bold text-green-700" data-testid="recentOrderMonthlyTotal">
                  {formatCurrency(breakdownTotal)}
                </div>
                <div className="text-neutral-600">Contract ({durationMonths} mo): {formatCurrency(contractTotal)}</div>
              </div>
            </div>

            {includedAddOns.length > 0 && (
              <div className="mt-3 border-t pt-3">
                <div className="text-xs uppercase text-neutral-500 mb-2">Add-ons</div>
                <div className="overflow-hidden rounded-md border border-amber-100">
                  <table className="w-full text-sm">
                    <tbody>
                      {includedAddOns.map((a: AddOn) => (
                        <tr key={a.id} className="even:bg-amber-50/60 odd:bg-white hover:bg-amber-100/70 transition-colors">
                          <td className="px-3 py-2 text-neutral-700">
                            {a.name} ({a.quantity} × {formatCurrency(a.price)})
                          </td>
                          <td className="px-3 py-2 text-right font-medium">
                            {formatCurrency((a.price || 0) * (a.quantity || 0))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete order?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The selected order will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:flex-row sm:space-x-2">
            <Button variant="outline" onClick={handleCancelDelete}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} data-testid="confirmDelete">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default OrdersList;

