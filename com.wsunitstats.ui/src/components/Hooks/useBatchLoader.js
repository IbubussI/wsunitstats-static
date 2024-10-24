import * as React from 'react';

export function useBatchLoader(fetchBatch, capacity) {
  const storage = React.useRef(new Map());

  const loadBatch = (batchId) => {
    if (storage.current.has(batchId)) {
      return new Promise((resolve) => {
        resolve(storage.current.get(batchId));
      });
    } else {
      return fetchBatch(batchId).then((batch) => {
        storage.current.set(batchId, batch);
        if (storage.current.size > capacity) {
          storage.current.delete(storage.current.entries().next().value[0])
        }
      });
    }
  };
  
  return async (batchId, itemId) => {
    await loadBatch(batchId);
    return storage.current.get(batchId)[itemId];
  };
}