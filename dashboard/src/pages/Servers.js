import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiSettings, FiUsers } from 'react-icons/fi';
import './Servers.css';

function Servers() {
    const [servers, setServers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchServers();
    }, []);

    const fetchServers = async () => {
        try {
            const response = await api.get('/api/servers');
            setServers(response.data.servers);
        } catch (error) {
            console.error('Failed to fetch servers:', error);
            toast.error('Failed to load servers');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="loading">Loading servers...</div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="servers-page">
                <div className="container">
                    <div className="servers-header">
                        <h1>Your Servers</h1>
                        <p>Select a server to manage</p>
                    </div>

                    {servers.length === 0 ? (
                        <div className="servers-empty">
                            <h2>No servers found</h2>
                            <p>Make sure the bot is invited to your server and you have "Manage Server" permission</p>
                        </div>
                    ) : (
                        <div className="servers-grid">
                            {servers.map(server => (
                                <div 
                                    key={server.id} 
                                    className="server-card"
                                    onClick={() => navigate(`/server/${server.id}`)}
                                >
                                    {server.icon ? (
                                        <img 
                                            src={server.icon}
                                            alt={server.name}
                                            className="server-icon"
                                        />
                                    ) : (
                                        <div className="server-icon-placeholder">
                                            {server.name ? server.name.charAt(0) : '?'}
                                        </div>
                                    )}

                                    <div className="server-info">
                                        <h3>{server.name || 'Unknown Server'}</h3>
                                        <div className="server-stats">
                                            <span>
                                                <FiUsers size={14} />
                                                {server.memberCount || 0} members
                                            </span>
                                        </div>
                                    </div>

                                    <button className="server-manage-btn">
                                        <FiSettings /> Manage
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default Servers;