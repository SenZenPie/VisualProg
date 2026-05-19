import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import FormulaBar from '../FormulaBar/FormulaBar';
import ContextMenu from '../ContextMenu/ContextMenu';
import Cell from '../Cell/Cell';
import { useSpreadsheet } from '../../hooks/useSpreadsheet';
import './SpreadSheet.css';

const DEFAULT_CELL_WIDTH = 100;
const DEFAULT_ROW_HEIGHT = 28;
const HEADER_WIDTH = 45;
const HEADER_HEIGHT = 28;
const BUFFER_SIZE = 10;

interface SpreadsheetProps {
    documentId: string;
    onBack: () => void;
}

const Spreadsheet = ({ documentId, onBack }: SpreadsheetProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scrollTop, setScrollTop] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; row: number; col: number } | null>(null);
    const [columnWidths, setColumnWidths] = useState<Record<number, number>>({});
    const [resizingCol, setResizingCol] = useState<number | null>(null);
    const [resizeStartX, setResizeStartX] = useState(0);
    const [resizeStartWidth, setResizeStartWidth] = useState(0);
    
    const {
        cells, cols, selectedCell, selectedRange, editingCell, editValue, docName, saveStatus,
        getCellValue, startEdit, stopEdit, selectCell, setEditValue,
        addRow, deleteRow, addColumn, deleteColumn, manualSave
    } = useSpreadsheet(documentId, 100, 26);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                manualSave();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [manualSave]);

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

    const renderedCells = useMemo(() => {
        const viewCells = [];
        const currentEndRow = Math.min(visibleEndRow, cells.length - 1);
        
        for (let row = visibleStartRow; row <= currentEndRow; row++) {
            const rowCells = cells[row];
            if (!rowCells) continue;
            
            const currentEndCol = Math.min(visibleEndCol, rowCells.length - 1);
            for (let col = visibleStartCol; col <= currentEndCol; col++) {
                const isEditing = editingCell?.row === row && editingCell?.col === col;
                const cellValue = getCellValue(row, col);
                const displayValue = cellValue === null ? '' : String(cellValue);
                
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
            }
        }
        return viewCells;
    }, [visibleStartRow, visibleEndRow, visibleStartCol, visibleEndCol, editingCell, selectedCell, selectedRange, editValue, columnWidths, columnOffsets, getCellValue, cells]);

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
                <button className="back-btn" onClick={onBack}>Назад</button>
                <div className="document-name">{docName || documentId}</div>
                <div className={`save-status save-status-${saveStatus}`}>{getStatusText()}</div>
            </div>
            <FormulaBar
                value={selectedCell ? (cells[selectedCell.row]?.[selectedCell.col]?.formula || String(cells[selectedCell.row]?.[selectedCell.col]?.value || '')) : ''}
                onChange={setEditValue}
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
                        addRow(contextMenu.row);
                        setContextMenu(null);
                    }}
                    onAddRowBelow={() => {
                        addRow(contextMenu.row + 1);
                        setContextMenu(null);
                    }}
                    onDeleteRow={() => {
                        deleteRow(contextMenu.row);
                        setContextMenu(null);
                    }}
                    onAddColumnLeft={() => {
                        addColumn(contextMenu.col);
                        setContextMenu(null);
                    }}
                    onAddColumnRight={() => {
                        addColumn(contextMenu.col + 1);
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