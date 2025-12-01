import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { format } from 'date-fns';
import Sidebar from '../components/Sidebar';
import './Logs.css';

function VoiceLogs() {
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
      const response = await api.get(`/api/features/logs/voice/${serverId}`, { params });
      setLogs(response.data.logs || []);
      setTotalPages(Math.ceil((response.data.total || 0) / 50));
    } catch (error) {
      console.error('Error fetching voice logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    const icons = {
      join: '🔵',
      leave: '🔴',
      move: '🔄',
      mute: '🔇',
      unmute: '🔊',
      deafen: '🔕',
      undeafen: '🔔',
      stream_start: '📹',
      stream_stop: '⏹️',
    };
    return icons[action] || '📢';
  };

  const getActionColor = (action) => {
    const colors = {
      join: '#00ff88',
      leave: '#ff4444',
      move: '#ffaa00',
      mute: '#888888',
      unmute: '#00d9ff',
      deafen: '#666666',
      undeafen: '#00d9ff',
      stream_start: '#aa00ff',
      stream_stop: '#888888',
    };
    return colors[action] || '#00d9ff';
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  if (loading) {
    return (
      <div className="page-layout">
        <Sidebar />
        <div className="page-content">
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading voice logs...</p>
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
        <h1>🎤 Voice Activity Logs</h1>
        <div className="logs-filters">
          <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} className="filter-select">
            <option value="all">All Actions</option>
            <option value="join">Joins</option>
            <option value="leave">Leaves</option>
            <option value="move">Moves</option>
            <option value="mute">Mutes</option>
            <option value="unmute">Unmutes</option>
            <option value="deafen">Deafens</option>
            <option value="undeafen">Undeafens</option>
            <option value="stream_start">Stream Starts</option>
            <option value="stream_stop">Stream Stops</option>
          </select>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="no-logs">
          <p>No voice logs found</p>
        </div>
      ) : (
        <>
          <div className="log-header-row">
            <div className="log-col">User</div>
            <div className="log-col">Action</div>
            <div className="log-col">Channel</div>
            <div className="log-col">Duration</div>
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
                    {getActionIcon(log.action)} {log.action?.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="log-channel">
                  {log.action === 'move' ? (
                    <>
                      <span className="channel-name">
                        📢 {log.oldChannelName || 'Unknown'}
                      </span>
                      <span style={{ margin: '0 8px', color: '#888' }}>→</span>
                      <span className="channel-name">
                        📢 {log.newChannelName || 'Unknown'}
                      </span>
                    </>
                  ) : (
                    <span className="channel-name">
                      📢 {log.channelName || log.oldChannelName || log.newChannelName || 'Unknown'}
                    </span>
                  )}
                </div>
                <div className="log-duration">
                  {log.duration ? (
                    <span className="duration-badge">{formatDuration(log.duration)}</span>
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

export default VoiceLogs;
