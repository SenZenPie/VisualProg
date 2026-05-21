import { describe, it, expect, beforeEach } from 'vitest';
import documentsReducer, {
    setDocumentsList,
    setCurrentDocument,
    setCurrentDocId,
    addDocument,
    updateDocumentInList,
    removeDocument,
    setLoading,
    setError,
    setSaveStatus
} from './documentsSlice';
import type { Document, DocumentSummary } from '../../types/spreadsheet';

describe('documentsSlice', () => {
    let initialState: any;

    beforeEach(() => {
        initialState = documentsReducer(undefined, { type: '@@INIT' });
    });

    describe('setDocumentsList', () => {
        it('should set documents list', () => {
            const list: DocumentSummary[] = [
                {
                    id: '1',
                    name: 'Doc 1',
                    userId: 'user1',
                    createdAt: '2024-01-01',
                    updatedAt: '2024-01-01',
                    preview: [['', '', ''], ['', '', ''], ['', '', '']]
                }
            ];
            const state = documentsReducer(initialState, setDocumentsList(list));
            expect(state.list).toEqual(list);
        });
    });

    describe('setCurrentDocument', () => {
        it('should set current document', () => {
            const doc: Document = {
                id: '1',
                name: 'Doc 1',
                userId: 'user1',
                createdAt: '2024-01-01',
                updatedAt: '2024-01-01',
                rows: 100,
                cols: 26,
                cells: [],
                preview: [['', '', ''], ['', '', ''], ['', '', '']]
            };
            const state = documentsReducer(initialState, setCurrentDocument(doc));
            expect(state.currentDocument).toEqual(doc);
            expect(state.currentDocId).toBe('1');
        });

        it('should set current document to null', () => {
            const state = documentsReducer(initialState, setCurrentDocument(null));
            expect(state.currentDocument).toBeNull();
            expect(state.currentDocId).toBeNull();
        });
    });

    describe('setCurrentDocId', () => {
        it('should set current document id', () => {
            const state = documentsReducer(initialState, setCurrentDocId('123'));
            expect(state.currentDocId).toBe('123');
        });
    });

    describe('addDocument', () => {
        it('should add document to the beginning of list', () => {
            const existingDoc: DocumentSummary = {
                id: '1',
                name: 'Doc 1',
                userId: 'user1',
                createdAt: '2024-01-01',
                updatedAt: '2024-01-01',
                preview: [['', '', ''], ['', '', ''], ['', '', '']]
            };
            let state = documentsReducer(initialState, setDocumentsList([existingDoc]));
            
            const newDoc: DocumentSummary = {
                id: '2',
                name: 'Doc 2',
                userId: 'user1',
                createdAt: '2024-01-02',
                updatedAt: '2024-01-02',
                preview: [['', '', ''], ['', '', ''], ['', '', '']]
            };
            state = documentsReducer(state, addDocument(newDoc));
            expect(state.list[0]).toEqual(newDoc);
            expect(state.list.length).toBe(2);
        });
    });

    describe('updateDocumentInList', () => {
        it('should update document name in list', () => {
            const doc: DocumentSummary = {
                id: '1',
                name: 'Old Name',
                userId: 'user1',
                createdAt: '2024-01-01',
                updatedAt: '2024-01-01',
                preview: [['', '', ''], ['', '', ''], ['', '', '']]
            };
            let state = documentsReducer(initialState, setDocumentsList([doc]));
            state = documentsReducer(state, updateDocumentInList({ id: '1', name: 'New Name' }));
            expect(state.list[0].name).toBe('New Name');
        });
    });

    describe('removeDocument', () => {
        it('should remove document from list', () => {
            const doc1: DocumentSummary = {
                id: '1',
                name: 'Doc 1',
                userId: 'user1',
                createdAt: '2024-01-01',
                updatedAt: '2024-01-01',
                preview: [['', '', ''], ['', '', ''], ['', '', '']]
            };
            const doc2: DocumentSummary = {
                id: '2',
                name: 'Doc 2',
                userId: 'user1',
                createdAt: '2024-01-02',
                updatedAt: '2024-01-02',
                preview: [['', '', ''], ['', '', ''], ['', '', '']]
            };
            let state = documentsReducer(initialState, setDocumentsList([doc1, doc2]));
            state = documentsReducer(state, removeDocument('1'));
            expect(state.list.length).toBe(1);
            expect(state.list[0].id).toBe('2');
        });

        it('should clear current document if removed', () => {
            const doc: Document = {
                id: '1',
                name: 'Doc 1',
                userId: 'user1',
                createdAt: '2024-01-01',
                updatedAt: '2024-01-01',
                rows: 100,
                cols: 26,
                cells: [],
                preview: [['', '', ''], ['', '', ''], ['', '', '']]
            };
            let state = documentsReducer(initialState, setCurrentDocument(doc));
            state = documentsReducer(state, removeDocument('1'));
            expect(state.currentDocument).toBeNull();
            expect(state.currentDocId).toBeNull();
        });
    });

    describe('setLoading', () => {
        it('should set loading state', () => {
            const state = documentsReducer(initialState, setLoading(true));
            expect(state.loading).toBe(true);
        });
    });

    describe('setError', () => {
        it('should set error message', () => {
            const state = documentsReducer(initialState, setError('Something went wrong'));
            expect(state.error).toBe('Something went wrong');
        });
    });

    describe('setSaveStatus', () => {
        it('should set save status', () => {
            const state = documentsReducer(initialState, setSaveStatus('saving'));
            expect(state.saveStatus).toBe('saving');
        });
    });
});