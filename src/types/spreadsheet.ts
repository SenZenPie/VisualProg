export type CellValue = string | number | boolean | null;

export interface CellStyle {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    textColor: string;
    bgColor: string;
    align: 'left' | 'center' | 'right';
    format: 'number' | 'percent' | 'currency' | 'date' | 'text';
}

export interface Cell {
    value: CellValue;
    formattedValue: string;
    formula: string | null;
    style: CellStyle;
}

export interface Position {
    row: number;
    col: number;
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
    userId: string;
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
    userId: string;
    createdAt: string;
    updatedAt: string;
    preview: string[][];
}