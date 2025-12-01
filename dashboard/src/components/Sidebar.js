import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { FiHome, FiSettings, FiEdit, FiList, FiChevronLeft, FiBarChart2, FiMessageSquare, FiUsers, FiShield, FiMic, FiHelpCircle, FiZap, FiCommand, FiRadio } from 'react-icons/fi';
import './Sidebar.css';

function Sidebar() {
    const location = useLocation();
    const { id } = useParams();

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    return (
        <div className="sidebar">
            <Link to="/servers" className="sidebar-back">
                <FiChevronLeft /> Back to Servers
            </Link>

            <div className="sidebar-menu">
                <Link 
                    to={`/server/${id}`}
                    className={`sidebar-item ${isActive(`/server/${id}`) && location.pathname === `/server/${id}` ? 'active' : ''}`}
                >
                    <FiHome /> Dashboard
                </Link>

                <Link 
                    to={`/server/${id}/analytics`}
                    className={`sidebar-item ${isActive(`/server/${id}/analytics`) ? 'active' : ''}`}
                >
                    <FiBarChart2 /> Analytics
                </Link>

                <div className="sidebar-divider">LOGS</div>

                <Link 
                    to={`/server/${id}/logs/messages`}
                    className={`sidebar-item ${isActive(`/server/${id}/logs/messages`) ? 'active' : ''}`}
                >
                    <FiMessageSquare /> Message Logs
                </Link>

                <Link 
                    to={`/server/${id}/logs/members`}
                    className={`sidebar-item ${isActive(`/server/${id}/logs/members`) ? 'active' : ''}`}
                >
                    <FiUsers /> Member Logs
                </Link>

                <Link 
                    to={`/server/${id}/logs/roles`}
                    className={`sidebar-item ${isActive(`/server/${id}/logs/roles`) ? 'active' : ''}`}
                >
                    <FiShield /> Role Logs
                </Link>

                <Link 
                    to={`/server/${id}/logs/voice`}
                    className={`sidebar-item ${isActive(`/server/${id}/logs/voice`) ? 'active' : ''}`}
                >
                    <FiMic /> Voice Logs
                </Link>

                <Link 
                    to={`/server/${id}/logs`}
                    className={`sidebar-item ${location.pathname === `/server/${id}/logs` ? 'active' : ''}`}
                >
                    <FiList /> Moderation Logs
                </Link>

                <div className="sidebar-divider">UTILITIES</div>

                <Link 
                    to={`/server/${id}/tickets`}
                    className={`sidebar-item ${isActive(`/server/${id}/tickets`) ? 'active' : ''}`}
                >
                    <FiHelpCircle /> Tickets
                </Link>

                <Link 
                    to={`/server/${id}/reactionroles`}
                    className={`sidebar-item ${isActive(`/server/${id}/reactionroles`) ? 'active' : ''}`}
                >
                    <FiZap /> Reaction Roles
                </Link>

                <Link 
                    to={`/server/${id}/customcommands`}
                    className={`sidebar-item ${isActive(`/server/${id}/customcommands`) ? 'active' : ''}`}
                >
                    <FiCommand /> Custom Commands
                </Link>

                <Link 
                    to={`/server/${id}/announcements`}
                    className={`sidebar-item ${isActive(`/server/${id}/announcements`) ? 'active' : ''}`}
                >
                    <FiRadio /> Announcements
                </Link>

                <div className="sidebar-divider">CONFIGURATION</div>

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
            </div>
        </div>
    );
}

export default Sidebar;