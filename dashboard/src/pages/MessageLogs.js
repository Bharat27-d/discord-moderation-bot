import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { format } from 'date-fns';
import Sidebar from '../components/Sidebar';
import './Logs.css';

function MessageLogs() {
  const { id: serverId } = useParams();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ action: 'all', channel: 'all' });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchLogs();
  }, [serverId, filter, page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: 50,
        offset: page * 50
      });
      
      if (filter.action !== 'all') params.append('action', filter.action);
      if (filter.channel !== 'all') params.append('channelId', filter.channel);

      const response = await api.get(`/api/features/logs/messages/${serverId}?${params}`);
      setLogs(response.data.logs);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Error fetching message logs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-content">
        <div className="logs-container">
          <div className="logs-header">
        <h1>📝 Message Logs</h1>
        <div className="filters">
          <select 
            value={filter.action} 
            onChange={(e) => setFilter({...filter, action: e.target.value})}
            className="filter-select"
          >
            <option value="all">All Actions</option>
            <option value="deleted">Deleted</option>
            <option value="edited">Edited</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading logs...</p>
        </div>
      ) : (
        <>
          <div className="logs-count">
            Showing {logs.length} of {total} logs
          </div>

          <div className="logs-list">
            {logs.map((log, index) => (
              <div key={index} className={`log-item ${log.action}`}>
                <div className="log-header-row">
                  <div className="log-avatar">
                    {log.authorAvatar && (
                      <img src={log.authorAvatar} alt={log.authorTag} />
                    )}
                  </div>
                  <div className="log-user-info">
                    <div className="log-user-tag">{log.authorTag}</div>
                    <div className="log-meta">
                      <span className="log-channel">#{log.channelName}</span>
                      <span className="log-time">
                        {format(new Date(log.timestamp), 'MMM d, yyyy HH:mm:ss')}
                      </span>
                    </div>
                  </div>
                  <div className={`log-badge ${log.action}`}>
                    {log.action === 'deleted' ? '🗑️ Deleted' : '✏️ Edited'}
                  </div>
                </div>

                {log.action === 'deleted' && log.content && (
                  <div className="log-content">
                    <div className="content-label">Message:</div>
                    <div className="content-text">{log.content}</div>
                  </div>
                )}

                {log.action === 'edited' && (
                  <>
                    {log.oldContent && (
                      <div className="log-content old">
                        <div className="content-label">Before:</div>
                        <div className="content-text">{log.oldContent}</div>
                      </div>
                    )}
                    {log.newContent && (
                      <div className="log-content new">
                        <div className="content-label">After:</div>
                        <div className="content-text">{log.newContent}</div>
                      </div>
                    )}
                  </>
                )}

                {log.attachments && log.attachments.length > 0 && (
                  <div className="log-attachments">
                    <div className="content-label">Attachments:</div>
                    {log.attachments.map((att, i) => (
                      <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" className="attachment-link">
                        📎 {att.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {total > 50 && (
            <div className="pagination">
              <button 
                onClick={() => setPage(Math.max(0, page - 1))} 
                disabled={page === 0}
                className="page-btn"
              >
                Previous
              </button>
              <span className="page-info">Page {page + 1} of {Math.ceil(total / 50)}</span>
              <button 
                onClick={() => setPage(page + 1)} 
                disabled={(page + 1) * 50 >= total}
                className="page-btn"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
        </div>
      </div>
    </div>
  );
}

export default MessageLogs;
