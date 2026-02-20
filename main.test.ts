import { test, expect } from 'vitest';
import {
  createUser,
  createBook,
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