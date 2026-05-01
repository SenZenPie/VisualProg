import type { Book } from '../types/Book';

const BOOKS_API = 'https://fakeapi.extendsclass.com/books.JSON';
const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';

export async function fetchBooks(): Promise<Book[]> {
  const response = await fetch(BOOKS_API);
  const data: Book[] = await response.json();
  return data;
}

export async function fetchBookCover(isbn: string): Promise<string | undefined> {
  const response = await fetch(`${GOOGLE_BOOKS_API}?q=isbn:${isbn}`);
  const data = await response.json();
  return data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;
}