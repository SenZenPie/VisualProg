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