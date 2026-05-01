import { useMemo } from 'react';
import './BookCard.css';

interface BookCardProps {
  title: string;
  authors: string[];
  coverBlob?: Blob;
}

const BookCard = ({ title, authors, coverBlob }: BookCardProps) => {
  const imageUrl = useMemo(() => {
    return coverBlob ? URL.createObjectURL(coverBlob) : null;
  }, [coverBlob]);

  return (
    <div className="book-card">
      <div className="book-cover">
        {imageUrl ? (
          <img src={imageUrl} alt={title} />
        ) : (
          <div className="no-image">X</div>
        )}
      </div>
      <div className="book-title">{title}</div>
      <div className="book-authors">{authors.join(', ')}</div>
    </div>
  );
};

export default BookCard;