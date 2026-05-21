import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { loginSuccess } from '../store/slices/authSlice';

const ProfilePage = () => {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);
    const documentsCount = useAppSelector((state) => state.documents.list.length);
    const [name, setName] = useState(user?.name || '');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleNameChange = (e: React.FormEvent) => {
        e.preventDefault();
        if (user) {
            dispatch(loginSuccess({ ...user, name: name }));
            setMessage('Имя изменено');
        }
        setTimeout(() => setMessage(''), 3000);
    };

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage('Пароли не совпадают');
        } else if (newPassword.length < 8) {
            setMessage('Пароль должен быть не менее 8 символов');
        } else {
            setMessage('Пароль изменён');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }
        setTimeout(() => setMessage(''), 3000);
    };

    if (!user) {
        return null;
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Профиль пользователя</h1>
            </div>
            <div className="profile-info">
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Количество документов:</strong> {documentsCount}</p>
                <p><strong>Дата регистрации:</strong> {user.createdAt || '05.21.2026'}</p>
            </div>

            <div className="profile-form">
                <h3>Изменить имя</h3>
                <form onSubmit={handleNameChange}>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="profile-input"
                    />
                    <button type="submit" className="profile-btn">Сохранить</button>
                </form>
            </div>

            <div className="profile-form">
                <h3>Сменить пароль</h3>
                <form onSubmit={handlePasswordChange}>
                    <input
                        type="password"
                        placeholder="Старый пароль"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="profile-input"
                    />
                    <input
                        type="password"
                        placeholder="Новый пароль"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="profile-input"
                    />
                    <input
                        type="password"
                        placeholder="Подтверждение пароля"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="profile-input"
                    />
                    <button type="submit" className="profile-btn">Сменить пароль</button>
                </form>
            </div>

            {message && <div className="profile-message">{message}</div>}
        </div>
    );
};

export default ProfilePage;