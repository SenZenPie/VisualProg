import type { Book } from '../types/Book';

const BOOKS_API = 'https://fakeapi.extendsclass.com/books.JSON';

export async function fetchBooks(): Promise<Book[]> {
  try {
    const response = await fetch(BOOKS_API);
    if (!response.ok) throw new Error('API is not available');
    const data: Book[] = await response.json();
    return data;
  } catch (error) {
    console.error('API error, using mock data:', error);
    const localBooks = await import('../data/books.json');
    return localBooks.default as Book[];
  }
}

async function fetchBookCoverUrl(isbn: string): Promise<string | undefined> {
  try {
    const response = await fetch(`/google-books/books/v1/volumes?q=isbn:${isbn}`);
    if (!response.ok) return undefined;
    const data = await response.json();
    const imageUrl = data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;
    if (!imageUrl) return undefined;
    return imageUrl.replace('http://', 'https://');
  } catch {
    return undefined;
  }
}

export async function fetchBookCoverAsBlob(isbn: string): Promise<Blob | undefined> {
  const url = await fetchBookCoverUrl(isbn);
  if (!url) return undefined;
  
  try {
    const proxyUrl = url.replace('https://books.google.com', '/book-cover');
    const response = await fetch(proxyUrl);
    if (!response.ok) return undefined;
    return await response.blob();
  } catch {
    return undefined;
  }
}