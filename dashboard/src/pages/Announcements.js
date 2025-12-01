import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import './Settings.css';

function Announcements() {
  const { id: serverId } = useParams();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAnnouncements();
  }, [serverId, filter]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter !== 'all') {
        params.status = filter;
      }
      const response = await api.get(`/api/features/announcements/${serverId}`, { params });
      setAnnouncements(response.data.announcements || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error('Failed to load announcements');
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (announcementId) => {
    if (!window.confirm('Are you sure you want to cancel this announcement?')) return;

    try {
      await api.delete(`/api/features/announcements/${serverId}/${announcementId}`);
      toast.success('Announcement cancelled successfully');
      fetchAnnouncements();
    } catch (error) {
      console.error('Error cancelling announcement:', error);
      toast.error('Failed to cancel announcement');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffaa00',
      sent: '#00ff88',
      failed: '#ff4444',
      cancelled: '#888888',
    };
    return colors[status] || '#00d9ff';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      sent: '✅',
      failed: '❌',
      cancelled: '🚫',
    };
    return icons[status] || '📢';
  };

  if (loading) {
    return (
      <div className="page-layout">
        <Sidebar />
        <div className="page-content">
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading announcements...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-content">
        <div className="settings-container">
      <div className="settings-header">
        <h1>📢 Scheduled Announcements</h1>
        <div className="settings-actions">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
            <option value="all">All Announcements</option>
            <option value="pending">Pending</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="info-banner">
        <span>💡 Use /announce in Discord to schedule new announcements</span>
      </div>

      {announcements.length === 0 ? (
        <div className="no-data">
          <p>No announcements found</p>
          <span style={{ fontSize: '0.9rem', color: '#888' }}>
            Use /announce in Discord to schedule announcements
          </span>
        </div>
      ) : (
        <div className="announcements-list">
          {announcements.map((announcement) => (
            <div key={announcement._id} className="announcement-card">
              <div className="announcement-header">
                <span 
                  className="announcement-status"
                  style={{ 
                    backgroundColor: getStatusColor(announcement.status),
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    color: '#0a0e27',
                  }}
                >
                  {getStatusIcon(announcement.status)} {announcement.status?.toUpperCase()}
                </span>
                {announcement.status === 'pending' && (
                  <button 
                    className="btn-danger-small"
                    onClick={() => handleCancel(announcement._id)}
                  >
                    Cancel
                  </button>
                )}
              </div>

              <div className="announcement-content">
                {announcement.message && (
                  <div className="announcement-message">
                    <p>{announcement.message}</p>
                  </div>
                )}

                {announcement.embed && (
                  <div 
                    className="announcement-embed"
                    style={{
                      borderLeft: `4px solid ${announcement.embed.color || '#00d9ff'}`,
                      padding: '12px',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      borderRadius: '4px',
                      marginTop: '8px',
                    }}
                  >
                    {announcement.embed.title && (
                      <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '1.1rem' }}>
                        {announcement.embed.title}
                      </div>
                    )}
                    {announcement.embed.description && (
                      <div style={{ fontSize: '0.9rem', color: '#ccc' }}>
                        {announcement.embed.description}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="announcement-info">
                <div className="info-row">
                  <span className="info-label">Channel ID:</span>
                  <span className="info-value" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    {announcement.channelId}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Scheduled for:</span>
                  <span className="info-value">
                    {format(new Date(announcement.scheduledFor), 'MMM dd, yyyy HH:mm:ss')}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Created:</span>
                  <span className="info-value">
                    {format(new Date(announcement.createdAt), 'MMM dd, yyyy HH:mm:ss')}
                  </span>
                </div>
                {announcement.mentionEveryone && (
                  <div className="info-row">
                    <span className="feature-badge">@everyone mention</span>
                  </div>
                )}
                {announcement.mentionRoles && announcement.mentionRoles.length > 0 && (
                  <div className="info-row">
                    <span className="feature-badge">Role mentions ({announcement.mentionRoles.length})</span>
                  </div>
                )}
                {announcement.error && (
                  <div className="info-row">
                    <span className="info-label">Error:</span>
                    <span className="info-value" style={{ color: '#ff4444' }}>
                      {announcement.error}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
        </div>
      </div>
    </div>
  );
}

export default Announcements;
