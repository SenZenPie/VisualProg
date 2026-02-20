import { test, expect } from 'vitest';
import {
  createUser,
  createBook,
  calculateArea,
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