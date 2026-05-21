import React, { memo, useRef, useEffect } from 'react';
import './Cell.css';

interface CellStyle {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    textColor: string;
    bgColor: string;
    align: 'left' | 'center' | 'right';
}

interface CellProps {
    row: number;
    col: number;
    value: string;
    isSelected: boolean;
    isSelectedRange: boolean;
    isEditing: boolean;
    editValue: string;
    onSelect: (row: number, col: number, shiftKey: boolean) => void;
    onDoubleClick: (row: number, col: number) => void;
    onEditChange: (value: string) => void;
    onEditComplete: () => void;
    onContextMenu: (e: React.MouseEvent, row: number, col: number) => void;
    width: number;
    height: number;
    left: number;
    top: number;
    style: CellStyle;
}

const Cell = memo(({
    row,
    col,
    value,
    isSelected,
    isSelectedRange,
    isEditing,
    editValue,
    onSelect,
    onDoubleClick,
    onEditChange,
    onEditComplete,
    onContextMenu,
    width,
    height,
    left,
    top,
    style
}: CellProps) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === 'Escape') {
            onEditComplete();
        }
    };

    const cellStyle = {
        width,
        height,
        position: 'absolute' as const,
        transform: `translate(${left}px, ${top}px)`,
        zIndex: isSelected ? 2 : 1
    };

    const contentStyle = {
        fontWeight: style.bold ? 'bold' : 'normal',
        fontStyle: style.italic ? 'italic' : 'normal',
        textDecoration: style.underline ? 'underline' : 'none',
        color: style.textColor,
        backgroundColor: style.bgColor,
        textAlign: style.align,
        padding: '4px 8px',
        whiteSpace: 'nowrap' as const,
        overflow: 'hidden' as const,
        textOverflow: 'ellipsis' as const,
        width: '100%',
        height: '100%',
        boxSizing: 'border-box' as const
    };

    let className = 'cell';
    if (isSelected) className += ' selected';
    else if (isSelectedRange) className += ' in-range';

    return (
        <div
            className={className}
            style={cellStyle}
            onClick={(e) => onSelect(row, col, e.shiftKey)}
            onDoubleClick={() => onDoubleClick(row, col)}
            onContextMenu={(e) => onContextMenu(e, row, col)}
        >
            {isEditing ? (
                <input
                    ref={inputRef}
                    className="cell-input"
                    value={editValue}
                    onChange={(e) => onEditChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={onEditComplete}
                />
            ) : (
                <div className="cell-content" style={contentStyle}>
                    {value}
                </div>
            )}
        </div>
    );
});

Cell.displayName = 'Cell';
export default Cell;