import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import './Settings.css';

function Tickets() {
  const { id: serverId } = useParams();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [serverId, filter]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter !== 'all') {
        params.status = filter;
      }
      const response = await api.get(`/api/features/tickets/${serverId}`, { params });
      setTickets(response.data.tickets || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load tickets');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const viewTranscript = (ticket) => {
    setSelectedTicket(ticket);
    setShowTranscript(true);
  };

  const closeModal = () => {
    setShowTranscript(false);
    setSelectedTicket(null);
  };

  const getStatusColor = (status) => {
    return status === 'open' ? '#00ff88' : '#888888';
  };

  const getStatusIcon = (status) => {
    return status === 'open' ? '🟢' : '⚫';
  };

  if (loading) {
    return (
      <div className="page-layout">
        <Sidebar />
        <div className="page-content">
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading tickets...</p>
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
        <h1>🎫 Support Tickets</h1>
        <div className="settings-actions">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
            <option value="all">All Tickets</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="no-data">
          <p>No tickets found</p>
          <span style={{ fontSize: '0.9rem', color: '#888' }}>
            Use /ticket-setup in Discord to configure the ticket system
          </span>
        </div>
      ) : (
        <div className="tickets-grid">
          {tickets.map((ticket) => (
            <div key={ticket._id} className="ticket-card">
              <div className="ticket-header">
                <div className="ticket-number">
                  <span className="ticket-label">Ticket</span>
                  <span className="ticket-id">#{ticket.ticketNumber}</span>
                </div>
                <span className="ticket-status" style={{ color: getStatusColor(ticket.status) }}>
                  {getStatusIcon(ticket.status)} {ticket.status.toUpperCase()}
                </span>
              </div>

              <div className="ticket-info">
                <div className="info-row">
                  <span className="info-label">User:</span>
                  <span className="info-value">{ticket.userTag || 'Unknown'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Category:</span>
                  <span className="info-value">{ticket.category || 'General'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Created:</span>
                  <span className="info-value">
                    {format(new Date(ticket.createdAt), 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>
                {ticket.claimedBy && (
                  <div className="info-row">
                    <span className="info-label">Claimed by:</span>
                    <span className="info-value">{ticket.claimedBy}</span>
                  </div>
                )}
                {ticket.closedBy && (
                  <div className="info-row">
                    <span className="info-label">Closed by:</span>
                    <span className="info-value">{ticket.closedBy}</span>
                  </div>
                )}
                {ticket.closeReason && (
                  <div className="info-row">
                    <span className="info-label">Reason:</span>
                    <span className="info-value">{ticket.closeReason}</span>
                  </div>
                )}
              </div>

              <div className="ticket-messages">
                <span className="messages-count">
                  {ticket.messages?.length || 0} message{ticket.messages?.length !== 1 ? 's' : ''}
                </span>
              </div>

              {ticket.transcript && (
                <button 
                  className="btn-primary"
                  onClick={() => viewTranscript(ticket)}
                  style={{ marginTop: '12px', width: '100%' }}
                >
                  📄 View Transcript
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showTranscript && selectedTicket && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📄 Ticket #{selectedTicket.ticketNumber} Transcript</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="transcript-content">
                {selectedTicket.transcript ? (
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                    {selectedTicket.transcript}
                  </pre>
                ) : (
                  <p style={{ color: '#888' }}>No transcript available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}

export default Tickets;
