import { useRef, useState, useCallback } from 'react';
import Cell from '../Cell/Cell';
import FormulaBar from '../FormulaBar/FormulaBar';
import { useSpreadsheet } from '../../hooks/useSpreadsheet';
import { cellToID } from '../../utils/cellHelpers';
import './Spreadsheet.css';

const DEFAULT_CELL_WIDTH = 100;
const DEFAULT_ROW_HEIGHT = 28;
const HEADER_WIDTH = 45;
const HEADER_HEIGHT = 28;

const Spreadsheet = () =>{
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  
  const {
    cells,
    rows,
    cols,
    selectedCell,
    selectedRange,
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

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) =>{
    setScrollLeft(e.currentTarget.scrollLeft);
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const getDisplayValue = (row: number, col: number): string =>{
    const value = getCellValue(row, col);
    if (value === null) return '';
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
    return value;
  };

  const getEditValueForCell = (row: number, col: number): string =>{
    const cell = cells[row][col];
    if (cell.formula !== null) return cell.formula;
    if (cell.value !== null) return String(cell.value);
    return '';
  };

  const visibleRows = Math.ceil(window.innerHeight / DEFAULT_ROW_HEIGHT) + 2;
  const visibleCols = Math.ceil(window.innerWidth / DEFAULT_CELL_WIDTH) + 2;

  const startRow = Math.floor(scrollTop / DEFAULT_ROW_HEIGHT);
  const startCol = Math.floor(scrollLeft / DEFAULT_CELL_WIDTH);
  const endRow = Math.min(startRow + visibleRows, rows);
  const endCol = Math.min(startCol + visibleCols, cols);

  const getCellLeft = (col: number): number =>{
    return col * DEFAULT_CELL_WIDTH;
  };

  const getCellTop = (row: number): number =>{
    return row * DEFAULT_ROW_HEIGHT;
  };

  const handleContextMenu = (e: React.MouseEvent, row: number, col: number) =>{
    e.preventDefault();
    selectCell(row, col, false);
  };

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
          if (selectedCell && editingCell){
            stopEdit();
          }
        }}
      />
      
      <div className="spreadsheet-container" ref={containerRef} onScroll={handleScroll}>
        <div className="spreadsheet-header">
          <div className="corner-header" style={{ width: HEADER_WIDTH, height: HEADER_HEIGHT }}>
            <div className="corner-content"></div>
          </div>
          <div className="col-headers" style={{ marginLeft: scrollLeft }}>
            {Array.from({ length: cols }, (_, col) => (
              <div
                key={col}
                className="col-header"
                style={{
                  width: DEFAULT_CELL_WIDTH,
                  height: HEADER_HEIGHT,
                  left: getCellLeft(col)
                }}
              >
                {String.fromCharCode(65 + col)}
              </div>
            ))}
          </div>
        </div>

        <div className="spreadsheet-body">
          <div className="row-headers" style={{ marginTop: scrollTop }}>
            {Array.from({ length: rows }, (_, row) => (
              <div
                key={row}
                className="row-header"
                style={{
                  width: HEADER_WIDTH,
                  height: DEFAULT_ROW_HEIGHT,
                  top: getCellTop(row)
                }}
              >
                {row + 1}
              </div>
            ))}
          </div>

          <div className="cells-container">
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
                    width={DEFAULT_CELL_WIDTH}
                    height={DEFAULT_ROW_HEIGHT}
                  />
                );
              });
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Spreadsheet;