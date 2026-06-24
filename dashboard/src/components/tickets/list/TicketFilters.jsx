import React, { useEffect, useState } from 'react';
import { fetchPanels } from '../../../api/ticketApi';

export default function TicketFilters({ guildId, filters, setFilters, total }) {
  const [panels, setPanels] = useState([]);
  const [searchInput, setSearchInput] = useState(filters.search || '');

  useEffect(() => {
    fetchPanels(guildId).then(setPanels).catch(console.error);
  }, [guildId]);

  useEffect(() => {
    const delay = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
    }, 300);
    return () => clearTimeout(delay);
  }, [searchInput, setFilters]);

  const statuses = ['all', 'open', 'closed', 'claimed'];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
      <div className="flex items-center space-x-2">
        {statuses.map(s => (
          <button
            key={s}
            onClick={() => setFilters({ ...filters, status: s, page: 1 })}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filters.status === s ? 'bg-[#5865F2] text-white' : 'bg-[#1a1a24] border border-[#2a2a3a] text-gray-400 hover:text-white'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex items-center space-x-4">
        <select
          value={filters.panelId || 'all'}
          onChange={(e) => setFilters({ ...filters, panelId: e.target.value, page: 1 })}
          className="bg-[#1a1a24] border border-[#2a2a3a] text-white text-sm rounded-lg focus:ring-[#5865F2] focus:border-[#5865F2] p-2.5 outline-none"
        >
          <option value="all">All Panels</option>
          {panels.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
        
        <input
          type="text"
          placeholder="Search tickets..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="bg-[#1a1a24] border border-[#2a2a3a] text-white text-sm rounded-lg focus:ring-[#5865F2] focus:border-[#5865F2] p-2.5 w-64 outline-none"
        />
        
        <div className="text-sm text-gray-400">
          {total} results
        </div>
      </div>
    </div>
  );
}
