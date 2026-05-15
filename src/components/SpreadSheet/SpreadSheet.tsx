import React, { useRef, useState, useCallback, useEffect } from 'react';
import Cell from '../Cell/Cell';
import FormulaBar from '../FormulaBar/FormulaBar';
import ContextMenu from '../ContextMenu/ContextMenu';
import { useSpreadsheet } from '../../hooks/useSpreadsheet';
import './Spreadsheet.css';

const DEFAULT_CELL_WIDTH = 100;
const DEFAULT_ROW_HEIGHT = 28;
const HEADER_WIDTH = 45;
const HEADER_HEIGHT = 28;

const Spreadsheet = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [scrollTop, setScrollTop] = useState(0);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; row: number; col: number } | null>(null);
    const [columnWidths, setColumnWidths] = useState<Record<number, number>>({});
    const [resizingCol, setResizingCol] = useState<number | null>(null);
    const [resizeStartX, setResizeStartX] = useState(0);
    const [resizeStartWidth, setResizeStartWidth] = useState(0);
    
    const {
        cells,
        rows,
        cols,
        selectedCell,
        editingCell,
        editValue,
        getCellValue,
        startEdit,
        stopEdit,
        selectCell,
        setEditValue,
        addRow,
        deleteRow,
        addColumn,
        deleteColumn
    } = useSpreadsheet();

    const getColumnWidth = useCallback((col: number): number => {
        return columnWidths[col] || DEFAULT_CELL_WIDTH;
    }, [columnWidths]);

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        setScrollLeft(e.currentTarget.scrollLeft);
        setScrollTop(e.currentTarget.scrollTop);
    }, []);

    const getDisplayValue = (row: number, col: number): string => {
        const value = getCellValue(row, col);
        if (value === null) return '';
        if (typeof value === 'number') return value.toString();
        if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
        return value;
    };

    const getEditValueForCell = (row: number, col: number): string => {
        const cell = cells[row][col];
        if (cell.formula !== null) return cell.formula;
        if (cell.value !== null) return String(cell.value);
        return '';
    };

    const visibleRows = Math.ceil(window.innerHeight / DEFAULT_ROW_HEIGHT) + 2;
    const visibleCols = Math.ceil(window.innerWidth / DEFAULT_CELL_WIDTH) + 2;

    const startRow = Math.floor(scrollTop / DEFAULT_ROW_HEIGHT);
    
    let startCol = 0;
    let accumulatedWidth = 0;
    for (let i = 0; i < cols; i++) {
        if (accumulatedWidth + getColumnWidth(i) > scrollLeft) {
            startCol = i;
            break;
        }
        accumulatedWidth += getColumnWidth(i);
    }
    
    const endRow = Math.min(startRow + visibleRows, rows);
    const endCol = Math.min(startCol + visibleCols, cols);

    const getCellLeft = (col: number): number => {
        let left = 0;
        for (let i = 0; i < col; i++) {
            left += getColumnWidth(i);
        }
        return left;
    };

    const getCellTop = (row: number): number => {
        return row * DEFAULT_ROW_HEIGHT;
    };

    const handleContextMenu = useCallback((e: React.MouseEvent, row: number, col: number) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, row, col });
        selectCell(row, col, false);
    }, [selectCell]);

    const closeContextMenu = useCallback(() => {
        setContextMenu(null);
    }, []);

    const handleAddRowBelow = useCallback(() => {
        if (contextMenu) {
            addRow(contextMenu.row);
            closeContextMenu();
        }
    }, [contextMenu, addRow, closeContextMenu]);

    const handleDeleteRow = useCallback(() => {
        if (contextMenu) {
            deleteRow(contextMenu.row);
            closeContextMenu();
        }
    }, [contextMenu, deleteRow, closeContextMenu]);

    const handleAddColumnRight = useCallback(() => {
        if (contextMenu) {
            addColumn(contextMenu.col);
            closeContextMenu();
        }
    }, [contextMenu, addColumn, closeContextMenu]);

    const handleDeleteColumn = useCallback(() => {
        if (contextMenu) {
            deleteColumn(contextMenu.col);
            closeContextMenu();
        }
    }, [contextMenu, deleteColumn, closeContextMenu]);

    const handleResizeStart = useCallback((col: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setResizingCol(col);
        setResizeStartX(e.clientX);
        setResizeStartWidth(getColumnWidth(col));
    }, [getColumnWidth]);

    const handleResizeMove = useCallback((e: MouseEvent) => {
        if (resizingCol === null) return;
        const delta = e.clientX - resizeStartX;
        const newWidth = Math.max(50, resizeStartWidth + delta);
        setColumnWidths(prev => ({ ...prev, [resizingCol]: newWidth }));
    }, [resizingCol, resizeStartX, resizeStartWidth]);

    const handleResizeEnd = useCallback(() => {
        setResizingCol(null);
    }, []);

    useEffect(() => {
        if (resizingCol !== null) {
            document.addEventListener('mousemove', handleResizeMove);
            document.addEventListener('mouseup', handleResizeEnd);
            return () => {
                document.removeEventListener('mousemove', handleResizeMove);
                document.removeEventListener('mouseup', handleResizeEnd);
            };
        }
    }, [resizingCol, handleResizeMove, handleResizeEnd]);

    const totalWidth = getCellLeft(cols);
    const totalHeight = rows * DEFAULT_ROW_HEIGHT;

    return (
        <div className="spreadsheet">
            <FormulaBar
                value={selectedCell ? getEditValueForCell(selectedCell.row, selectedCell.col) : ''}
                onChange={(value) => {
                    if (selectedCell) {
                        setEditValue(value);
                    }
                }}
                onCommit={() => {
                    if (selectedCell && editingCell) {
                        stopEdit();
                    }
                }}
            />
            
            <div className="spreadsheet-container" ref={containerRef} onScroll={handleScroll}>
                <div className="spreadsheet-header">
                    <div className="corner-header" style={{ width: HEADER_WIDTH, height: HEADER_HEIGHT }}>
                    </div>
                    <div className="col-headers" style={{ marginLeft: HEADER_WIDTH, width: totalWidth }}>
                        {Array.from({ length: cols }, (_, col) => (
                            <div
                                key={col}
                                className="col-header"
                                style={{
                                    width: getColumnWidth(col),
                                    height: HEADER_HEIGHT,
                                    left: getCellLeft(col),
                                    position: 'absolute'
                                }}
                            >
                                {String.fromCharCode(65 + col)}
                                <div
                                    className="col-resize-handle"
                                    onMouseDown={(e) => handleResizeStart(col, e)}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="spreadsheet-body">
                    <div className="row-headers" style={{ width: HEADER_WIDTH, height: totalHeight }}>
                        {Array.from({ length: rows }, (_, row) => (
                            <div
                                key={row}
                                className="row-header"
                                style={{
                                    width: HEADER_WIDTH,
                                    height: DEFAULT_ROW_HEIGHT,
                                    top: getCellTop(row),
                                    position: 'absolute'
                                }}
                                onContextMenu={(e) => handleContextMenu(e, row, -1)}
                            >
                                {row + 1}
                            </div>
                        ))}
                    </div>

                    <div className="cells-container" style={{ marginLeft: HEADER_WIDTH, width: totalWidth, height: totalHeight, position: 'relative' }}>
                        {Array.from({ length: endRow - startRow }, (_, i) => {
                            const row = startRow + i;
                            return Array.from({ length: endCol - startCol }, (_, j) => {
                                const col = startCol + j;
                                const isEditing = editingCell?.row === row && editingCell?.col === col;
                                const isSelected = selectedCell?.row === row && selectedCell?.col === col;
                                
                                return (
                                    <Cell
                                        key={`${row}-${col}`}
                                        row={row}
                                        col={col}
                                        value={getDisplayValue(row, col)}
                                        isSelected={isSelected}
                                        isEditing={isEditing}
                                        editValue={isEditing ? editValue : ''}
                                        onSelect={selectCell}
                                        onDoubleClick={startEdit}
                                        onEditChange={setEditValue}
                                        onEditComplete={stopEdit}
                                        onContextMenu={handleContextMenu}
                                        width={getColumnWidth(col)}
                                        height={DEFAULT_ROW_HEIGHT}
                                    />
                                );
                            });
                        })}
                    </div>
                </div>
            </div>

            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={closeContextMenu}
                    onAddRowAbove={() => {}}
                    onAddRowBelow={handleAddRowBelow}
                    onDeleteRow={handleDeleteRow}
                    onAddColumnLeft={() => {}}
                    onAddColumnRight={handleAddColumnRight}
                    onDeleteColumn={handleDeleteColumn}
                />
            )}
        </div>
    );
};

export default Spreadsheet;