import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiUsers, FiShield, FiAlertTriangle, FiActivity } from 'react-icons/fi';
import './Dashboard.css';

function Dashboard() {
    const { id } = useParams();
    const [server, setServer] = useState(null);
    const [stats, setStats] = useState(null);
    const [recentLogs, setRecentLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = useCallback(async () => {
        try {
            const [serverRes, logsRes] = await Promise.all([
                api.get(`/api/server/${id}`),
                api.get(`/api/server/${id}/logs?limit=5`)
            ]);

            setServer(serverRes.data);
            setRecentLogs(logsRes.data.logs);

            // Calculate stats from logs
            const allLogs = await api.get(`/api/server/${id}/logs?limit=1000`);
            const logs = allLogs.data.logs;
            
            setStats({
                totalCases: logs.length,
                warns: logs.filter(l => l.action === 'Warn').length,
                kicks: logs.filter(l => l.action === 'Kick').length,
                bans: logs.filter(l => l.action === 'Ban').length,
                automod: logs.filter(l => l.action.startsWith('Auto-')).length
            });

        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="page-layout">
                    <Sidebar />
                    <div className="loading">Loading dashboard...</div>
                </div>
            </>
        );
    }

    if (!server) {
        return (
            <>
                <Navbar />
                <div className="page-layout">
                    <Sidebar />
                    <div className="page-content">
                        <div className="container">
                            <div className="error">
                                <h2>Server not found</h2>
                                <p>The bot may not be in this server or you don't have permission to manage it.</p>
                                <p style={{ marginTop: '20px' }}>
                                    <strong>To invite the bot to your server:</strong><br/>
                                    Use the invite link with proper permissions.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="page-layout">
                <Sidebar />
                <div className="page-content">
                    <div className="container">
                        <div className="dashboard-header">
                            <div className="dashboard-server-info">
                                {server.icon && (
                                    <img 
                                        src={server.icon} 
                                        alt={server.name}
                                        className="dashboard-server-icon"
                                    />
                                )}
                                <div>
                                    <h1>{server.name}</h1>
                                    <p><FiUsers /> {server.memberCount || 0} members</p>
                                </div>
                            </div>
                        </div>

                        {stats && (
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-icon" style={{ backgroundColor: '#5865f2' }}>
                                        <FiShield size={24} />
                                    </div>
                                    <div className="stat-info">
                                        <h3>{stats.totalCases}</h3>
                                        <p>Total Cases</p>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon" style={{ backgroundColor: '#faa61a' }}>
                                        <FiAlertTriangle size={24} />
                                    </div>
                                    <div className="stat-info">
                                        <h3>{stats.warns}</h3>
                                        <p>Warnings</p>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon" style={{ backgroundColor: '#ed4245' }}>
                                        <FiActivity size={24} />
                                    </div>
                                    <div className="stat-info">
                                        <h3>{stats.kicks + stats.bans}</h3>
                                        <p>Kicks & Bans</p>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon" style={{ backgroundColor: '#3ba55d' }}>
                                        <FiShield size={24} />
                                    </div>
                                    <div className="stat-info">
                                        <h3>{stats.automod}</h3>
                                        <p>Auto-Mod Actions</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="card">
                            <h2>Recent Moderation Actions</h2>
                            {recentLogs.length === 0 ? (
                                <p className="empty-state">No moderation actions yet</p>
                            ) : (
                                <div className="logs-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Case</th>
                                                <th>Action</th>
                                                <th>User</th>
                                                <th>Moderator</th>
                                                <th>Reason</th>
                                                <th>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentLogs.map(log => (
                                                <tr key={log._id}>
                                                    <td>#{log.caseId}</td>
                                                    <td>
                                                        <span className={`action-badge action-${log.action.toLowerCase().replace(/\s+/g, '-')}`}>
                                                            {log.action}
                                                        </span>
                                                    </td>
                                                    <td>{log.userId}</td>
                                                    <td>{log.moderatorId}</td>
                                                    <td className="reason-cell">{log.reason}</td>
                                                    <td>{new Date(log.timestamp).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Dashboard;