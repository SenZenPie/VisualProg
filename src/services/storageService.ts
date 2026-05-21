import type { Document, DocumentSummary, Cell } from '../types/spreadsheet';

const STORAGE_KEY = 'spreadsheet_documents';

function getDocuments(): Document[] {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
}

function saveDocuments(docs: Document[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}

export function getDocumentsList(userId: string): DocumentSummary[] {
    const docs = getDocuments();
    const userDocs = docs.filter(doc => doc.userId === userId);
    return userDocs.map(doc => ({
        id: doc.id,
        name: doc.name,
        userId: doc.userId,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        preview: doc.preview || [['', '', ''], ['', '', ''], ['', '', '']]
    }));
}

export function getDocumentById(id: string, userId: string): Document | null {
    const docs = getDocuments();
    const doc = docs.find(d => d.id === id);
    if (doc && doc.userId === userId) return doc;
    return null;
}

export function saveDocument(doc: Document): void {
    const docs = getDocuments();
    const index = docs.findIndex(d => d.id === doc.id);
    if (index !== -1) {
        docs[index] = doc;
    } else {
        docs.push(doc);
    }
    saveDocuments(docs);
}

export function createDocument(userId: string, name: string, rows: number, cols: number): Document {
    const newDoc: Document = {
        id: Date.now().toString(),
        name,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        rows,
        cols,
        cells: [],
        preview: [['', '', ''], ['', '', ''], ['', '', '']]
    };
    
    saveDocument(newDoc);
    return newDoc;
}

export function updateDocument(id: string, userId: string, updates: Partial<Document>): void {
    const doc = getDocumentById(id, userId);
    if (doc) {
        const updated = { ...doc, ...updates, updatedAt: new Date().toISOString() };
        saveDocument(updated);
    }
}

export function updateDocumentCells(id: string, userId: string, cells: Cell[][]): void {
    const doc = getDocumentById(id, userId);
    if (doc) {
        const preview = [
            [cells[0]?.[0]?.formattedValue || '', cells[0]?.[1]?.formattedValue || '', cells[0]?.[2]?.formattedValue || ''],
            [cells[1]?.[0]?.formattedValue || '', cells[1]?.[1]?.formattedValue || '', cells[1]?.[2]?.formattedValue || ''],
            [cells[2]?.[0]?.formattedValue || '', cells[2]?.[1]?.formattedValue || '', cells[2]?.[2]?.formattedValue || '']
        ];
        const updated = { ...doc, cells, preview, updatedAt: new Date().toISOString() };
        saveDocument(updated);
    }
}

export function deleteDocument(id: string, userId: string): void {
    const docs = getDocuments();
    const filtered = docs.filter(d => !(d.id === id && d.userId === userId));
    saveDocuments(filtered);
}

export function duplicateDocument(id: string, userId: string): Document | null {
    const original = getDocumentById(id, userId);
    if (!original) return null;
    
    const newDoc: Document = {
        ...original,
        id: Date.now().toString(),
        name: `${original.name} (копия)`,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    saveDocument(newDoc);
    return newDoc;
}