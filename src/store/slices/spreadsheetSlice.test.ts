import { describe, it, expect, beforeEach } from 'vitest';
import spreadsheetReducer, {updateCell,setSelectedCell,setSelectedRange,setEditingCell,setEditValue,undo,redo,addRow,deleteRow,addColumn,deleteColumn,setCells} from './spreadsheetSlice';
import type { Cell } from '../../types/spreadsheet';

describe('spreadsheetSlice', () => {
    let initialState: any;

    beforeEach(() => {
        initialState = spreadsheetReducer(undefined, { type: '@@INIT' });
    });

    describe('updateCell', () => {
        it('should update cell value', () => {
            const newCell: Cell = {
                value: 10,
                formattedValue: '10',
                formula: null
            };
            const state = spreadsheetReducer(
                initialState,
                updateCell({ row: 0, col: 0, value: newCell })
            );
            expect(state.cells[0][0].value).toBe(10);
            expect(state.cells[0][0].formattedValue).toBe('10');
        });

        it('should save history before update', () => {
            const newCell: Cell = {
                value: 10,
                formattedValue: '10',
                formula: null
            };
            const state = spreadsheetReducer(
                initialState,
                updateCell({ row: 0, col: 0, value: newCell })
            );
            expect(state.history.past.length).toBe(1);
        });
    });

    describe('setSelectedCell', () => {
        it('should set selected cell', () => {
            const state = spreadsheetReducer(
                initialState,
                setSelectedCell({ row: 2, col: 3 })
            );
            expect(state.selectedCell).toEqual({ row: 2, col: 3 });
        });

        it('should set selected cell to null', () => {
            let state = spreadsheetReducer(
                initialState,
                setSelectedCell({ row: 2, col: 3 })
            );
            state = spreadsheetReducer(state, setSelectedCell(null));
            expect(state.selectedCell).toBeNull();
        });
    });

    describe('setSelectedRange', () => {
        it('should set selected range', () => {
            const range = {
                startRow: 0,
                startCol: 0,
                endRow: 5,
                endCol: 5
            };
            const state = spreadsheetReducer(
                initialState,
                setSelectedRange(range)
            );
            expect(state.selectedRange).toEqual(range);
        });
    });

    describe('setEditingCell', () => {
        it('should set editing cell', () => {
            const state = spreadsheetReducer(
                initialState,
                setEditingCell({ row: 1, col: 1 })
            );
            expect(state.editingCell).toEqual({ row: 1, col: 1 });
        });
    });

    describe('setEditValue', () => {
        it('should set edit value', () => {
            const state = spreadsheetReducer(
                initialState,
                setEditValue('=SUM(A1:A5)')
            );
            expect(state.editValue).toBe('=SUM(A1:A5)');
        });
    });

    describe('undo/redo', () => {
        it('should undo last change', () => {
            const newCell: Cell = {
                value: 10,
                formattedValue: '10',
                formula: null
            };
            let state = spreadsheetReducer(
                initialState,
                updateCell({ row: 0, col: 0, value: newCell })
            );
            expect(state.cells[0][0].value).toBe(10);
            
            state = spreadsheetReducer(state, undo());
            expect(state.cells[0][0].value).toBeNull();
        });

        it('should not undo if no history', () => {
            const state = spreadsheetReducer(initialState, undo());
            expect(state.cells[0][0].value).toBeNull();
        });

        it('should redo undone change', () => {
            const newCell: Cell = {
                value: 10,
                formattedValue: '10',
                formula: null
            };
            let state = spreadsheetReducer(
                initialState,
                updateCell({ row: 0, col: 0, value: newCell })
            );
            state = spreadsheetReducer(state, undo());
            expect(state.cells[0][0].value).toBeNull();
            
            state = spreadsheetReducer(state, redo());
            expect(state.cells[0][0].value).toBe(10);
        });

        it('should not redo if no future', () => {
            const state = spreadsheetReducer(initialState, redo());
            expect(state.cells[0][0].value).toBeNull();
        });
    });

    describe('addRow', () => {
        it('should add new row at specified index', () => {
            const initialRows = initialState.cells.length;
            const state = spreadsheetReducer(initialState, addRow(5));
            expect(state.cells.length).toBe(initialRows + 1);
            expect(state.cells[5].length).toBe(26);
        });
    });

    describe('deleteRow', () => {
        it('should delete row at specified index', () => {
            const initialRows = initialState.cells.length;
            const state = spreadsheetReducer(initialState, deleteRow(5));
            expect(state.cells.length).toBe(initialRows - 1);
        });
    });

    describe('addColumn', () => {
        it('should add new column at specified index', () => {
            const initialCols = initialState.cells[0].length;
            const state = spreadsheetReducer(initialState, addColumn(5));
            expect(state.cells[0].length).toBe(initialCols + 1);
        });
    });

    describe('deleteColumn', () => {
        it('should delete column at specified index', () => {
            const initialCols = initialState.cells[0].length;
            const state = spreadsheetReducer(initialState, deleteColumn(5));
            expect(state.cells[0].length).toBe(initialCols - 1);
        });
    });

    describe('setCells', () => {
        it('should replace all cells', () => {
            const newCells: Cell[][] = [[
                { value: 100, formattedValue: '100', formula: null }
            ]];
            const state = spreadsheetReducer(initialState, setCells(newCells));
            expect(state.cells).toEqual(newCells);
        });
    });
});