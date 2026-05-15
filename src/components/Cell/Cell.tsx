import { memo, useRef, useEffect } from 'react';
import './Cell.css';

interface CellProps {
    row: number;
    col: number;
    value: string;
    isSelected: boolean;
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
    scrollLeft: number;
    scrollTop: number;
}

const Cell = memo(({
    row,
    col,
    value,
    isSelected,
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
    scrollLeft,
    scrollTop
}: CellProps) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleClick = (e: React.MouseEvent) => {
        onSelect(row, col, e.shiftKey);
    };

    const handleDoubleClick = () => {
        onDoubleClick(row, col);
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        onContextMenu(e, row, col);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            onEditComplete();
        } else if (e.key === 'Escape') {
            onEditComplete();
        }
    };

    const style = {
        width: `${width}px`,
        height: `${height}px`,
        position: 'absolute' as const,
        transform: `translateX(${left - scrollLeft}px) translateY(${top - scrollTop}px)`
    };

    return (
        <div
            className={`cell ${isSelected ? 'selected' : ''}`}
            style={style}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            onContextMenu={handleContextMenu}
        >
            {isEditing ? (
                <input
                    ref={inputRef}
                    type="text"
                    value={editValue}
                    onChange={(e) => onEditChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={onEditComplete}
                    className="cell-input"
                />
            ) : (
                <div className="cell-content">{value}</div>
            )}
        </div>
    );
});

Cell.displayName = 'Cell';

export default Cell;