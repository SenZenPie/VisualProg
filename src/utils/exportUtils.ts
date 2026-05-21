import type { Cell } from '../types/spreadsheet';

export function exportToCSV(cells: Cell[][]): void {
    const delimiter = ';';
    const rows = cells.map(row =>
        row.map(cell => {
            let value = cell.formattedValue || '';
            if (typeof value === 'string' && (value.includes(delimiter) || value.includes('"'))) {
                value = `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        }).join(delimiter)
    ).join('\n');
    
    const blob = new Blob(["\uFEFF" + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'spreadsheet.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export function exportToJSON(cells: Cell[][]): void {
    const data = cells.map(row =>
        row.map(cell => ({
            value: cell.value,
            formattedValue: cell.formattedValue,
            formula: cell.formula
        }))
    );
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'spreadsheet.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function isValidCSV(text: string): boolean {
    const firstLine = text.split(/\r?\n/)[0];
    const printableChars = /^[\x20-\x7E\u0400-\u04FF\u0500-\u052F\u0009\u000A\u000D;,\"\s]+$/;
    return printableChars.test(firstLine) && firstLine.length < 500;
}

function cleanCSVText(text: string): string {
    let cleaned = '';
    for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);
        if (code === 9 || code === 10 || code === 13) {
            cleaned += text[i];
        } else if (code >= 32 && code <= 126) {
            cleaned += text[i];
        } else if (code >= 1024 && code <= 1279) {
            cleaned += text[i];
        } else {
            cleaned += '';
        }
    }
    return cleaned;
}

export function importFromCSV(file: File, onImport: (data: string[][]) => void): void {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            let text = e.target?.result as string;
            if (!text || text.length === 0) {
                alert('Файл пуст');
                onImport([]);
                return;
            }
            
            text = cleanCSVText(text);
            
            if (!isValidCSV(text)) {
                alert('Файл не является валидным CSV. Пожалуйста, выберите правильный CSV файл.');
                onImport([]);
                return;
            }
            
            const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
            const delimiter = ';';
            
            const rows: string[][] = [];
            for (const line of lines) {
                const cells: string[] = [];
                let inQuote = false;
                let current = '';
                
                for (let i = 0; i < line.length; i++) {
                    const ch = line[i];
                    if (ch === '"') {
                        if (inQuote && line[i + 1] === '"') {
                            current += '"';
                            i++;
                        } else {
                            inQuote = !inQuote;
                        }
                    } else if (ch === delimiter && !inQuote) {
                        cells.push(current.trim());
                        current = '';
                    } else {
                        current += ch;
                    }
                }
                cells.push(current.trim());
                rows.push(cells);
            }
            
            if (rows.length === 0 || rows[0].length === 0) {
                alert('Не удалось разобрать CSV файл');
                onImport([]);
                return;
            }
            
            onImport(rows);
        } catch (err) {
            console.error('CSV import error:', err);
            alert('Ошибка при импорте CSV файла');
            onImport([]);
        }
    };
    reader.onerror = () => {
        alert('Ошибка чтения файла');
        onImport([]);
    };
    reader.readAsText(file, 'UTF-8');
}