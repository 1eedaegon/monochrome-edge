/**
 * Storage Manager
 * Local-first storage using IndexedDB, LocalStorage, and File System API
 */

export class StorageManager {
    constructor(config) {
        this.config = config;
        this.db = null;
        this.dbName = 'EditorDB';
        this.dbVersion = 1;
    }
    
    async init() {
        // Initialize IndexedDB
        await this.initIndexedDB();
    }
    
    async initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => {
                console.error('IndexedDB error:', request.error);
                reject(request.error);
            };
            
            request.onsuccess = () => {
                this.db = request.result;
                console.log('IndexedDB initialized');
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Documents store
                if (!db.objectStoreNames.contains('documents')) {
                    const documentsStore = db.createObjectStore('documents', { keyPath: 'id' });
                    documentsStore.createIndex('modified', 'metadata.modified', { unique: false });
                    documentsStore.createIndex('title', 'title', { unique: false });
                }
                
                // Attachments store (images, files)
                if (!db.objectStoreNames.contains('attachments')) {
                    const attachmentsStore = db.createObjectStore('attachments', { keyPath: 'id' });
                    attachmentsStore.createIndex('documentId', 'documentId', { unique: false });
                    attachmentsStore.createIndex('type', 'type', { unique: false });
                }
                
                // Settings store
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
            };
        });
    }
    
    // Document operations
    async saveDocument(document) {
        if (!this.db) throw new Error('Database not initialized');
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['documents'], 'readwrite');
            const store = transaction.objectStore('documents');
            const request = store.put(document);
            
            request.onsuccess = () => {
                // Also save to localStorage as backup
                this.saveToLocalStorage(document);
                resolve(document);
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }
    
    async loadDocument(id) {
        if (!this.db) {
            // Fallback to localStorage
            return this.loadFromLocalStorage(id);
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['documents'], 'readonly');
            const store = transaction.objectStore('documents');
            const request = store.get(id);
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = () => {
                // Try localStorage as fallback
                resolve(this.loadFromLocalStorage(id));
            };
        });
    }
    
    async deleteDocument(id) {
        if (!this.db) throw new Error('Database not initialized');
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['documents'], 'readwrite');
            const store = transaction.objectStore('documents');
            const request = store.delete(id);
            
            request.onsuccess = () => {
                // Also remove from localStorage
                localStorage.removeItem(`${this.config.localStorageKey}-${id}`);
                resolve();
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }
    
    async listDocuments() {
        if (!this.db) return [];
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['documents'], 'readonly');
            const store = transaction.objectStore('documents');
            const index = store.index('modified');
            const request = index.openCursor(null, 'prev'); // Sort by modified date, newest first
            
            const documents = [];
            
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    documents.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(documents);
                }
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }
    
    async searchDocuments(query) {
        const documents = await this.listDocuments();
        const lowerQuery = query.toLowerCase();
        
        return documents.filter(doc => {
            const titleMatch = doc.title?.toLowerCase().includes(lowerQuery);
            const contentMatch = doc.blocks?.some(block => 
                block.content?.toLowerCase().includes(lowerQuery)
            );
            return titleMatch || contentMatch;
        });
    }
    
    // Attachment operations
    async storeAttachment(file) {
        if (!this.db) throw new Error('Database not initialized');
        
        const id = 'attach-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        
        // Convert file to blob
        const blob = new Blob([file], { type: file.type });
        
        const attachment = {
            id,
            documentId: this.config.documentId,
            type: file.type,
            name: file.name,
            size: file.size,
            blob,
            created: Date.now()
        };
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['attachments'], 'readwrite');
            const store = transaction.objectStore('attachments');
            const request = store.put(attachment);
            
            request.onsuccess = () => {
                resolve(id);
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }
    
    async getAttachment(id) {
        if (!this.db) throw new Error('Database not initialized');
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['attachments'], 'readonly');
            const store = transaction.objectStore('attachments');
            const request = store.get(id);
            
            request.onsuccess = () => {
                const attachment = request.result;
                if (attachment) {
                    // Create object URL for the blob
                    const url = URL.createObjectURL(attachment.blob);
                    resolve({ ...attachment, url });
                } else {
                    resolve(null);
                }
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }
    
    async deleteAttachment(id) {
        if (!this.db) throw new Error('Database not initialized');
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['attachments'], 'readwrite');
            const store = transaction.objectStore('attachments');
            const request = store.delete(id);
            
            request.onsuccess = () => {
                resolve();
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }
    
    // Settings operations
    async saveSetting(key, value) {
        if (!this.db) {
            localStorage.setItem(`setting-${key}`, JSON.stringify(value));
            return;
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readwrite');
            const store = transaction.objectStore('settings');
            const request = store.put({ key, value });
            
            request.onsuccess = () => {
                resolve();
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }
    
    async getSetting(key) {
        if (!this.db) {
            const value = localStorage.getItem(`setting-${key}`);
            return value ? JSON.parse(value) : null;
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readonly');
            const store = transaction.objectStore('settings');
            const request = store.get(key);
            
            request.onsuccess = () => {
                resolve(request.result?.value);
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }
    
    // LocalStorage fallback
    saveToLocalStorage(document) {
        try {
            const key = `${this.config.localStorageKey}-${document.id}`;
            localStorage.setItem(key, JSON.stringify(document));
        } catch (e) {
            console.warn('LocalStorage save failed:', e);
        }
    }
    
    loadFromLocalStorage(id) {
        try {
            const key = `${this.config.localStorageKey}-${id}`;
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.warn('LocalStorage load failed:', e);
            return null;
        }
    }
    
    // Export/Import
    async exportDocument(id) {
        const document = await this.loadDocument(id);
        if (!document) return null;
        
        // Get all attachments
        const attachments = [];
        if (document.attachments) {
            for (const attachId of document.attachments) {
                const attachment = await this.getAttachment(attachId);
                if (attachment) {
                    attachments.push(attachment);
                }
            }
        }
        
        return {
            document,
            attachments
        };
    }
    
    async importDocument(data) {
        // Import document
        const document = data.document;
        document.metadata.imported = Date.now();
        await this.saveDocument(document);
        
        // Import attachments
        if (data.attachments) {
            for (const attachment of data.attachments) {
                await this.storeAttachment(attachment.blob);
            }
        }
        
        return document;
    }
    
    // File System API (future)
    async requestFileSystemAccess() {
        if ('showDirectoryPicker' in window) {
            try {
                const dirHandle = await window.showDirectoryPicker();
                await this.saveSetting('fileSystemHandle', dirHandle);
                return dirHandle;
            } catch (e) {
                console.warn('File System access denied:', e);
                return null;
            }
        }
        return null;
    }
    
    // Cleanup
    async cleanup() {
        // Remove old documents (older than 30 days)
        const documents = await this.listDocuments();
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        
        for (const doc of documents) {
            if (doc.metadata.modified < thirtyDaysAgo && !doc.metadata.pinned) {
                await this.deleteDocument(doc.id);
            }
        }
    }
}

export default StorageManager;