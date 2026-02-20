import { test, expect } from 'vitest';
import {
  createUser,
  createBook,
  calculateArea,
  getStatusColor,
  capitalize,
  trimAndFormat,
  getFirstElement,
} from './main';

test('createUser создает пользователя', () => {
  const user = createUser(1, 'Pavel', 'SenZen@mail.com', true);

  expect(user.id).toBe(1);
  expect(user.name).toBe('Pavel');
  expect(user.email).toBe('SenZen@mail.com');
  expect(user.isActive).toBe(true);
});

test('createBook возвращает книгу', () => {
  const book = createBook({
    title: 'Vavilon',
    author: 'Ktoto',
    genre: 'Kakoito'
  });

  expect(book.title).toBe('Vavilon');
  expect(book.author).toBe('Ktoto');
  expect(book.genre).toBe('Kakoito');
  expect(book.year).toBeUndefined();
});

test('calculateArea правильно считает площадь круга', () => {
  const area = calculateArea('circle', 2);
  expect(area).toBeCloseTo(Math.PI * 4);
});

test('calculateArea правильно считает площадь квадрата', () => {
  const area = calculateArea('square', 5);
  expect(area).toBe(25);
});

test('getStatusColor возвращает правильный цвет', () => {
  expect(getStatusColor('active')).toBe('green');
  expect(getStatusColor('inactive')).toBe('red');
  expect(getStatusColor('new')).toBe('blue');
});

test('capitalize делает первую букву заглавной', () => {
  expect(capitalize('hello')).toBe('Hello');
});

test('capitalize делает всю строку заглавной если uppercase = true', () => {
  expect(capitalize('hello', true)).toBe('HELLO');
});

test('trimAndFormat обрезает пробелы', () => {
  expect(trimAndFormat('  hello  ')).toBe('hello');
});

test('trimAndFormat обрезает и делает uppercase', () => {
  expect(trimAndFormat('  hello  ', true)).toBe('HELLO');
});

test('getFirstElement возвращает первый элемент массива', () => {
  expect(getFirstElement([1, 2, 3])).toBe(1);
});

test('getFirstElement возвращает undefined для пустого массива', () => {
  expect(getFirstElement([])).toBeUndefined();
});