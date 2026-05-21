import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginSuccess, setLoading, setError, clearError } from '../store/slices/authSlice';

const RegisterPage = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { loading, error } = useAppSelector((state) => state.auth);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(clearError());

        if (!name || !email || !password || !confirmPassword) {
            dispatch(setError('Заполните все поля'));
            return;
        }

        if (password !== confirmPassword) {
            dispatch(setError('Пароли не совпадают'));
            return;
        }

        if (password.length < 8) {
            dispatch(setError('Пароль должен быть не менее 8 символов'));
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            dispatch(setError('Введите корректный email'));
            return;
        }

        dispatch(setLoading(true));

        setTimeout(() => {
            dispatch(loginSuccess({
                id: Date.now().toString(),
                name: name,
                email: email
            }));
            navigate('/dashboard');
            dispatch(setLoading(false));
        }, 500);
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <h1>Регистрация</h1>
                {error && <div className="auth-error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="auth-group">
                        <label>Имя</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ваше имя"
                        />
                    </div>
                    <div className="auth-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@mail.com"
                        />
                    </div>
                    <div className="auth-group">
                        <label>Пароль</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Минимум 8 символов"
                        />
                    </div>
                    <div className="auth-group">
                        <label>Подтверждение пароля</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Повторите пароль"
                        />
                    </div>
                    <button type="submit" disabled={loading}>
                        {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                    </button>
                </form>
                <p>
                    Уже есть аккаунт? <Link to="/login">Войти</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;