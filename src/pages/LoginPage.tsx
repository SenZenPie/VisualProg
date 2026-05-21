import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginSuccess, setLoading, setError, clearError } from '../store/slices/authSlice';

const LoginPage = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { loading, error } = useAppSelector((state) => state.auth);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(clearError());
        
        if (!email || !password) {
            dispatch(setError('Заполните все поля'));
            return;
        }

        dispatch(setLoading(true));

        setTimeout(() => {
            if (email === 'gothmuncher@gmail.com' && password === '12345678') {
                dispatch(loginSuccess({
                    id: '1',
                    name: 'Павел',
                    email: email
                }));
                navigate('/dashboard');
            } else {
                dispatch(setError('Неверный email или пароль'));
            }
            dispatch(setLoading(false));
        }, 500);
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <h1>Вход</h1>
                {error && <div className="auth-error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="auth-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="test@example.com"
                        />
                    </div>
                    <div className="auth-group">
                        <label>Пароль</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="12345678"
                        />
                    </div>
                    <button type="submit" disabled={loading}>
                        {loading ? 'Вход...' : 'Войти'}
                    </button>
                </form>
                <p>
                    Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;