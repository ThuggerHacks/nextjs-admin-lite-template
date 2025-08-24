import { useCallback } from 'react';

export interface DocumentSyncEvent {
  type: 'create' | 'update' | 'delete' | 'move' | 'rename';
  itemId: string;
  itemType: 'file' | 'folder';
  timestamp: number;
}

class DocumentSyncManager {
  private listeners: Set<(event: DocumentSyncEvent) => void> = new Set();

  subscribe(listener: (event: DocumentSyncEvent) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(event: DocumentSyncEvent) {
    this.listeners.forEach(listener => listener(event));
  }

  createItem(itemId: string, itemType: 'file' | 'folder') {
    this.notify({
      type: 'create',
      itemId,
      itemType,
      timestamp: Date.now()
    });
  }

  updateItem(itemId: string, itemType: 'file' | 'folder') {
    this.notify({
      type: 'update',
      itemId,
      itemType,
      timestamp: Date.now()
    });
  }

  deleteItem(itemId: string, itemType: 'file' | 'folder') {
    this.notify({
      type: 'delete',
      itemId,
      itemType,
      timestamp: Date.now()
    });
  }

  moveItem(itemId: string, itemType: 'file' | 'folder') {
    this.notify({
      type: 'move',
      itemId,
      itemType,
      timestamp: Date.now()
    });
  }

  renameItem(itemId: string, itemType: 'file' | 'folder') {
    this.notify({
      type: 'rename',
      itemId,
      itemType,
      timestamp: Date.now()
    });
  }
}

// Global instance
export const documentSyncManager = new DocumentSyncManager();

export const useDocumentsSync = () => {
  const subscribe = useCallback((listener: (event: DocumentSyncEvent) => void) => {
    return documentSyncManager.subscribe(listener);
  }, []);

  const createItem = useCallback((itemId: string, itemType: 'file' | 'folder') => {
    documentSyncManager.createItem(itemId, itemType);
  }, []);

  const updateItem = useCallback((itemId: string, itemType: 'file' | 'folder') => {
    documentSyncManager.updateItem(itemId, itemType);
  }, []);

  const deleteItem = useCallback((itemId: string, itemType: 'file' | 'folder') => {
    documentSyncManager.deleteItem(itemId, itemType);
  }, []);

  const moveItem = useCallback((itemId: string, itemType: 'file' | 'folder') => {
    documentSyncManager.moveItem(itemId, itemType);
  }, []);

  const renameItem = useCallback((itemId: string, itemType: 'file' | 'folder') => {
    documentSyncManager.renameItem(itemId, itemType);
  }, []);

  return {
    subscribe,
    createItem,
    updateItem,
    deleteItem,
    moveItem,
    renameItem,
  };
};
