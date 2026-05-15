import React, { useState, useEffect, useRef } from 'react';
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

    const getColumnWidth = (col: number): number => {
        return columnWidths[col] || DEFAULT_CELL_WIDTH;
    };

    const getTotalWidth = () => {
        let total = 0;
        for (let i = 0; i < cols; i++) {
            total += getColumnWidth(i);
        }
        return total;
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        setScrollLeft(e.currentTarget.scrollLeft);
        setScrollTop(e.currentTarget.scrollTop);
    };

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

    const handleContextMenu = (e: React.MouseEvent, row: number, col: number) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, row, col });
        selectCell(row, col, false);
    };

    const closeContextMenu = () => {
        setContextMenu(null);
    };

    const handleAddRowBelow = () => {
        if (contextMenu) {
            addRow(contextMenu.row);
            closeContextMenu();
        }
    };

    const handleDeleteRow = () => {
        if (contextMenu) {
            deleteRow(contextMenu.row);
            closeContextMenu();
        }
    };

    const handleAddColumnRight = () => {
        if (contextMenu) {
            addColumn(contextMenu.col);
            closeContextMenu();
        }
    };

    const handleDeleteColumn = () => {
        if (contextMenu) {
            deleteColumn(contextMenu.col);
            closeContextMenu();
        }
    };

    const handleResizeStart = (col: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setResizingCol(col);
        setResizeStartX(e.clientX);
        setResizeStartWidth(getColumnWidth(col));
    };

    const handleResizeMove = (e: MouseEvent) => {
        if (resizingCol === null) return;
        const delta = e.clientX - resizeStartX;
        let newWidth = resizeStartWidth + delta;
        if (newWidth < 50) newWidth = 50;
        setColumnWidths(prev => ({ ...prev, [resizingCol]: newWidth }));
    };

    const handleResizeEnd = () => {
        setResizingCol(null);
    };

    useEffect(() => {
        if (resizingCol !== null) {
            document.addEventListener('mousemove', handleResizeMove);
            document.addEventListener('mouseup', handleResizeEnd);
            return () => {
                document.removeEventListener('mousemove', handleResizeMove);
                document.removeEventListener('mouseup', handleResizeEnd);
            };
        }
    }, [resizingCol]);

    const totalWidth = getTotalWidth();

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
                <div className="spreadsheet-header" style={{ transform: `translateX(-${scrollLeft}px)` }}>
                    <div className="corner-header" style={{ width: HEADER_WIDTH, height: HEADER_HEIGHT }}>
                    </div>
                    <div className="col-headers" style={{ width: totalWidth, marginLeft: HEADER_WIDTH }}>
                        {Array.from({ length: cols }, (_, col) => (
                            <div
                                key={col}
                                className="col-header"
                                style={{
                                    width: getColumnWidth(col),
                                    height: HEADER_HEIGHT,
                                    left: (() => {
                                        let left = 0;
                                        for (let i = 0; i < col; i++) {
                                            left += getColumnWidth(i);
                                        }
                                        return left;
                                    })(),
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
                    <div className="row-headers" style={{ width: HEADER_WIDTH, transform: `translateY(-${scrollTop}px)` }}>
                        {Array.from({ length: rows }, (_, row) => (
                            <div
                                key={row}
                                className="row-header"
                                style={{
                                    width: HEADER_WIDTH,
                                    height: DEFAULT_ROW_HEIGHT,
                                    top: row * DEFAULT_ROW_HEIGHT,
                                    position: 'absolute'
                                }}
                                onContextMenu={(e) => handleContextMenu(e, row, -1)}
                            >
                                {row + 1}
                            </div>
                        ))}
                    </div>

                    <div className="cells-container" style={{ width: totalWidth, marginLeft: HEADER_WIDTH, transform: `translateY(-${scrollTop}px)` }}>
                        {Array.from({ length: rows }, (_, row) => (
                            <div key={row} style={{ height: DEFAULT_ROW_HEIGHT, position: 'relative' }}>
                                {Array.from({ length: cols }, (_, col) => {
                                    const isEditing = editingCell?.row === row && editingCell?.col === col;
                                    const isSelected = selectedCell?.row === row && selectedCell?.col === col;
                                    
                                    const left = (() => {
                                        let l = 0;
                                        for (let c = 0; c < col; c++) {
                                            l += getColumnWidth(c);
                                        }
                                        return l;
                                    })();
                                    
                                    return (
                                        <div
                                            key={col}
                                            className={`cell ${isSelected ? 'selected' : ''}`}
                                            style={{
                                                width: getColumnWidth(col),
                                                height: DEFAULT_ROW_HEIGHT,
                                                position: 'absolute',
                                                left: left,
                                                top: 0,
                                                borderRight: '1px solid #e0e0e0',
                                                borderBottom: '1px solid #e0e0e0',
                                                boxSizing: 'border-box',
                                                background: 'white'
                                            }}
                                            onClick={() => selectCell(row, col, false)}
                                            onDoubleClick={() => startEdit(row, col)}
                                            onContextMenu={(e) => handleContextMenu(e, row, col)}
                                        >
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editValue}
                                                    autoFocus
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === 'Escape') {
                                                            stopEdit();
                                                        }
                                                    }}
                                                    onBlur={stopEdit}
                                                    className="cell-input"
                                                />
                                            ) : (
                                                <div className="cell-content">{getDisplayValue(row, col)}</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
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