import { test, expect } from 'vitest';
import {
  createUser,
} from './main';

test('createUser создает пользователя', () => {
  const user = createUser(1, 'Pavel', 'SenZen@mail.com', true);

  expect(user.id).toBe(1);
  expect(user.name).toBe('Pavel');
  expect(user.email).toBe('SenZen@mail.com');
  expect(user.isActive).toBe(true);
});