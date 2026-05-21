import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import FormulaBar from '../FormulaBar/FormulaBar';
import ContextMenu from '../ContextMenu/ContextMenu';
import Cell from '../Cell/Cell';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateCell, setSelectedCell, setSelectedRange, setEditingCell, setEditValue,addRow,deleteRow,addColumn,deleteColumn,undo,redo} from '../../store/slices/spreadsheetSlice';
import { setSaveStatus } from '../../store/slices/documentsSlice';
import { exportToCSV, exportToJSON, importFromCSV } from '../../utils/exportUtils';
import { evaluateFormula } from '../../utils/formulas';
import { updateDocumentCells } from '../../services/storageService';
import type { CellValue, Cell as CellType } from '../../types/spreadsheet';
import './SpreadSheet.css';

const DEFAULT_CELL_WIDTH = 100;
const DEFAULT_ROW_HEIGHT = 28;
const HEADER_WIDTH = 45;
const HEADER_HEIGHT = 28;
const BUFFER_SIZE = 10;

interface SpreadsheetProps {
}

const Spreadsheet = ({}: SpreadsheetProps) => {
    const dispatch = useAppDispatch();
    const containerRef = useRef<HTMLDivElement>(null);
    const [scrollTop, setScrollTop] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; row: number; col: number } | null>(null);
    const [columnWidths, setColumnWidths] = useState<Record<number, number>>({});
    const [resizingCol, setResizingCol] = useState<number | null>(null);
    const [resizeStartX, setResizeStartX] = useState(0);
    const [resizeStartWidth, setResizeStartWidth] = useState(0);
    
    const cells = useAppSelector((state) => state.spreadsheet.cells);
    const cols = useAppSelector((state) => state.spreadsheet.cols);
    const selectedCell = useAppSelector((state) => state.spreadsheet.selectedCell);
    const selectedRange = useAppSelector((state) => state.spreadsheet.selectedRange);
    const editingCell = useAppSelector((state) => state.spreadsheet.editingCell);
    const editValue = useAppSelector((state) => state.spreadsheet.editValue);
    const docName = useAppSelector((state) => state.documents.currentDocument?.name || '');
    const saveStatus = useAppSelector((state) => state.documents.saveStatus);
    const currentDocId = useAppSelector((state) => state.documents.currentDocId);
    const hasUnsavedChanges = saveStatus === 'saving';

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                dispatch(undo());
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                e.preventDefault();
                dispatch(redo());
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [dispatch]);

    useEffect(() => {
        if (!currentDocId) return;
        
        const timeout = setTimeout(() => {
            updateDocumentCells(currentDocId, cells);
            dispatch(setSaveStatus('saved'));
        }, 500);
        
        return () => clearTimeout(timeout);
    }, [cells, currentDocId, dispatch]);

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

    const getCellValue = useCallback((row: number, col: number): CellValue => {
        if (row < 0 || row >= cells.length || col < 0 || col >= cells[0]?.length) return null;
        const cell = cells[row]?.[col];
        if (cell?.formula) {
            const result = evaluateFormula(cell.formula, getCellValue);
            return result;
        }
        return cell?.value || null;
    }, [cells]);

    const getDisplayValue = (row: number, col: number): string => {
        const value = getCellValue(row, col);
        if (value === null) return '';
        if (typeof value === 'number') return value.toString();
        if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
        return value;
    };

    const handleSetCellFormula = (row: number, col: number, formula: string) => {
        dispatch(setSaveStatus('saving'));
        
        if (!formula.startsWith('=')) {
            let parsedValue: CellValue = formula;
            if (formula === '') parsedValue = null;
            else if (!isNaN(Number(formula))) parsedValue = Number(formula);
            else if (formula.toLowerCase() === 'true') parsedValue = true;
            else if (formula.toLowerCase() === 'false') parsedValue = false;
            else parsedValue = formula;
            
            const newCell: CellType = {
                value: parsedValue,
                formattedValue: parsedValue !== null ? String(parsedValue) : '',
                formula: null
            };
            dispatch(updateCell({ row, col, value: newCell }));
        } else {
            const result = evaluateFormula(formula, getCellValue);
            const newCell: CellType = {
                value: result,
                formattedValue: result !== null ? String(result) : '',
                formula: formula
            };
            dispatch(updateCell({ row, col, value: newCell }));
        }
    };

    const startEdit = (row: number, col: number) => {
        const cell = cells[row]?.[col];
        dispatch(setEditingCell({ row, col }));
        dispatch(setEditValue(cell?.formula !== null ? cell?.formula || '' : (cell?.value !== null ? String(cell.value) : '')));
    };

    const stopEdit = () => {
        if (editingCell) {
            handleSetCellFormula(editingCell.row, editingCell.col, editValue);
            dispatch(setEditingCell(null));
            dispatch(setEditValue(''));
        }
    };

    const selectCell = (row: number, col: number, shiftKey: boolean = false) => {
        if (shiftKey && selectedCell) {
            dispatch(setSelectedRange({
                startRow: selectedCell.row,
                startCol: selectedCell.col,
                endRow: row,
                endCol: col
            }));
            dispatch(setSelectedCell({ row, col }));
        } else {
            dispatch(setSelectedCell({ row, col }));
            dispatch(setSelectedRange(null));
        }
    };

    const getStatusText = () => {
        switch (saveStatus) {
            case 'saving': return 'Сохранение...';
            case 'error': return 'Ошибка сохранения';
            default: return 'Сохранено';
        }
    };

    const getColumnWidth = useCallback((col: number) => columnWidths[col] || DEFAULT_CELL_WIDTH, [columnWidths]);

    const columnOffsets = useMemo(() => {
        const offsets = [0];
        let current = 0;
        for (let i = 0; i < cols; i++) {
            current += getColumnWidth(i);
            offsets.push(current);
        }
        return offsets;
    }, [cols, getColumnWidth]);

    const totalWidth = columnOffsets[cols];

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        setScrollLeft(e.currentTarget.scrollLeft);
        setScrollTop(e.currentTarget.scrollTop);
    };

    const isCellInRange = (row: number, col: number) => {
        if (!selectedRange) return false;
        const { startRow, startCol, endRow, endCol } = selectedRange;
        const minRow = Math.min(startRow, endRow);
        const maxRow = Math.max(startRow, endRow);
        const minCol = Math.min(startCol, endCol);
        const maxCol = Math.max(startCol, endCol);
        return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol;
    };

    const containerHeight = containerRef.current?.clientHeight || 800;
    const containerWidth = containerRef.current?.clientWidth || 1200;
    
    const visibleStartRow = Math.max(0, Math.floor(scrollTop / DEFAULT_ROW_HEIGHT) - BUFFER_SIZE);
    const visibleEndRow = Math.min(cells.length - 1, Math.ceil((scrollTop + containerHeight) / DEFAULT_ROW_HEIGHT) + BUFFER_SIZE);

    let visibleStartCol = 0;
    while (visibleStartCol < cols && columnOffsets[visibleStartCol + 1] < scrollLeft) visibleStartCol++;
    visibleStartCol = Math.max(0, visibleStartCol - BUFFER_SIZE);

    let visibleEndCol = visibleStartCol;
    while (visibleEndCol < cols && columnOffsets[visibleEndCol] < scrollLeft + containerWidth) visibleEndCol++;
    visibleEndCol = Math.min(cols - 1, visibleEndCol + BUFFER_SIZE);

    const handleResizeMove = useCallback((e: MouseEvent) => {
        if (resizingCol === null) return;
        const delta = e.clientX - resizeStartX;
        setColumnWidths(prev => ({ ...prev, [resizingCol]: Math.max(50, resizeStartWidth + delta) }));
    }, [resizingCol, resizeStartX, resizeStartWidth]);

    useEffect(() => {
        if (resizingCol !== null) {
            const end = () => setResizingCol(null);
            document.addEventListener('mousemove', handleResizeMove);
            document.addEventListener('mouseup', end);
            return () => {
                document.removeEventListener('mousemove', handleResizeMove);
                document.removeEventListener('mouseup', end);
            };
        }
    }, [resizingCol, handleResizeMove]);

    const handleImport = (file: File) => {
        importFromCSV(file, (data) => {
            const rows = data.length;
            const maxCols = Math.max(...data.map(row => row.length));
            
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < maxCols; j++) {
                    const value = data[i]?.[j] || '';
                    let newCell: CellType;
                    if (value.startsWith('=')) {
                        newCell = {
                            value: null,
                            formattedValue: '',
                            formula: value
                        };
                    } else {
                        const num = parseFloat(value);
                        if (!isNaN(num) && value !== '') {
                            newCell = {
                                value: num,
                                formattedValue: value,
                                formula: null
                            };
                        } else {
                            newCell = {
                                value: value,
                                formattedValue: value,
                                formula: null
                            };
                        }
                    }
                    dispatch(updateCell({ row: i, col: j, value: newCell }));
                }
            }
        });
    };

    const renderedCells = useMemo(() => {
        const viewCells = [];
        const currentEndRow = Math.min(visibleEndRow, cells.length - 1);
        
        for (let row = visibleStartRow; row <= currentEndRow; row++) {
            for (let col = visibleStartCol; col <= visibleEndCol; col++) {
                const isEditing = editingCell?.row === row && editingCell?.col === col;
                const displayValue = getDisplayValue(row, col);
                
                viewCells.push(
                    <Cell
                        key={`${row}-${col}`}
                        row={row}
                        col={col}
                        value={displayValue}
                        isSelected={selectedCell?.row === row && selectedCell?.col === col}
                        isSelectedRange={isCellInRange(row, col)}
                        isEditing={isEditing}
                        editValue={editValue}
                        onSelect={selectCell}
                        onDoubleClick={() => startEdit(row, col)}
                        onEditChange={(val) => dispatch(setEditValue(val))}
                        onEditComplete={stopEdit}
                        onContextMenu={(e, r, c) => {
                            e.preventDefault();
                            setContextMenu({ x: e.clientX, y: e.clientY, row: r, col: c });
                        }}
                        width={getColumnWidth(col)}
                        height={DEFAULT_ROW_HEIGHT}
                        left={columnOffsets[col]}
                        top={row * DEFAULT_ROW_HEIGHT}
                    />
                );
            }
        }
        return viewCells;
    }, [visibleStartRow, visibleEndRow, visibleStartCol, visibleEndCol, editingCell, selectedCell, selectedRange, editValue, columnWidths, columnOffsets, cells, getDisplayValue]);

    const renderedRowHeaders = useMemo(() => {
        const headers = [];
        const currentEndRow = Math.min(visibleEndRow, cells.length - 1);
        for (let row = visibleStartRow; row <= currentEndRow; row++) {
            headers.push(
                <div key={row} className="row-header" style={{ height: DEFAULT_ROW_HEIGHT, width: HEADER_WIDTH, top: row * DEFAULT_ROW_HEIGHT, position: 'absolute' }}>
                    {row + 1}
                </div>
            );
        }
        return headers;
    }, [visibleStartRow, visibleEndRow, cells.length]);

    const renderedColHeaders = useMemo(() => {
        const headers = [];
        for (let col = visibleStartCol; col <= visibleEndCol; col++) {
            headers.push(
                <div key={col} className="col-header" style={{ width: getColumnWidth(col), height: HEADER_HEIGHT, left: columnOffsets[col], position: 'absolute' }}>
                    {String.fromCharCode(65 + col)}
                    <div className="col-resize-handle" onMouseDown={(e) => {
                        e.preventDefault();
                        setResizingCol(col);
                        setResizeStartX(e.clientX);
                        setResizeStartWidth(getColumnWidth(col));
                    }} />
                </div>
            );
        }
        return headers;
    }, [visibleStartCol, visibleEndCol, columnWidths, columnOffsets]);

    return (
        <div className="spreadsheet">
            <div className="spreadsheet-toolbar">
                <Link 
                    to="/dashboard" 
                    className="back-btn"
                    onClick={(e) => {
                        if (hasUnsavedChanges) {
                            if (!window.confirm('У вас есть несохранённые изменения. Вы уверены, что хотите выйти?')) {
                                e.preventDefault();
                            }
                        }
                    }}
                >
                    ← Мои документы
                </Link>
                <div className="document-name">{docName}</div>
                <div className="export-buttons">
                    <button onClick={() => exportToCSV(cells)}>CSV</button>
                    <button onClick={() => exportToJSON(cells)}>JSON</button>
                    <label className="import-btn">
                        Импорт CSV
                        <input
                            type="file"
                            accept=".csv"
                            onChange={(e) => {
                                if (e.target.files?.[0]) {
                                    handleImport(e.target.files[0]);
                                }
                                e.target.value = '';
                            }}
                            style={{ display: 'none' }}
                        />
                    </label>
                </div>
                <div className={`save-status save-status-${saveStatus}`}>{getStatusText()}</div>
            </div>
            <FormulaBar
                value={selectedCell ? (cells[selectedCell.row]?.[selectedCell.col]?.formula || String(cells[selectedCell.row]?.[selectedCell.col]?.value || '')) : ''}
                onChange={(val) => dispatch(setEditValue(val))}
                onCommit={stopEdit}
            />
            
            <div className="spreadsheet-container" ref={containerRef} onScroll={handleScroll}>
                <div className="spreadsheet-body" style={{ width: totalWidth + HEADER_WIDTH, height: cells.length * DEFAULT_ROW_HEIGHT + HEADER_HEIGHT, position: 'relative' }}>
                    
                    <div className="corner-header" style={{ width: HEADER_WIDTH, height: HEADER_HEIGHT, position: 'absolute', top: 0, left: 0, zIndex: 100 }} />

                    <div className="col-headers" style={{ position: 'absolute', top: 0, left: HEADER_WIDTH, height: HEADER_HEIGHT, width: totalWidth, zIndex: 50 }}>
                        {renderedColHeaders}
                    </div>

                    <div className="row-headers" style={{ position: 'absolute', left: 0, top: HEADER_HEIGHT, width: HEADER_WIDTH, height: cells.length * DEFAULT_ROW_HEIGHT, zIndex: 40 }}>
                        {renderedRowHeaders}
                    </div>

                    <div className="cells-container" style={{ left: HEADER_WIDTH, top: HEADER_HEIGHT, position: 'absolute' }}>
                        {renderedCells}
                    </div>
                </div>
            </div>

            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={() => setContextMenu(null)}
                    onAddRowAbove={() => {
                        dispatch(addRow(contextMenu.row));
                        setContextMenu(null);
                    }}
                    onAddRowBelow={() => {
                        dispatch(addRow(contextMenu.row + 1));
                        setContextMenu(null);
                    }}
                    onDeleteRow={() => {
                        dispatch(deleteRow(contextMenu.row));
                        setContextMenu(null);
                    }}
                    onAddColumnLeft={() => {
                        dispatch(addColumn(contextMenu.col));
                        setContextMenu(null);
                    }}
                    onAddColumnRight={() => {
                        dispatch(addColumn(contextMenu.col + 1));
                        setContextMenu(null);
                    }}
                    onDeleteColumn={() => {
                        dispatch(deleteColumn(contextMenu.col));
                        setContextMenu(null);
                    }}
                />
            )}
        </div>
    );
};

export default Spreadsheet;