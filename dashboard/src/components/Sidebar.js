import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { FiHome, FiSettings, FiEdit, FiList, FiChevronLeft } from 'react-icons/fi';
import './Sidebar.css';

function Sidebar() {
    const location = useLocation();
    const { id } = useParams();

    const isActive = (path) => location.pathname === path;

    return (
        <div className="sidebar">
            <Link to="/servers" className="sidebar-back">
                <FiChevronLeft /> Back to Servers
            </Link>

            <div className="sidebar-menu">
                <Link 
                    to={`/server/${id}`}
                    className={`sidebar-item ${isActive(`/server/${id}`) ? 'active' : ''}`}
                >
                    <FiHome /> Dashboard
                </Link>

                <Link 
                    to={`/server/${id}/settings`}
                    className={`sidebar-item ${isActive(`/server/${id}/settings`) ? 'active' : ''}`}
                >
                    <FiSettings /> Settings
                </Link>

                <Link 
                    to={`/server/${id}/embed-builder`}
                    className={`sidebar-item ${isActive(`/server/${id}/embed-builder`) ? 'active' : ''}`}
                >
                    <FiEdit /> Embed Builder
                </Link>

                <Link 
                    to={`/server/${id}/logs`}
                    className={`sidebar-item ${isActive(`/server/${id}/logs`) ? 'active' : ''}`}
                >
                    <FiList /> Moderation Logs
                </Link>
            </div>
        </div>
    );
}

export default Sidebar;