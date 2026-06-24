import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchTicket, deleteTicket } from '../../../api/ticketApi';
import TicketStatusBadge from '../list/TicketStatusBadge';
import TicketTranscriptViewer from './TicketTranscriptViewer';

export default function TicketDetail() {
  const { guildId, ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTicket(guildId, ticketId).then(data => {
      setTicket(data);
      setLoading(false);
    }).catch(e => {
      console.error(e);
      setLoading(false);
    });
  }, [guildId, ticketId]);

  const handleForceClose = async () => {
    if (window.confirm("Are you sure you want to force close this ticket? This will delete the channel.")) {
      await deleteTicket(guildId, ticket._id);
      navigate(`/dashboard/${guildId}/tickets`);
    }
  };

  if (loading) return (
    <div className="animate-pulse space-y-6">
      <div className="h-4 bg-gray-700 rounded w-24"></div>
      <div className="h-40 bg-[#1a1a24] rounded-lg"></div>
      <div className="h-64 bg-[#1a1a24] rounded-lg"></div>
    </div>
  );
  if (!ticket) return <div className="text-white text-center py-12">Ticket not found.</div>;

  return (
    <div className="space-y-6">
      <button 
        onClick={() => navigate(`/dashboard/${guildId}/tickets`)}
        className="text-gray-400 hover:text-white flex items-center text-sm font-medium transition-colors"
      >
        <span className="mr-2">←</span> Back to Tickets
      </button>

      <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-lg p-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-[#5865F2]"></div>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Ticket #{ticket.ticketNumber}</h1>
            <p className="text-gray-400 text-sm max-w-xl">{ticket.topic}</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <TicketStatusBadge status={ticket.status} />
            {ticket.status === 'open' && (
              <button 
                onClick={handleForceClose}
                className="px-4 py-1.5 bg-[#ED4245] hover:bg-[#c93739] text-white text-sm font-medium rounded transition-colors shadow-lg shadow-red-500/20"
              >
                Force Close
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm bg-[#0f0f13] p-4 rounded-lg border border-[#2a2a3a]">
          <div>
            <div className="text-gray-500 mb-1 text-xs uppercase tracking-wider font-semibold">Opened By</div>
            <div className="text-gray-200">{ticket.userId}</div>
          </div>
          <div>
            <div className="text-gray-500 mb-1 text-xs uppercase tracking-wider font-semibold">Claimed By</div>
            <div className="text-gray-200">{ticket.claimedBy || '-'}</div>
          </div>
          <div>
            <div className="text-gray-500 mb-1 text-xs uppercase tracking-wider font-semibold">Opened At</div>
            <div className="text-gray-200">{new Date(ticket.createdAt).toLocaleString()}</div>
          </div>
          <div>
            <div className="text-gray-500 mb-1 text-xs uppercase tracking-wider font-semibold">Closed At</div>
            <div className="text-gray-200">{ticket.closedAt ? new Date(ticket.closedAt).toLocaleString() : '-'}</div>
          </div>
        </div>
      </div>

      <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-lg p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-[#5865F2]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
          Description
        </h2>
        <div className="text-gray-300 whitespace-pre-wrap bg-[#0f0f13] p-5 rounded-md border border-[#2a2a3a] leading-relaxed">
          {ticket.description || 'No description provided.'}
        </div>
      </div>

      <TicketTranscriptViewer transcriptUrl={ticket.transcriptUrl} />
    </div>
  );
}
