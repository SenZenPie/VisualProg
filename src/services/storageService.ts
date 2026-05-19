import type { Document, DocumentSummary } from "../types/spreadsheet";

const STORAGE_KEY = 'spreadsheet_documents';

function getDocuments(): Document[] {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
}

function saveDocuments(docs: Document[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}

export function getDocumentsList(): DocumentSummary[] {
    const docs = getDocuments();
    return docs.map(doc => ({
        id: doc.id,
        name: doc.name,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        preview: doc.preview || [['', '', ''], ['', '', ''], ['', '', '']]
    }));
}

export function getDocumentById(id: string): Document | null {
    const docs = getDocuments();
    return docs.find(d => d.id === id) || null;
}

export function createDocument(name: string, rows: number, cols: number): Document {
    const newDoc: Document = {
        id: Date.now().toString(),
        name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        rows,
        cols,
        cells: {},
        preview: [['', '', ''], ['', '', ''], ['', '', '']]
    };
    
    const docs = getDocuments();
    docs.push(newDoc);
    saveDocuments(docs);
    return newDoc;
}

export function updateDocument(id: string, updates: Partial<Document>): void {
    const docs = getDocuments();
    const index = docs.findIndex(d => d.id === id);
    if (index !== -1) {
        docs[index] = { ...docs[index], ...updates, updatedAt: new Date().toISOString() };
        saveDocuments(docs);
    }
}

export function deleteDocument(id: string): void {
    const docs = getDocuments();
    const filtered = docs.filter(d => d.id !== id);
    saveDocuments(filtered);
}

export function duplicateDocument(id: string): Document | null {
    const original = getDocumentById(id);
    if (!original) return null;
    
    const newDoc: Document = {
        ...original,
        id: Date.now().toString(),
        name: `${original.name} (копия)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    const docs = getDocuments();
    docs.push(newDoc);
    saveDocuments(docs);
    return newDoc;
}