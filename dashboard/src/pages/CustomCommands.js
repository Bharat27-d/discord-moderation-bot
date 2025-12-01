import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import './Settings.css';

function CustomCommands() {
  const { id: serverId } = useParams();
  const [commands, setCommands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    trigger: '',
    response: '',
    embedTitle: '',
    embedDescription: '',
    embedColor: '#00d9ff',
  });

  useEffect(() => {
    fetchCommands();
  }, [serverId]);

  const fetchCommands = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/features/customcommands/${serverId}`);
      setCommands(response.data.commands || []);
    } catch (error) {
      console.error('Error fetching custom commands:', error);
      toast.error('Failed to load custom commands');
      setCommands([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.trigger || (!formData.response && !formData.embedDescription)) {
      toast.error('Please provide at least a trigger and response or embed description');
      return;
    }

    try {
      const payload = {
        trigger: formData.trigger,
        response: formData.response || '',
      };

      if (formData.embedTitle || formData.embedDescription) {
        payload.embed = {
          title: formData.embedTitle,
          description: formData.embedDescription,
          color: formData.embedColor,
        };
      }

      await api.post(`/api/features/customcommands/${serverId}`, payload);
      toast.success('Custom command created! Use it in Discord with !' + formData.trigger);
      setShowCreateModal(false);
      setFormData({ trigger: '', response: '', embedTitle: '', embedDescription: '', embedColor: '#00d9ff' });
      fetchCommands();
    } catch (error) {
      console.error('Error creating command:', error);
      toast.error(error.response?.data?.error || 'Failed to create command');
    }
  };

  const handleDelete = async (commandId, trigger) => {
    if (!window.confirm(`Are you sure you want to delete !${trigger}?`)) return;

    try {
      await api.delete(`/api/features/customcommands/${serverId}/${commandId}`);
      toast.success('Command deleted successfully');
      fetchCommands();
    } catch (error) {
      console.error('Error deleting command:', error);
      toast.error('Failed to delete command');
    }
  };

  if (loading) {
    return (
      <div className="page-layout">
        <Sidebar />
        <div className="page-content">
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading custom commands...</p>
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
        <h1>⚡ Custom Commands</h1>
        <button className="create-btn" onClick={() => setShowCreateModal(true)}>
          + Create Command
        </button>
      </div>

      {commands.length === 0 ? (
        <div className="no-data">
          <p>No custom commands created</p>
          <span style={{ fontSize: '0.9rem', color: '#888' }}>
            Create custom commands that users can trigger with ! prefix
          </span>
        </div>
      ) : (
        <div className="commands-grid">
          {commands.map((cmd) => (
            <div key={cmd._id} className="command-card">
              <div className="command-header">
                <span className="command-trigger">!{cmd.trigger}</span>
                <button 
                  className="btn-danger-small"
                  onClick={() => handleDelete(cmd._id, cmd.trigger)}
                >
                  🗑️
                </button>
              </div>

              <div className="command-content">
                {cmd.response && (
                  <div className="command-response">
                    <strong>Response:</strong>
                    <p>{cmd.response}</p>
                  </div>
                )}

                {cmd.embed && (
                  <div className="command-embed">
                    <strong>Embed:</strong>
                    <div 
                      className="embed-preview"
                      style={{ 
                        borderLeft: `4px solid ${cmd.embed.color || '#00d9ff'}`,
                        padding: '12px',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        borderRadius: '4px',
                        marginTop: '8px',
                      }}
                    >
                      {cmd.embed.title && <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{cmd.embed.title}</div>}
                      {cmd.embed.description && <div style={{ fontSize: '0.9rem' }}>{cmd.embed.description}</div>}
                    </div>
                  </div>
                )}

                <div className="command-stats">
                  <div className="stat-item">
                    <span className="stat-label">Uses:</span>
                    <span className="stat-value">{cmd.uses || 0}</span>
                  </div>
                  {cmd.cooldown && (
                    <div className="stat-item">
                      <span className="stat-label">Cooldown:</span>
                      <span className="stat-value">{cmd.cooldown}s</span>
                    </div>
                  )}
                  {cmd.deleteCommand && (
                    <span className="feature-badge">Auto-delete trigger</span>
                  )}
                </div>

                {cmd.allowedRoles && cmd.allowedRoles.length > 0 && (
                  <div className="command-restrictions">
                    <span className="restriction-label">Role restricted</span>
                  </div>
                )}

                {cmd.allowedChannels && cmd.allowedChannels.length > 0 && (
                  <div className="command-restrictions">
                    <span className="restriction-label">Channel restricted</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⚡ Create Custom Command</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate} className="modal-body">
              <div className="form-group">
                <label>Command Trigger *</label>
                <div className="input-with-prefix">
                  <span className="input-prefix">!</span>
                  <input
                    type="text"
                    value={formData.trigger}
                    onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
                    placeholder="hello"
                    required
                  />
                </div>
                <span className="form-hint">The word users will type after ! to trigger this command</span>
              </div>

              <div className="form-group">
                <label>Plain Text Response</label>
                <textarea
                  value={formData.response}
                  onChange={(e) => setFormData({ ...formData, response: e.target.value })}
                  placeholder="Hello! Welcome to the server!"
                  rows={3}
                />
              </div>

              <div className="form-divider">OR use an embed</div>

              <div className="form-group">
                <label>Embed Title</label>
                <input
                  type="text"
                  value={formData.embedTitle}
                  onChange={(e) => setFormData({ ...formData, embedTitle: e.target.value })}
                  placeholder="Welcome!"
                />
              </div>

              <div className="form-group">
                <label>Embed Description</label>
                <textarea
                  value={formData.embedDescription}
                  onChange={(e) => setFormData({ ...formData, embedDescription: e.target.value })}
                  placeholder="Welcome to our amazing server!"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Embed Color</label>
                <input
                  type="color"
                  value={formData.embedColor}
                  onChange={(e) => setFormData({ ...formData, embedColor: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Command
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}

export default CustomCommands;
