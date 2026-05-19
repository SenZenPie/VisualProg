export type CellValue = string | number | boolean | null;
export interface Cell {
    value: any;
    formattedValue: string;
    formula: string | null;
}
export interface Position {
    row: number
    col:number;
}
export interface Range {
    startRow: number;
    startCol: number;
    endRow: number;
    endCol: number;
}

export interface DocumentItem {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    rowsCount: number;
    colsCount: number;
    cells: Cell[][]; // Сами данные таблицы
}