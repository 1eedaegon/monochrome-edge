/**
 * Storage Core Manager
 * Handles document persistence with IndexedDB and LocalStorage fallback
 */

export class StorageCore {
    constructor(config = {}) {
        this.dbName = config.dbName || 'EditorDB';
        this.dbVersion = config.dbVersion || 1;
        this.db = null;
        this.useIndexedDB = true;
        
        this.init();
    }
    
    async init() {
        try {
            if ('indexedDB' in window) {
                await this.initIndexedDB();
            } else {
                this.useIndexedDB = false;
                console.log('IndexedDB not available, using LocalStorage');
            }
        } catch (error) {
            console.error('Failed to init IndexedDB:', error);
            this.useIndexedDB = false;
        }
    }
    
    async initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => {
                reject(request.error);
            };
            
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create documents store
                if (!db.objectStoreNames.contains('documents')) {
                    const documentsStore = db.createObjectStore('documents', { keyPath: 'id' });
                    documentsStore.createIndex('modified', 'modified', { unique: false });
                    documentsStore.createIndex('created', 'created', { unique: false });
                }
                
                // Create attachments store
                if (!db.objectStoreNames.contains('attachments')) {
                    const attachmentsStore = db.createObjectStore('attachments', { keyPath: 'id' });
                    attachmentsStore.createIndex('documentId', 'documentId', { unique: false });
                    attachmentsStore.createIndex('type', 'type', { unique: false });
                }
                
