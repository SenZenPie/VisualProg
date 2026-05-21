import { describe, it, expect, beforeEach } from 'vitest';
import uiReducer, {openCreateModal,closeCreateModal,openRenameModal,closeRenameModal} from './uiSlice';

describe('uiSlice', () => {
    let initialState: any;

    beforeEach(() => {
        initialState = uiReducer(undefined, { type: '@@INIT' });
    });

    describe('openCreateModal / closeCreateModal', () => {
        it('should open create modal', () => {
            const state = uiReducer(initialState, openCreateModal());
            expect(state.showCreateModal).toBe(true);
        });

        it('should close create modal', () => {
            let state = uiReducer(initialState, openCreateModal());
            expect(state.showCreateModal).toBe(true);
            state = uiReducer(state, closeCreateModal());
            expect(state.showCreateModal).toBe(false);
        });
    });

    describe('openRenameModal / closeRenameModal', () => {
        it('should open rename modal with data', () => {
            const state = uiReducer(
                initialState,
                openRenameModal({ id: '123', name: 'Test Document' })
            );
            expect(state.showRenameModal).toBe(true);
            expect(state.selectedDocId).toBe('123');
            expect(state.selectedDocName).toBe('Test Document');
        });

        it('should close rename modal and clear data', () => {
            let state = uiReducer(
                initialState,
                openRenameModal({ id: '123', name: 'Test Document' })
            );
            state = uiReducer(state, closeRenameModal());
            expect(state.showRenameModal).toBe(false);
            expect(state.selectedDocId).toBeNull();
            expect(state.selectedDocName).toBe('');
        });
    });
});