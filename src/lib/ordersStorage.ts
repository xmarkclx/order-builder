export type StoredOrder<T = any> = T & { id: string; createdAt: string };

const KEY = 'orders';

function isBrowser() {
  return typeof window !== 'undefined';
}

export function getOrders<T = any>(): StoredOrder<T>[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StoredOrder<T>[]) : [];
  } catch {
    return [];
  }
}

export function saveOrder<T = any>(
  order: Omit<StoredOrder<T>, 'id' | 'createdAt'> & Partial<StoredOrder<T>>
) {
  if (!isBrowser()) return;
  const orders = getOrders<T>();
  const id =
    order.id ??
    (typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? (crypto.randomUUID as () => string)()
      : `${Date.now()}-${Math.random()}`);
  const createdAt = order.createdAt ?? new Date().toISOString();
  const next = [{ ...(order as any), id, createdAt } as StoredOrder<T>, ...orders];
  window.localStorage.setItem(KEY, JSON.stringify(next));
  return id;
}

export function deleteOrder(id: string) {
  if (!isBrowser()) return;
  const orders = getOrders();
  const next = orders.filter((o) => o.id !== id);
  window.localStorage.setItem(KEY, JSON.stringify(next));
}
