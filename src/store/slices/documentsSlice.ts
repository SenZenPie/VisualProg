import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Document, DocumentSummary } from '../../types/spreadsheet';

interface DocumentsState {
    list: DocumentSummary[];
    currentDocument: Document | null;
    currentDocId: string | null;
    loading: boolean;
    error: string | null;
}

const initialState: DocumentsState = {
    list: [],
    currentDocument: null,
    currentDocId: null,
    loading: false,
    error: null
};

const documentsSlice = createSlice({
    name: 'documents',
    initialState,
    reducers: {
        setDocumentsList: (state, action: PayloadAction<DocumentSummary[]>) => {
            state.list = action.payload;
        },
        setCurrentDocument: (state, action: PayloadAction<Document | null>) => {
            state.currentDocument = action.payload;
            state.currentDocId = action.payload?.id || null;
        },
        setCurrentDocId: (state, action: PayloadAction<string | null>) => {
            state.currentDocId = action.payload;
        },
        addDocument: (state, action: PayloadAction<DocumentSummary>) => {
            state.list.unshift(action.payload);
        },
        updateDocumentInList: (state, action: PayloadAction<{ id: string; name: string }>) => {
            const doc = state.list.find(d => d.id === action.payload.id);
            if (doc) {
                doc.name = action.payload.name;
                doc.updatedAt = new Date().toISOString();
            }
        },
        removeDocument: (state, action: PayloadAction<string>) => {
            state.list = state.list.filter(d => d.id !== action.payload);
            if (state.currentDocId === action.payload) {
                state.currentDocument = null;
                state.currentDocId = null;
            }
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        }
    }
});

export const {
    setDocumentsList,
    setCurrentDocument,
    setCurrentDocId,
    addDocument,
    updateDocumentInList,
    removeDocument,
    setLoading,
    setError
} = documentsSlice.actions;

export default documentsSlice.reducer;