                // Create settings store
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
            };
        });
    }
    
    // Document Operations
    async saveDocument(id, document) {
        if (this.useIndexedDB && this.db) {
            return this.saveToIndexedDB('documents', { ...document, id });
        } else {
            return this.saveToLocalStorage(`doc_${id}`, document);
        }
    }
    
    async loadDocument(id) {
        if (this.useIndexedDB && this.db) {
            return this.loadFromIndexedDB('documents', id);
        } else {
            return this.loadFromLocalStorage(`doc_${id}`);
        }
    }
    
    async deleteDocument(id) {
        if (this.useIndexedDB && this.db) {
            return this.deleteFromIndexedDB('documents', id);
        } else {
            return this.deleteFromLocalStorage(`doc_${id}`);
        }
    }
    
    async listDocuments() {
        if (this.useIndexedDB && this.db) {
            return this.getAllFromIndexedDB('documents');
        } else {
            return this.listFromLocalStorage('doc_');
        }
    }
    
    // Attachment Operations
    async saveAttachment(id, attachment) {
        if (this.useIndexedDB && this.db) {
            return this.saveToIndexedDB('attachments', { ...attachment, id });
        } else {
            return this.saveToLocalStorage(`att_${id}`, attachment);
        }
    }
    
    async loadAttachment(id) {
        if (this.useIndexedDB && this.db) {
            return this.loadFromIndexedDB('attachments', id);
        } else {
            return this.loadFromLocalStorage(`att_${id}`);
        }
    }
    
    async deleteAttachment(id) {
        if (this.useIndexedDB && this.db) {
            return this.deleteFromIndexedDB('attachments', id);
        } else {
            return this.deleteFromLocalStorage(`att_${id}`);
        }
    }
    
    async getAttachmentsByDocument(documentId) {
        if (this.useIndexedDB && this.db) {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['attachments'], 'readonly');
                const store = transaction.objectStore('attachments');
                const index = store.index('documentId');
                const request = index.getAll(documentId);
                
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        } else {
            const attachments = [];
            const prefix = 'att_';
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(prefix)) {
                    const attachment = this.loadFromLocalStorage(key);
                    if (attachment && attachment.documentId === documentId) {
                        attachments.push(attachment);
                    }
                }
            }
            
            return attachments;
        }
    }
    
    // Settings Operations
    async saveSetting(key, value) {
        if (this.useIndexedDB && this.db) {
            return this.saveToIndexedDB('settings', { key, value });
        } else {
            return this.saveToLocalStorage(`setting_${key}`, value);
        }
    }
    
    async loadSetting(key) {
        if (this.useIndexedDB && this.db) {
            const result = await this.loadFromIndexedDB('settings', key);
            return result ? result.value : null;
        } else {
            return this.loadFromLocalStorage(`setting_${key}`);
        }
    }
    
    // IndexedDB Operations
    async saveToIndexedDB(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);
            
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }
    
    async loadFromIndexedDB(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async deleteFromIndexedDB(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);
            
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }
    
    async getAllFromIndexedDB(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    // LocalStorage Operations
    saveToLocalStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Failed to save to LocalStorage:', error);
            return false;
        }
    }
    
    loadFromLocalStorage(key) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('Failed to load from LocalStorage:', error);
            return null;
        }
    }
    
    deleteFromLocalStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Failed to delete from LocalStorage:', error);
            return false;
        }
    }
    
    listFromLocalStorage(prefix) {
        const items = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(prefix)) {
                const item = this.loadFromLocalStorage(key);
                if (item) {
                    items.push(item);
                }
            }
        }
        
        return items;
    }
    
    // Utility Methods
    async exportData() {
        const data = {
            documents: await this.listDocuments(),
            attachments: this.useIndexedDB ? await this.getAllFromIndexedDB('attachments') : this.listFromLocalStorage('att_'),
            settings: this.useIndexedDB ? await this.getAllFromIndexedDB('settings') : this.listFromLocalStorage('setting_'),
            exportDate: new Date().toISOString()
        };
        
        return JSON.stringify(data, null, 2);
    }
    
    async importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            // Import documents
            if (data.documents) {
                for (const doc of data.documents) {
                    await this.saveDocument(doc.id, doc);
                }
            }
            
            // Import attachments
            if (data.attachments) {
                for (const att of data.attachments) {
                    await this.saveAttachment(att.id, att);
                }
            }
            
            // Import settings
            if (data.settings) {
                for (const setting of data.settings) {
                    await this.saveSetting(setting.key, setting.value);
                }
            }
            
            return true;
        } catch (error) {
            console.error('Failed to import data:', error);
            return false;
        }
    }
    
    async clearAll() {
        if (this.useIndexedDB && this.db) {
            // Clear IndexedDB
            const storeNames = ['documents', 'attachments', 'settings'];
            
            for (const storeName of storeNames) {
                await new Promise((resolve, reject) => {
                    const transaction = this.db.transaction([storeName], 'readwrite');
                    const store = transaction.objectStore(storeName);
                    const request = store.clear();
                    
                    request.onsuccess = () => resolve();
                    request.onerror = () => reject(request.error);
                });
            }
        } else {
            // Clear LocalStorage
            const keysToRemove = [];
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.startsWith('doc_') || key.startsWith('att_') || key.startsWith('setting_'))) {
                    keysToRemove.push(key);
                }
            }
            
            keysToRemove.forEach(key => localStorage.removeItem(key));
        }
        
        return true;
    }
    
    // Storage Statistics
    async getStorageInfo() {
        const info = {
            documentsCount: 0,
            attachmentsCount: 0,
            totalSize: 0,
            storageType: this.useIndexedDB ? 'IndexedDB' : 'LocalStorage'
        };
        
        if (this.useIndexedDB && this.db) {
            const docs = await this.getAllFromIndexedDB('documents');
            const atts = await this.getAllFromIndexedDB('attachments');
            
            info.documentsCount = docs.length;
            info.attachmentsCount = atts.length;
            
            // Estimate size
            if ('estimate' in navigator.storage) {
                const estimate = await navigator.storage.estimate();
                info.totalSize = estimate.usage || 0;
                info.quota = estimate.quota || 0;
            }
        } else {
            // Count LocalStorage items
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key) {
                    if (key.startsWith('doc_')) info.documentsCount++;
                    if (key.startsWith('att_')) info.attachmentsCount++;
                }
            }
            
            // Estimate LocalStorage size
            let size = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    size += localStorage[key].length + key.length;
                }
            }
            info.totalSize = size * 2; // Rough estimate (UTF-16)
        }
        
        return info;
    }
}