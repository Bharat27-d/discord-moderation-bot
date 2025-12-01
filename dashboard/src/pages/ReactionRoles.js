import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import './Settings.css';

function ReactionRoles() {
  const { id: serverId } = useParams();
  const [reactionRoles, setReactionRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReactionRoles();
  }, [serverId]);

  const fetchReactionRoles = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/features/reactionroles/${serverId}`);
      setReactionRoles(response.data.reactionRoles || []);
    } catch (error) {
      console.error('Error fetching reaction roles:', error);
      toast.error('Failed to load reaction roles');
      setReactionRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const getModeColor = (mode) => {
    const colors = {
      normal: '#00d9ff',
      unique: '#ffaa00',
      verify: '#00ff88',
    };
    return colors[mode] || '#00d9ff';
  };

  const getModeDescription = (mode) => {
    const descriptions = {
      normal: 'Users can have multiple roles',
      unique: 'Users can only have one role at a time',
      verify: 'Roles cannot be removed once given',
    };
    return descriptions[mode] || '';
  };

  if (loading) {
    return (
      <div className="page-layout">
        <Sidebar />
        <div className="page-content">
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading reaction roles...</p>
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
        <h1>⭐ Reaction Roles</h1>
        <span style={{ fontSize: '0.9rem', color: '#888' }}>
          Manage reaction role configurations - Use /reactionrole in Discord to create new setups
        </span>
      </div>

      {reactionRoles.length === 0 ? (
        <div className="no-data">
          <p>No reaction roles configured</p>
          <span style={{ fontSize: '0.9rem', color: '#888' }}>
            Use /reactionrole create in Discord to set up reaction roles
          </span>
        </div>
      ) : (
        <div className="reaction-roles-list">
          {reactionRoles.map((rr) => (
            <div key={rr._id} className="reaction-role-card">
              <div className="rr-header">
                <div>
                  <h3>{rr.title || 'Reaction Role Message'}</h3>
                  {rr.description && (
                    <p className="rr-description">{rr.description}</p>
                  )}
                </div>
                <span 
                  className="rr-mode-badge"
                  style={{ 
                    backgroundColor: getModeColor(rr.mode),
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    color: '#0a0e27',
                  }}
                >
                  {rr.mode?.toUpperCase() || 'NORMAL'}
                </span>
              </div>

              <div className="rr-info">
                <div className="info-row">
                  <span className="info-label">Mode:</span>
                  <span className="info-value">{getModeDescription(rr.mode)}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Message ID:</span>
                  <span className="info-value" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    {rr.messageId}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Channel ID:</span>
                  <span className="info-value" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    {rr.channelId}
                  </span>
                </div>
              </div>

              <div className="rr-roles">
                <h4>Emoji → Role Mappings:</h4>
                <div className="roles-grid">
                  {rr.roles?.map((role, index) => (
                    <div key={index} className="role-mapping">
                      <span className="emoji">{role.emoji}</span>
                      <span className="arrow">→</span>
                      <span 
                        className="role-name"
                        style={{
                          backgroundColor: rr.color || '#5865f2',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          color: '#fff',
                        }}
                      >
                        {role.roleName}
                      </span>
                    </div>
                  ))}
                </div>
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

export default ReactionRoles;
