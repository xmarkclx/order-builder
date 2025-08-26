export type StoredOrder<T = unknown> = T & { id: string; createdAt: string };

const KEY = 'orders';

function isBrowser() {
  return typeof window !== 'undefined';
}

export function getOrders<T = unknown>(): StoredOrder<T>[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StoredOrder<T>[]) : [];
  } catch {
    return [];
  }
}

export function saveOrder<T = unknown>(
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
  // Ensure we construct a StoredOrder<T> without using any
  const base = order as unknown as T;
  const item: StoredOrder<T> = { ...(base as T), id, createdAt } as StoredOrder<T>;
  const next = [item, ...orders];
  window.localStorage.setItem(KEY, JSON.stringify(next));
  return id;
}

export function deleteOrder(id: string) {
  if (!isBrowser()) return;
  const orders = getOrders();
  const next = orders.filter((o) => o.id !== id);
  window.localStorage.setItem(KEY, JSON.stringify(next));
}
