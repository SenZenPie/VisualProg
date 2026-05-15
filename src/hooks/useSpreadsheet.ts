import { useState, useCallback, useRef } from 'react';
import type { Cell, CellValue, Position, Range } from '../types/spreadsheet';
import { evaluateFormula } from '../utils/formulas';

const ROWS = 100;
const COLS = 26;

function createEmptyCell(): Cell {
    return {
        value: null,
        formattedValue: '',
        formula: null
    };
}

function initCells(): Cell[][] {
    const cells: Cell[][] = [];
    for (let i = 0; i < ROWS; i++) {
        cells[i] = [];
        for (let j = 0; j < COLS; j++) {
            cells[i][j] = createEmptyCell();
        }
    }
    return cells;
}

export function useSpreadsheet() {
    const [cells, setCells] = useState<Cell[][]>(initCells);
    const [selectedCell, setSelectedCell] = useState<Position | null>(null);
    const [selectedRange, setSelectedRange] = useState<Range | null>(null);
    const [editingCell, setEditingCell] = useState<Position | null>(null);
    const [editValue, setEditValue] = useState<string>('');
  
    const cellsRef = useRef(cells);
    cellsRef.current = cells;

    const getCellValue = useCallback((row: number, col: number): CellValue => {
        if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return null;
        const cell = cellsRef.current[row][col];
        if (cell.formula) {
            const result = evaluateFormula(cell.formula, getCellValue);
            return result;
        }
        return cell.value;
    }, []);

    const updateCell = useCallback((row: number, col: number, value: CellValue, formula: string | null = null) => {
        setCells(prev => {
            const newCells = [...prev];
            newCells[row] = [...prev[row]];
            newCells[row][col] = {
                value,
                formattedValue: value !== null ? String(value) : '',
                formula
            };
            return newCells;
        });
    }, []);

    const setCellFormula = useCallback((row: number, col: number, formula: string) => {
        if (!formula.startsWith('=')) {
            let parsedValue: CellValue = formula;
            if (formula === '') parsedValue = null;
            else if (!isNaN(Number(formula))) parsedValue = Number(formula);
            else if (formula.toLowerCase() === 'true') parsedValue = true;
            else if (formula.toLowerCase() === 'false') parsedValue = false;
            else parsedValue = formula;
          
            updateCell(row, col, parsedValue, null);
        } else {
            const result = evaluateFormula(formula, getCellValue);
            updateCell(row, col, result, formula);
        }
    }, [updateCell, getCellValue]);

    const startEdit = useCallback((row: number, col: number) => {
        const cell = cells[row][col];
        setEditingCell({ row, col });
        setEditValue(cell.formula !== null ? cell.formula : (cell.value !== null ? String(cell.value) : ''));
    }, [cells]);

    const stopEdit = useCallback(() => {
        if (editingCell) {
            setCellFormula(editingCell.row, editingCell.col, editValue);
            setEditingCell(null);
            setEditValue('');
        }
    }, [editingCell, editValue, setCellFormula]);

    const selectCell = useCallback((row: number, col: number, shiftKey: boolean = false) => {
        if (shiftKey && selectedCell) {
            setSelectedRange({
                startRow: selectedCell.row,
                startCol: selectedCell.col,
                endRow: row,
                endCol: col
            });
            setSelectedCell({ row, col });
        } else {
            setSelectedCell({ row, col });
            setSelectedRange(null);
        }
    }, [selectedCell]);

    const addRow = useCallback((afterRow: number) => {
        setCells(prev => {
            const newCells = [...prev];
            const newRow: Cell[] = [];
            for (let j = 0; j < COLS; j++) {
                newRow[j] = createEmptyCell();
            }
            newCells.splice(afterRow + 1, 0, newRow);
            return newCells;
        });
    }, []);

    const deleteRow = useCallback((row: number) => {
        setCells(prev => {
            const newCells = [...prev];
            newCells.splice(row, 1);
            return newCells;
        });
    }, []);

    const addColumn = useCallback((afterCol: number) => {
        setCells(prev => {
            const newCells = prev.map(row => {
                const newRow = [...row];
                newRow.splice(afterCol + 1, 0, createEmptyCell());
                return newRow;
            });
            return newCells;
        });
    }, []);

    const deleteColumn = useCallback((col: number) => {
        setCells(prev => {
            const newCells = prev.map(row => {
                const newRow = [...row];
                newRow.splice(col, 1);
                return newRow;
            });
            return newCells;
        });
    }, []);

    return {
        cells,
        rows: ROWS,
        cols: COLS,
        selectedCell,
        selectedRange,
        editingCell,
        editValue,
        getCellValue,
        setCellFormula,
        startEdit,
        stopEdit,
        selectCell,
        setEditValue,
        addRow,
        deleteRow,
        addColumn,
        deleteColumn
    };
}