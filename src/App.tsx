import { useState, useEffect } from 'react';
import BookCard from './components/BookCard/BookCard';
import { fetchBooks, fetchBookCoverAsBlob } from './services/bookService';
import type { Book } from './types/Book';
import './App.css';

function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const booksData = await fetchBooks();
        
        const booksWithCovers = await Promise.all(
          booksData.slice(0, 80).map(async (book) => {
            if (!book.isbn) return book;
            const coverBlob = await fetchBookCoverAsBlob(book.isbn);
            return { ...book, coverBlob };
          })
        );
        
        setBooks(booksWithCovers);
      } catch (error) {
        console.error('Error loading books:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadBooks();
  }, []);

  if (loading) return <div className="loading">Загрузка книг...</div>;

  return (
    <div className="app">
      <h1>Библиотека книг</h1>
      <div className="books-grid">
        {books.map((book) => (
          <BookCard
            key={book.id}
            title={book.title}
            authors={book.authors}
            coverBlob={book.coverBlob}
          />
        ))}
      </div>
    </div>
  );
}

export default App;