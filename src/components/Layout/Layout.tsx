import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import './Layout.css';

const Layout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
    const userName = useAppSelector((state) => state.auth.user?.name);
    const isDashboard = location.pathname === '/dashboard';
    const isProfile = location.pathname === '/profile';

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <div className="layout">
            <header className="layout-header">
                <div className="logo">
                    <h1>Spreadsheet App</h1>
                </div>
                {isAuthenticated && (
                    <div className="user-info">
                        <span className="user-name">{userName}</span>
                        <button onClick={handleLogout} className="logout-btn">Выйти</button>
                    </div>
                )}
            </header>
            <div className="layout-container">
                <aside className="layout-sidebar">
                    <nav className="sidebar-nav">
                        <Link to="/dashboard" className={isDashboard ? 'active' : ''}>
                            Документы
                        </Link>
                        <Link to="/profile" className={isProfile ? 'active' : ''}>
                            Профиль
                        </Link>
                    </nav>
                </aside>
                <main className="layout-main">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;