import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Cell, Position, Range } from '../../types/spreadsheet';

const createEmptyCell = (): Cell => ({
    value: null,
    formattedValue: '',
    formula: null,
    style: {
        bold: false,
        italic: false,
        underline: false,
        textColor: '#000000',
        bgColor: '#ffffff',
        align: 'left'
    }
});

const initCells = (rows: number, cols: number): Cell[][] => {
    const cells: Cell[][] = [];
    for (let i = 0; i < rows; i++) {
        cells[i] = [];
        for (let j = 0; j < cols; j++) {
            cells[i][j] = createEmptyCell();
        }
    }
    return cells;
};

interface SpreadsheetState {
    cells: Cell[][];
    rows: number;
    cols: number;
    selectedCell: Position | null;
    selectedRange: Range | null;
    editingCell: Position | null;
    editValue: string;
    history: {
        past: Cell[][][];
        future: Cell[][][];
    };
}

const initialState: SpreadsheetState = {
    cells: initCells(100, 26),
    rows: 100,
    cols: 26,
    selectedCell: null,
    selectedRange: null,
    editingCell: null,
    editValue: '',
    history: {
        past: [],
        future: []
    }
};

const spreadsheetSlice = createSlice({
    name: 'spreadsheet',
    initialState,
    reducers: {
        setCells: (state, action: PayloadAction<Cell[][]>) => {
            state.history.past.push(JSON.parse(JSON.stringify(state.cells)));
            state.history.future = [];
            state.cells = action.payload;
        },
        updateCell: (state, action: PayloadAction<{ row: number; col: number; value: Cell }>) => {
            state.history.past.push(JSON.parse(JSON.stringify(state.cells)));
            state.history.future = [];
            const { row, col, value } = action.payload;
            if (state.cells[row]) {
                state.cells[row][col] = value;
            }
        },
        setSelectedCell: (state, action: PayloadAction<Position | null>) => {
            state.selectedCell = action.payload;
        },
        setSelectedRange: (state, action: PayloadAction<Range | null>) => {
            state.selectedRange = action.payload;
        },
        setEditingCell: (state, action: PayloadAction<Position | null>) => {
            state.editingCell = action.payload;
        },
        setEditValue: (state, action: PayloadAction<string>) => {
            state.editValue = action.payload;
        },
        undo: (state) => {
            if (state.history.past.length === 0) return;
            const previous = state.history.past.pop();
            if (previous) {
                state.history.future.push(JSON.parse(JSON.stringify(state.cells)));
                state.cells = previous;
            }
        },
        redo: (state) => {
            if (state.history.future.length === 0) return;
            const next = state.history.future.pop();
            if (next) {
                state.history.past.push(JSON.parse(JSON.stringify(state.cells)));
                state.cells = next;
            }
        },
        addRow: (state, action: PayloadAction<number>) => {
            state.history.past.push(JSON.parse(JSON.stringify(state.cells)));
            state.history.future = [];
            const newRow: Cell[] = [];
            for (let j = 0; j < state.cols; j++) {
                newRow[j] = createEmptyCell();
            }
            state.cells.splice(action.payload, 0, newRow);
            state.rows = state.cells.length;
        },
        deleteRow: (state, action: PayloadAction<number>) => {
            state.history.past.push(JSON.parse(JSON.stringify(state.cells)));
            state.history.future = [];
            state.cells.splice(action.payload, 1);
            state.rows = state.cells.length;
        },
        addColumn: (state, action: PayloadAction<number>) => {
            state.history.past.push(JSON.parse(JSON.stringify(state.cells)));
            state.history.future = [];
            for (let i = 0; i < state.cells.length; i++) {
                state.cells[i].splice(action.payload, 0, createEmptyCell());
            }
            state.cols = state.cells[0]?.length || 0;
        },
        deleteColumn: (state, action: PayloadAction<number>) => {
            state.history.past.push(JSON.parse(JSON.stringify(state.cells)));
            state.history.future = [];
            for (let i = 0; i < state.cells.length; i++) {
                state.cells[i].splice(action.payload, 1);
            }
            state.cols = state.cells[0]?.length || 0;
        }
    }
});

export const {
    setCells,
    updateCell,
    setSelectedCell,
    setSelectedRange,
    setEditingCell,
    setEditValue,
    undo,
    redo,
    addRow,
    deleteRow,
    addColumn,
    deleteColumn
} = spreadsheetSlice.actions;

export default spreadsheetSlice.reducer;