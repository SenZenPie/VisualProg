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

export function createDocument(name: string, rows: number, cols: number): Document {
    const newDoc: Document = {
        id: Date.now().toString(),
        name,
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

export function updateDocument(id: string, updates: Partial<Document>): void {
    const doc = getDocumentById(id);
    if (doc) {
        const updated = { ...doc, ...updates, updatedAt: new Date().toISOString() };
        saveDocument(updated);
    }
}

export function updateDocumentCells(id: string, cells: Cell[][]): void {
    const doc = getDocumentById(id);
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
    
    saveDocument(newDoc);
    return newDoc;
}