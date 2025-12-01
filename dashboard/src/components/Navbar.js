import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FiSun, FiMoon, FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import './Navbar.css';

function Navbar() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/servers" className="navbar-logo">
                    <img 
                        src="https://i.postimg.cc/Jhh44yyT/modmatrix.png" 
                        alt="ModMatrix Logo" 
                        className="navbar-logo-img"
                    />
                    <span>ModMatrix</span>
                </Link>

                <button 
                    className="navbar-mobile-toggle"
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                >
                    {showMobileMenu ? <FiX size={24} /> : <FiMenu size={24} />}
                </button>

                <div className={`navbar-menu ${showMobileMenu ? 'active' : ''}`}>
                    <Link to="/servers" className="navbar-link">
                        Servers
                    </Link>

                    <button 
                        className="navbar-theme-toggle"
                        onClick={toggleTheme}
                        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    >
                        {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
                    </button>

                    {user && (
                        <div className="navbar-user">
                            <button 
                                className="navbar-user-button"
                                onClick={() => setShowUserMenu(!showUserMenu)}
                            >
                                <img 
                                    src={user.avatarUrl} 
                                    alt={user.username}
                                    className="navbar-user-avatar"
                                />
                                <span>{user.username}</span>
                            </button>

                            {showUserMenu && (
                                <div className="navbar-user-menu">
                                    <Link 
                                        to="/profile" 
                                        className="navbar-user-menu-item"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        <FiUser /> Profile
                                    </Link>
                                    <button 
                                        className="navbar-user-menu-item"
                                        onClick={handleLogout}
                                    >
                                        <FiLogOut /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;