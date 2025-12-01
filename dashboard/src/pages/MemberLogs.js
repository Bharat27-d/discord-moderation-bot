import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { format } from 'date-fns';
import Sidebar from '../components/Sidebar';
import './Logs.css';

function MemberLogs() {
  const { id: serverId } = useParams();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, [serverId, filter, page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {
        limit: 50,
        offset: (page - 1) * 50,
      };
      if (filter !== 'all') {
        params.action = filter;
      }
      const response = await api.get(`/api/features/logs/members/${serverId}`, { params });
      setLogs(response.data.logs || []);
      setTotalPages(Math.ceil((response.data.total || 0) / 50));
    } catch (error) {
      console.error('Error fetching member logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    const icons = {
      join: '📥',
      leave: '📤',
      nickname_change: '✏️',
      username_change: '🏷️',
      avatar_change: '🖼️',
    };
    return icons[action] || '👤';
  };

  const getActionColor = (action) => {
    const colors = {
      join: '#00ff88',
      leave: '#ff4444',
      nickname_change: '#ffaa00',
      username_change: '#00d9ff',
      avatar_change: '#aa00ff',
    };
    return colors[action] || '#00d9ff';
  };

  const isNewAccount = (accountAge) => {
    return accountAge !== undefined && accountAge < 7;
  };

  if (loading) {
    return (
      <div className="page-layout">
        <Sidebar />
        <div className="page-content">
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading member logs...</p>
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
        <h1>👥 Member Activity Logs</h1>
        <div className="logs-filters">
          <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} className="filter-select">
            <option value="all">All Actions</option>
            <option value="join">Joins</option>
            <option value="leave">Leaves</option>
            <option value="nickname_change">Nickname Changes</option>
            <option value="username_change">Username Changes</option>
            <option value="avatar_change">Avatar Changes</option>
          </select>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="no-logs">
          <p>No member logs found</p>
        </div>
      ) : (
        <>
          <div className="log-header-row">
            <div className="log-col">User</div>
            <div className="log-col">Action</div>
            <div className="log-col">Details</div>
            <div className="log-col">Account Age</div>
            <div className="log-col">Timestamp</div>
          </div>
          <div className="logs-list">
            {logs.map((log, index) => (
              <div key={log._id || index} className={`log-item ${isNewAccount(log.accountAge) ? 'new-account-warning' : ''}`}>
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
                    {getActionIcon(log.action)} {log.action?.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="log-content">
                  {log.action === 'join' && (
                    <div className="join-info">
                      <span>Member #{log.memberCount || 'N/A'}</span>
                      {isNewAccount(log.accountAge) && (
                        <span className="warning-badge">⚠️ New Account</span>
                      )}
                    </div>
                  )}
                  {log.action === 'leave' && log.roles && log.roles.length > 0 && (
                    <div className="roles-list">
                      Had {log.roles.length} role{log.roles.length !== 1 ? 's' : ''}
                    </div>
                  )}
                  {(log.action === 'nickname_change' || log.action === 'username_change') && (
                    <div className="change-details">
                      <span className="old-value">{log.oldValue || 'None'}</span>
                      <span style={{ margin: '0 8px', color: '#888' }}>→</span>
                      <span className="new-value">{log.newValue || 'None'}</span>
                    </div>
                  )}
                  {log.action === 'avatar_change' && (
                    <div className="avatar-change">
                      Avatar updated
                    </div>
                  )}
                </div>
                <div className="log-account-age">
                  {log.accountAge !== undefined ? (
                    <span className={isNewAccount(log.accountAge) ? 'age-warning' : 'age-normal'}>
                      {log.accountAge} day{log.accountAge !== 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span style={{ color: '#666' }}>-</span>
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

export default MemberLogs;
