import { Link } from 'react-router-dom';

const NotFoundPage = () => {
    return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
            <h1>404</h1>
            <p>Страница не найдена</p>
            <Link to="/dashboard">Вернуться на главную</Link>
        </div>
    );
};

export default NotFoundPage;