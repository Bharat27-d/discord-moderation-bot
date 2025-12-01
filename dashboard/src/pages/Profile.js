import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import { FiLogOut, FiSun, FiMoon } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Profile.css';

function Profile() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    return (
        <>
            <Navbar />
            <div className="profile-page">
                <div className="container">
                    <div className="profile-container">
                        <div className="card">
                            <div className="profile-header">
                                <img 
                                    src={user.avatarUrl} 
                                    alt={user.username}
                                    className="profile-avatar"
                                />
                                <div className="profile-info">
                                    <h1>{user.username}</h1>
                                    <p className="profile-id">ID: {user.id}</p>
                                </div>
                            </div>

                            <div className="profile-section">
                                <h2>Account Information</h2>
                                <div className="profile-details">
                                    <div className="profile-detail-item">
                                        <span className="profile-detail-label">Username</span>
                                        <span className="profile-detail-value">{user.username}</span>
                                    </div>
                                    <div className="profile-detail-item">
                                        <span className="profile-detail-label">Discriminator</span>
                                        <span className="profile-detail-value">#{user.discriminator}</span>
                                    </div>
                                    <div className="profile-detail-item">
                                        <span className="profile-detail-label">User ID</span>
                                        <span className="profile-detail-value">{user.id}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="profile-section">
                                <h2>Preferences</h2>
                                <div className="profile-preferences">
                                    <div className="preference-item">
                                        <div>
                                            <h3>Theme</h3>
                                            <p>Choose your preferred theme</p>
                                        </div>
                                        <button 
                                            className="btn btn-secondary"
                                            onClick={toggleTheme}
                                        >
                                            {theme === 'dark' ? <FiSun /> : <FiMoon />}
                                            {theme === 'dark' ?  'Light Mode' : 'Dark Mode'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="profile-section">
                                <h2>Actions</h2>
                                <button 
                                    className="btn btn-danger"
                                    onClick={handleLogout}
                                >
                                    <FiLogOut /> Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Profile;