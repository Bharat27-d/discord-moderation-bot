import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTickets } from '../../../api/ticketApi';
import TicketFilters from './TicketFilters';
import TicketStatusBadge from './TicketStatusBadge';

export default function TicketTable({ guildId }) {
  const navigate = useNavigate();
  const [data, setData] = useState({ tickets: [], total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: 'all', page: 1, limit: 20, search: '', panelId: 'all' });

  useEffect(() => {
    setLoading(true);
    fetchTickets(guildId, filters).then(res => {
      setData(res);
      setLoading(false);
    }).catch(e => {
      console.error(e);
      setLoading(false);
    });
  }, [guildId, filters]);

  return (
    <div className="space-y-4">
      <TicketFilters guildId={guildId} filters={filters} setFilters={setFilters} total={data.total} />

      <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-lg overflow-hidden shadow-lg">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="text-xs text-gray-400 uppercase bg-[#20222e] border-b border-[#2a2a3a]">
            <tr>
              <th className="px-6 py-3">#</th>
              <th className="px-6 py-3">User</th>
              <th className="px-6 py-3">Topic</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Claimed By</th>
              <th className="px-6 py-3">Opened</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-[#2a2a3a] animate-pulse">
                  <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded w-8"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded w-24"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded w-32"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded w-16"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded w-24"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded w-24"></div></td>
                  <td className="px-6 py-4"><div className="h-6 bg-gray-700 rounded w-16"></div></td>
                </tr>
              ))
            ) : data.tickets.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">No tickets found.</td>
              </tr>
            ) : (
              data.tickets.map(ticket => (
                <tr key={ticket._id} className="border-b border-[#2a2a3a] hover:bg-[#1e1e2e] transition-colors">
                  <td className="px-6 py-4 font-medium text-white">#{ticket.ticketNumber}</td>
                  <td className="px-6 py-4">{ticket.userId}</td>
                  <td className="px-6 py-4 truncate max-w-[200px]">{ticket.topic}</td>
                  <td className="px-6 py-4"><TicketStatusBadge status={ticket.status} /></td>
                  <td className="px-6 py-4">{ticket.claimedBy || '-'}</td>
                  <td className="px-6 py-4">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => navigate(`/dashboard/${guildId}/tickets/${ticket._id}`)}
                      className="text-[#5865F2] hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-[#2a2a3a] bg-[#1a1a24]">
          <button
            disabled={filters.page === 1}
            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
            className="px-3 py-1 bg-[#2a2a3a] hover:bg-[#3f3f4e] transition-colors text-white rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-gray-400">Page {data.page} of {data.totalPages}</span>
          <button
            disabled={filters.page >= data.totalPages}
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
            className="px-3 py-1 bg-[#2a2a3a] hover:bg-[#3f3f4e] transition-colors text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
