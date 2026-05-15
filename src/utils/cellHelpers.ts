export function cellToID(row: number, col: number): string {
    let colStr = '';
    let c = col;

    while (c >= 0){
        colStr = String.fromCharCode(65 + (c % 26)) + colStr;
        c = Math.floor(c / 26) - 1;
    }
    return `${colStr}${row +1}`;
}

export function idToCell(id: string): {row: number; col: number} | null{
    const match = id.match(/^([A-Z]+)(\d+)$/);
    if (!match) return null;
    const colStr = match[1];
    const rowStr = match[2];

    let col = 0;
    for (let i = 0; i < colStr.length; i++){
        col = col * 26 + (colStr.charCodeAt(i) -64);
    }

    return {row: parseInt(rowStr, 10) - 1, col: col -1};
}

export function isFormula(value: string): boolean{
    return value.startsWith("=");
}