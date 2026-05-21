import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface UiState {
    showCreateModal: boolean;
    showRenameModal: boolean;
    selectedDocId: string | null;
    selectedDocName: string;
}

const initialState: UiState = {
    showCreateModal: false,
    showRenameModal: false,
    selectedDocId: null,
    selectedDocName: ''
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        openCreateModal: (state) => {
            state.showCreateModal = true;
        },
        closeCreateModal: (state) => {
            state.showCreateModal = false;
        },
        openRenameModal: (state, action: PayloadAction<{ id: string; name: string }>) => {
            state.showRenameModal = true;
            state.selectedDocId = action.payload.id;
            state.selectedDocName = action.payload.name;
        },
        closeRenameModal: (state) => {
            state.showRenameModal = false;
            state.selectedDocId = null;
            state.selectedDocName = '';
        }
    }
});

export const {
    openCreateModal,
    closeCreateModal,
    openRenameModal,
    closeRenameModal
} = uiSlice.actions;

export default uiSlice.reducer;