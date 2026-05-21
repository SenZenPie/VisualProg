import { Outlet, Link, useLocation } from 'react-router-dom';
import './Layout.css';

const Layout = () => {
    const location = useLocation();
    const isDashboard = location.pathname === '/dashboard';
    const isProfile = location.pathname === '/profile';

    return (
        <div className="layout">
            <header className="layout-header">
                <div className="logo">
                    <h1>Спридщит СибГУТИ продакшн</h1>
                </div>
                <nav className="layout-nav">
                    <Link to="/dashboard" className={isDashboard ? 'active' : ''}>Документы</Link>
                    <Link to="/profile" className={isProfile ? 'active' : ''}>Профиль</Link>
                </nav>
            </header>
            <main className="layout-main">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;