import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiChevronLeft, FiChevronRight, FiFilter } from 'react-icons/fi';
import './Logs.css';

function Logs() {
    const { id } = useParams();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        action: '',
        userId: '',
        moderatorId: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    const actionTypes = [
        'Warn',
        'Mute',
        'Unmute',
        'Kick',
        'Ban',
        'Timeout',
        'Auto-Spam Detection',
        'Auto-Link Detection',
        'Auto-Mass Ping Detection',
        'Auto-Word Filter'
    ];

    useEffect(() => {
        fetchLogs();
    }, [id, currentPage, filters]);

    const fetchLogs = async () => {
        try {
            const params = new URLSearchParams({
                page: currentPage,
                limit: 25,
                ... filters
            });

            const response = await api.get(`/api/server/${id}/logs? ${params}`);
            setLogs(response.data.logs);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Failed to fetch logs:', error);
            toast.error('Failed to load logs');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setFilters({
            action: '',
            userId: '',
            moderatorId: ''
        });
        setCurrentPage(1);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date. toLocaleString();
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="page-layout">
                    <Sidebar />
                    <div className="loading">Loading logs...</div>
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
                        <div className="logs-header">
                            <h1>Moderation Logs</h1>
                            <button 
                                className="btn btn-secondary"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <FiFilter /> Filters
                            </button>
                        </div>

                        {showFilters && (
                            <div className="card filters-card">
                                <h3>Filter Logs</h3>
                                <div className="filters-grid">
                                    <div className="form-group">
                                        <label className="form-label">Action Type</label>
                                        <select 
                                            className="form-select"
                                            value={filters.action}
                                            onChange={(e) => handleFilterChange('action', e.target. value)}
                                        >
                                            <option value="">All Actions</option>
                                            {actionTypes. map(action => (
                                                <option key={action} value={action}>
                                                    {action}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">User ID</label>
                                        <input 
                                            type="text"
                                            className="form-input"
                                            value={filters.userId}
                                            onChange={(e) => handleFilterChange('userId', e.target.value)}
                                            placeholder="Filter by user ID"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Moderator ID</label>
                                        <input 
                                            type="text"
                                            className="form-input"
                                            value={filters. moderatorId}
                                            onChange={(e) => handleFilterChange('moderatorId', e.target.value)}
                                            placeholder="Filter by moderator ID"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <button 
                                            className="btn btn-secondary"
                                            onClick={clearFilters}
                                        >
                                            Clear Filters
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="card">
                            {logs.length === 0 ?  (
                                <p className="empty-state">No logs found</p>
                            ) : (
                                <>
                                    <div className="logs-table">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Case</th>
                                                    <th>Action</th>
                                                    <th>User ID</th>
                                                    <th>Moderator ID</th>
                                                    <th>Reason</th>
                                                    <th>Duration</th>
                                                    <th>Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {logs.map(log => (
                                                    <tr key={log._id}>
                                                        <td className="case-id">#{log.caseId}</td>
                                                        <td>
                                                            <span className={`action-badge action-${log.action. toLowerCase(). replace(/\s+/g, '-')}`}>
                                                                {log.action}
                                                            </span>
                                                        </td>
                                                        <td className="user-id">{log. userId}</td>
                                                        <td className="moderator-id">{log.moderatorId}</td>
                                                        <td className="reason-cell">{log.reason}</td>
                                                        <td>{log.duration || '-'}</td>
                                                        <td className="date-cell">{formatDate(log. timestamp)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {totalPages > 1 && (
                                        <div className="pagination">
                                            <button 
                                                className="btn btn-secondary"
                                                onClick={() => setCurrentPage(prev => Math. max(1, prev - 1))}
                                                disabled={currentPage === 1}
                                            >
                                                <FiChevronLeft /> Previous
                                            </button>
                                            
                                            <span className="pagination-info">
                                                Page {currentPage} of {totalPages}
                                            </span>
                                            
                                            <button 
                                                className="btn btn-secondary"
                                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                disabled={currentPage === totalPages}
                                            >
                                                Next <FiChevronRight />
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Logs;