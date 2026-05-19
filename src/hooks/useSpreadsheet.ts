import { useState, useCallback, useRef, useEffect } from 'react';
import type { Cell, CellValue, Position, Range } from '../types/spreadsheet';
import { evaluateFormula } from '../utils/formulas';
import { updateDocumentCells, getDocumentById } from '../services/storageService';

type SaveStatus = 'saved' | 'saving' | 'error';

function createEmptyCell(): Cell {
    return {
        value: null,
        formattedValue: '',
        formula: null
    };
}

function initCells(rows: number, cols: number): Cell[][] {
    const cells: Cell[][] = [];
    for (let i = 0; i < rows; i++) {
        cells[i] = [];
        for (let j = 0; j < cols; j++) {
            cells[i][j] = createEmptyCell();
        }
    }
    return cells;
}

export function useSpreadsheet(documentId: string | null, initialRows: number = 100, initialCols: number = 26) {
    const [cells, setCells] = useState<Cell[][]>(() => {
        if (documentId) {
            const doc = getDocumentById(documentId);
            if (doc && doc.cells && doc.cells.length > 0) {
                return doc.cells;
            }
        }
        return initCells(initialRows, initialCols);
    });
    const [selectedCell, setSelectedCell] = useState<Position | null>(null);
    const [selectedRange, setSelectedRange] = useState<Range | null>(null);
    const [editingCell, setEditingCell] = useState<Position | null>(null);
    const [editValue, setEditValue] = useState<string>('');
    const [docName, setDocName] = useState<string>('');
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const cellsRef = useRef(cells);
    cellsRef.current = cells;

    useEffect(() => {
        if (documentId) {
            const doc = getDocumentById(documentId);
            if (doc) {
                setDocName(doc.name);
                if (doc.cells && doc.cells.length > 0) {
                    setCells(doc.cells);
                } else {
                    setCells(initCells(doc.rows || initialRows, doc.cols || initialCols));
                }
            }
        }
    }, [documentId, initialRows, initialCols]);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

    const rows = cells.length;
    const cols = cells[0]?.length || 0;

    const saveCells = useCallback(async () => {
        if (!documentId) return;
        setSaveStatus('saving');
        try {
            updateDocumentCells(documentId, cellsRef.current);
            setSaveStatus('saved');
            setHasUnsavedChanges(false);
        } catch {
            setSaveStatus('error');
        }
    }, [documentId]);

    const debouncedSave = useCallback(() => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
            saveCells();
        }, 500);
    }, [saveCells]);

    const getCellValue = useCallback((row: number, col: number): CellValue => {
        if (row < 0 || row >= rows || col < 0 || col >= cols) return null;
        const cell = cellsRef.current[row][col];
        if (cell.formula) {
            const result = evaluateFormula(cell.formula, getCellValue);
            return result;
        }
        return cell.value;
    }, [rows, cols]);

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
        setHasUnsavedChanges(true);
        debouncedSave();
    }, [debouncedSave]);

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

    const addRow = useCallback((index: number) => {
        setCells(prev => {
            const newCells = [...prev];
            const newRow: Cell[] = [];
            for (let j = 0; j < cols; j++) {
                newRow[j] = createEmptyCell();
            }
            newCells.splice(index, 0, newRow);
            return newCells;
        });
        setHasUnsavedChanges(true);
        debouncedSave();
    }, [cols, debouncedSave]);

    const deleteRow = useCallback((index: number) => {
        setCells(prev => {
            const newCells = [...prev];
            newCells.splice(index, 1);
            return newCells;
        });
        setHasUnsavedChanges(true);
        debouncedSave();
    }, [debouncedSave]);

    const addColumn = useCallback((index: number) => {
        setCells(prev => {
            const newCells = prev.map(row => {
                const newRow = [...row];
                newRow.splice(index, 0, createEmptyCell());
                return newRow;
            });
            return newCells;
        });
        setHasUnsavedChanges(true);
        debouncedSave();
    }, [debouncedSave]);

    const deleteColumn = useCallback((index: number) => {
        setCells(prev => {
            const newCells = prev.map(row => {
                const newRow = [...row];
                newRow.splice(index, 1);
                return newRow;
            });
            return newCells;
        });
        setHasUnsavedChanges(true);
        debouncedSave();
    }, [debouncedSave]);

    const manualSave = useCallback(() => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        saveCells();
    }, [saveCells]);

    return {
    cells,
    rows,
    cols,
    selectedCell,
    selectedRange,
    editingCell,
    editValue,
    docName,
    saveStatus,
    getCellValue,
    setCellFormula,
    startEdit,
    stopEdit,
    selectCell,
    setEditValue,
    addRow,
    deleteRow,
    addColumn,
    deleteColumn,
    manualSave,
    setCells
    };
}