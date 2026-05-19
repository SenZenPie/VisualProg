export type CellValue = string | number | boolean | null;
export interface Cell {
    value: CellValue;
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

export interface Document {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    rows: number;
    cols: number;
    cells: any;
    preview?: string[][];
}

export interface DocumentSummary {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    preview: string[][];
}