interface BookCardProps {
  title: string;
  authors: string[];
  coverImage?: string;
}

const BookCard = ({ title, authors, coverImage }: BookCardProps) => {
  return (
    <div className="book-card">
      <div className="book-cover">
        {coverImage ? (
          <img src={coverImage} alt={title} />
        ) : (
          <div>Нет обложки</div>
        )}
      </div>
      <div className="book-title">{title}</div>
      <div className="book-authors">{authors.join(', ')}</div>
    </div>
  );
};