import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import FormulaBar from '../FormulaBar/FormulaBar';
import ContextMenu from '../ContextMenu/ContextMenu';
import Cell from '../Cell/Cell';
import { useSpreadsheet } from '../../hooks/useSpreadsheet';
import './Spreadsheet.css';

const DEFAULT_CELL_WIDTH = 100;
const DEFAULT_ROW_HEIGHT = 28;
const HEADER_WIDTH = 45;
const HEADER_HEIGHT = 28;
const BUFFER_SIZE = 10;

const Spreadsheet = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scrollTop, setScrollTop] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; row: number; col: number } | null>(null);
    const [columnWidths, setColumnWidths] = useState<Record<number, number>>({});
    const [resizingCol, setResizingCol] = useState<number | null>(null);
    const [resizeStartX, setResizeStartX] = useState(0);
    const [resizeStartWidth, setResizeStartWidth] = useState(0);
    
    const {
        cells, rows, cols, selectedCell, selectedRange, editingCell, editValue,
        getCellValue, startEdit, stopEdit, selectCell, setEditValue,
        addRow, deleteRow, addColumn, deleteColumn
    } = useSpreadsheet();

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
        return row >= Math.min(startRow, endRow) && row <= Math.max(startRow, endRow) &&
               col >= Math.min(startCol, endCol) && col <= Math.max(startCol, endCol);
    };

    const containerHeight = containerRef.current?.clientHeight || 800;
    const containerWidth = containerRef.current?.clientWidth || 1200;
    const visibleStartRow = Math.max(0, Math.floor(scrollTop / DEFAULT_ROW_HEIGHT) - BUFFER_SIZE);
    const visibleEndRow = Math.min(rows, Math.ceil((scrollTop + containerHeight) / DEFAULT_ROW_HEIGHT) + BUFFER_SIZE);

    let visibleStartCol = 0;
    while (visibleStartCol < cols && columnOffsets[visibleStartCol + 1] < scrollLeft) visibleStartCol++;
    visibleStartCol = Math.max(0, visibleStartCol - BUFFER_SIZE);

    let visibleEndCol = visibleStartCol;
    while (visibleEndCol < cols && columnOffsets[visibleEndCol] < scrollLeft + containerWidth) visibleEndCol++;
    visibleEndCol = Math.min(cols, visibleEndCol + BUFFER_SIZE);

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

    return (
        <div className="spreadsheet">
            <FormulaBar
                value={selectedCell ? (cells[selectedCell.row][selectedCell.col].formula || String(cells[selectedCell.row][selectedCell.col].value || '')) : ''}
                onChange={setEditValue}
                onCommit={stopEdit}
            />
            
            <div className="spreadsheet-container" ref={containerRef} onScroll={handleScroll}>
                <div className="spreadsheet-body" style={{ width: totalWidth + HEADER_WIDTH, height: rows * DEFAULT_ROW_HEIGHT + HEADER_HEIGHT }}>
                    
                    <div className="corner-header" style={{ width: HEADER_WIDTH, height: HEADER_HEIGHT }} />

                    <div className="col-headers" style={{ left: HEADER_WIDTH, height: HEADER_HEIGHT, width: totalWidth }}>
                        {Array.from({ length: visibleEndCol - visibleStartCol }, (_, i) => {
                            const col = visibleStartCol + i;
                            return (
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
                        })}
                    </div>

                    <div className="row-headers" style={{ top: HEADER_HEIGHT, width: HEADER_WIDTH, height: rows * DEFAULT_ROW_HEIGHT }}>
                        {Array.from({ length: visibleEndRow - visibleStartRow }, (_, i) => {
                            const row = visibleStartRow + i;
                            return (
                                <div key={row} className="row-header" style={{ height: DEFAULT_ROW_HEIGHT, width: HEADER_WIDTH, top: row * DEFAULT_ROW_HEIGHT, position: 'absolute' }}>
                                    {row + 1}
                                </div>
                            );
                        })}
                    </div>

                    <div className="cells-container" style={{ left: HEADER_WIDTH, top: HEADER_HEIGHT, position: 'absolute' }}>
                        {Array.from({ length: visibleEndRow - visibleStartRow }, (_, i) => {
                            const row = visibleStartRow + i;
                            return Array.from({ length: visibleEndCol - visibleStartCol }, (_, j) => {
                                const col = visibleStartCol + j;
                                const isEditing = editingCell?.row === row && editingCell?.col === col;
                                const cellValue = getCellValue(row, col);
                                const displayValue = cellValue === null ? '' : String(cellValue);
                                
                                return (
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
                                        onEditChange={setEditValue}
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
                            });
                        })}
                    </div>
                </div>
            </div>

            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={() => setContextMenu(null)}
                    onAddRowAbove={() => {
                        addRow(contextMenu.row - 1);
                        setContextMenu(null);
                    }}
                    onAddRowBelow={() => {
                        addRow(contextMenu.row);
                        setContextMenu(null);
                    }}
                    onDeleteRow={() => {
                        deleteRow(contextMenu.row);
                        setContextMenu(null);
                    }}
                    onAddColumnLeft={() => {
                        addColumn(contextMenu.col - 1);
                        setContextMenu(null);
                    }}
                    onAddColumnRight={() => {
                        addColumn(contextMenu.col);
                        setContextMenu(null);
                    }}
                    onDeleteColumn={() => {
                        deleteColumn(contextMenu.col);
                        setContextMenu(null);
                    }}
                />
            )}
        </div>
    );
};

export default Spreadsheet;