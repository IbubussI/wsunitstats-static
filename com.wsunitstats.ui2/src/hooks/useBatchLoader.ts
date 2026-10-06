import * as React from 'react';

/**
 * Provides cache storage for the data. Each next loaded entry replaces previous one
 * if the data capacity (number of entries) exceeded. If the requested item is in the storage
 * it will be taken out of there instead of loading via given fetch call
 */
export function useBatchLoader<T>(fetchBatch: (batchId: string) => Promise<Record<string, T>>, capacity: number) {
  const storage = React.useRef(new Map<string, Record<string, T>>());

  const loadBatch = async (batchId: string) => {
    if (!storage.current.has(batchId)) {
      const batch = await fetchBatch(batchId);
      storage.current.set(batchId, batch);
      if (storage.current.size > capacity) {
        storage.current.delete(storage.current.keys().next().value!);
      }
    }
  };

  return async (batchId: string, itemId: string) => {
    await loadBatch(batchId);
    return storage.current.get(batchId)?.[itemId];
  };
}
