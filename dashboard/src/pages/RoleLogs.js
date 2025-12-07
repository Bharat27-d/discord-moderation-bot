import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { format } from 'date-fns';
import Sidebar from '../components/Sidebar';
import './Logs.css';

function RoleLogs() {
  const { id: serverId } = useParams();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        limit: 50,
        offset: (page - 1) * 50,
      };
      if (filter !== 'all') {
        params.action = filter;
      }
      const response = await api.get(`/api/features/logs/roles/${serverId}`, { params });
      setLogs(response.data.logs || []);
      setTotalPages(Math.ceil((response.data.total || 0) / 50));
    } catch (error) {
      console.error('Error fetching role logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [serverId, filter, page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getActionIcon = (action) => {
    return action === 'added' ? '➕' : '➖';
  };

  const getActionColor = (action) => {
    return action === 'added' ? '#00ff88' : '#ff4444';
  };

  if (loading) {
    return (
      <div className="page-layout">
        <Sidebar />
        <div className="page-content">
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading role logs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-content">
        <div className="logs-container">
      <div className="logs-header">
        <h1>🎭 Role Change Logs</h1>
        <div className="logs-filters">
          <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} className="filter-select">
            <option value="all">All Actions</option>
            <option value="added">Added</option>
            <option value="removed">Removed</option>
          </select>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="no-logs">
          <p>No role logs found</p>
        </div>
      ) : (
        <>
          <div className="log-header-row">
            <div className="log-col">User</div>
            <div className="log-col">Action</div>
            <div className="log-col">Role</div>
            <div className="log-col">Moderator</div>
            <div className="log-col">Timestamp</div>
          </div>
          <div className="logs-list">
            {logs.map((log, index) => (
              <div key={log._id || index} className="log-item">
                <div className="log-user">
                  <img 
                    src={`https://cdn.discordapp.com/avatars/${log.userId}/${log.userAvatar || 'default'}.png`}
                    alt={log.userTag}
                    className="log-avatar"
                    onError={(e) => e.target.src = 'https://cdn.discordapp.com/embed/avatars/0.png'}
                  />
                  <span className="log-username">{log.userTag || 'Unknown User'}</span>
                </div>
                <div className="log-action">
                  <span className="log-badge" style={{ backgroundColor: getActionColor(log.action) }}>
                    {getActionIcon(log.action)} {log.action?.toUpperCase()}
                  </span>
                </div>
                <div className="log-role">
                  <span 
                    className="role-badge" 
                    style={{ 
                      backgroundColor: log.roleColor || '#99aab5',
                      color: '#fff',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                    }}
                  >
                    {log.roleName || 'Unknown Role'}
                  </span>
                </div>
                <div className="log-moderator">
                  {log.moderatorTag ? (
                    <div className="moderator-info">
                      <span className="moderator-tag">{log.moderatorTag}</span>
                    </div>
                  ) : (
                    <span style={{ color: '#666' }}>System</span>
                  )}
                </div>
                <div className="log-timestamp">
                  {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                </div>
              </div>
            ))}
          </div>

          <div className="pagination">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="pagination-btn"
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {page} of {totalPages}
            </span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        </>
      )}
        </div>
      </div>
    </div>
  );
}

export default RoleLogs;
