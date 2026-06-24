import React, { useEffect, useState } from 'react';
import { fetchTicketStats } from '../../../api/ticketApi';

export default function TicketStatsCards({ guildId }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTicketStats(guildId).then(data => {
      setStats(data);
      setLoading(false);
    }).catch(e => {
      console.error(e);
      setLoading(false);
    });
  }, [guildId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-[#1a1a24] border border-[#2a2a3a] p-6 rounded-lg animate-pulse h-24"></div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-[#1a1a24] border border-[#2a2a3a] p-6 rounded-lg hover:shadow-[0_0_15px_rgba(87,242,135,0.1)] transition-shadow">
        <div className="text-gray-400 text-sm font-medium mb-1">Open Tickets</div>
        <div className="text-3xl font-bold text-[#57F287]">{stats.open}</div>
      </div>
      <div className="bg-[#1a1a24] border border-[#2a2a3a] p-6 rounded-lg hover:shadow-[0_0_15px_rgba(237,66,69,0.1)] transition-shadow">
        <div className="text-gray-400 text-sm font-medium mb-1">Closed Today</div>
        <div className="text-3xl font-bold text-[#ED4245]">{stats.closed}</div>
      </div>
      <div className="bg-[#1a1a24] border border-[#2a2a3a] p-6 rounded-lg hover:shadow-[0_0_15px_rgba(254,231,92,0.1)] transition-shadow">
        <div className="text-gray-400 text-sm font-medium mb-1">Claimed</div>
        <div className="text-3xl font-bold text-[#FEE75C]">{stats.claimed}</div>
      </div>
      <div className="bg-[#1a1a24] border border-[#2a2a3a] p-6 rounded-lg hover:shadow-[0_0_15px_rgba(88,101,242,0.1)] transition-shadow">
        <div className="text-gray-400 text-sm font-medium mb-1">Avg First Response</div>
        <div className="text-3xl font-bold text-[#5865F2]">{stats.avgFirstResponse}</div>
      </div>
    </div>
  );
}
