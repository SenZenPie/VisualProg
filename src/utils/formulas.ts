import type { CellValue } from "../types/spreadsheet";
import { idToCell } from "./cellHelpers";

function getRangeCells(rangeStr: string): {rows: number[]; cols: number[]}{
    const [start, end] = rangeStr.split(':');
    const startPos = idToCell(start);
    const endPos = idToCell(end);

    if (!startPos || !endPos) return {rows: [], cols: []};
    const rows: number[] = [];
    const cols: number[] = [];

    for (let r = startPos.row; r <= endPos.row; r++){
        rows.push(r);
    }
    for (let c = startPos.col; c <= endPos.col; c++){
        rows.push(c);
    }
    
    return {rows, cols};
}

export function evaluateFormula(formula: string, getCellValue: (row: number, col: number) => CellValue): number | string | boolean | null{
    if (!formula.startsWith("=")) return formula;
    const expr = formula.slice(1).toUpperCase();

    const sumMatch = expr.match(/SUM\(([A-Z]+[0-9]+:[A-Z]+[0-9]+)\)$/)
    if (sumMatch) {
        const {rows, cols} = getRangeCells(sumMatch[1]);
        let sum = 0;
        for (const r of rows){
            for (const c of cols){
                const val = getCellValue(r,c);
                if (typeof val === 'number') sum += val
            }
        }
        return sum;   
    }
    const avgMatch = expr.match(/AVERAGE\(([A-Z]+[0-9]+:[A-Z]+[0-9]+)\)$/)
    if (avgMatch) {
        const {rows, cols} = getRangeCells(avgMatch[1]);
        let sum = 0;
        let count = 0;
        for (const r of rows){
            for (const c of cols){
                const val = getCellValue(r,c);
                if (typeof val === 'number'){
                    sum += val
                    count++;
                }
            }
        }
        return count > 0 ? sum / count : 0;   
    }
    const mulMatch = expr.match(/^\(([A-Z]+[0-9]+:[A-Z]+[0-9]+)\)$/)
    if (mulMatch) {
        const pos = idToCell(mulMatch[1]);
        const multiplier = parseInt(mulMatch[2],10);
        if (pos && !isNaN(multiplier)){
            const val = getCellValue(pos.row, pos.col);
            if (typeof val === 'number'){
                return val * multiplier;
            }
        }
        return null;
    }
    const num = parseFloat(expr);
    if (!isNaN(num)) return num;

    return expr;
}