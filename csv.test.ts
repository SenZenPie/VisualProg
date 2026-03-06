import { test, expect, vi } from 'vitest';
import { csvToJSON, formatCSVFileToJSONFile } from './csv';

vi.mock('node:fs/promises', () => ({
    readFile: vi.fn(),
    writeFile: vi.fn()
}));

test('csvToJSON корректные данные', () => {
    const input = ['p1;p2;p3;p4', '1;A;B;c', '2;b;n;m'];
    const result = csvToJSON(input, ';');
    expect(result).toEqual([
        { p1: 1, p2: 'A', p3: 'B', p4: 'c' },
        { p1: 2, p2: 'b', p3: 'n', p4: 'm' }
    ]);
});

test('csvToJSON преобразует числа', () => {
    const input = ['id;value', '1;123', '2;456'];
    const result = csvToJSON(input, ';');
    expect(result).toEqual([
        { id: 1, value: 123 },
        { id: 2, value: 456 }
    ]);
});

test('csvToJSON оставляет строки строками', () => {
    const input = ['name;text', 'John;abc', 'Anna;def'];
    const result = csvToJSON(input, ';');
    expect(result).toEqual([
        { name: 'John', text: 'abc' },
        { name: 'Anna', text: 'def' }
    ]);
});

test('csvToJSON пустой массив', () => {
    expect(() => csvToJSON([], ';')).toThrow('Input array is empty');
});

test('csvToJSON несоответствие столбцов', () => {
    const input = ['p1;p2;p3', '1;A;B;c', '2;b;n'];
    expect(() => csvToJSON(input, ';')).toThrow('Column count mismatch');
});

test('csvToJSON только заголовки', () => {
    const input = ['p1;p2;p3;p4'];
    const result = csvToJSON(input, ';');
    expect(result).toEqual([]);
});

