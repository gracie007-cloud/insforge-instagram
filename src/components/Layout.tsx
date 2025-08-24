import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Home, Search, PlusSquare, Heart, User, LogOut } from 'lucide-react';
import { authService } from '../services/auth';
import styles from './Layout.module.css';

export default function Layout() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('user_id');

  const handleLogout = () => {
    authService.logout();
  };

  return (
    <div className={styles.layout}>
      <nav className={styles.navbar}>
        <div className={styles.navContent}>
          <Link to="/" className={styles.logo}>
            Instagram
          </Link>
          
          <div className={styles.navLinks}>
            <Link to="/" className={styles.navLink}>
              <Home size={24} />
            </Link>
            <Link to="/explore" className={styles.navLink}>
              <Search size={24} />
            </Link>
            <Link to="/create" className={styles.navLink}>
              <PlusSquare size={24} />
            </Link>
            <Link to="/activity" className={styles.navLink}>
              <Heart size={24} />
            </Link>
            <Link to={`/profile/${userId}`} className={styles.navLink}>
              <User size={24} />
            </Link>
            <button onClick={handleLogout} className={styles.navLink}>
              <LogOut size={24} />
            </button>
          </div>
        </div>
      </nav>
      
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}