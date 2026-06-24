import React, { useState } from 'react';
import { useParams, Routes, Route, useLocation } from 'react-router-dom';
import TicketStatsCards from '../../components/tickets/overview/TicketStatsCards';
import TicketActivityChart from '../../components/tickets/overview/TicketActivityChart';
import TicketTable from '../../components/tickets/list/TicketTable';
import PanelList from '../../components/tickets/panels/PanelList';
import TicketSettings from '../../components/tickets/settings/TicketSettings';
import TicketDetail from '../../components/tickets/detail/TicketDetail';
import PanelBuilder from '../../components/tickets/panels/PanelBuilder';

export default function TicketsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const location = useLocation();
  const { guildId } = useParams();

  const isRoot = location.pathname.endsWith('/tickets') || location.pathname.endsWith('/tickets/');

  if (!isRoot) {
    return (
      <Routes>
        <Route path=":ticketId" element={<TicketDetail />} />
        <Route path="panels/new" element={<PanelBuilder />} />
        <Route path="panels/:panelId/edit" element={<PanelBuilder />} />
      </Routes>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'tickets', label: 'Tickets' },
    { id: 'panels', label: 'Panels' },
    { id: 'settings', label: 'Settings' }
  ];

  return (
    <div className="p-6 text-gray-200 min-h-screen" style={{ backgroundColor: '#0f0f13' }}>
      <h1 className="text-3xl font-bold mb-6 text-white">Ticket System</h1>
      
      <div className="flex space-x-4 border-b border-gray-700 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 px-2 font-medium text-sm transition-colors relative ${
              activeTab === tab.id ? 'text-[#5865F2]' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#5865F2] rounded-t-md" />
            )}
          </button>
        ))}
      </div>

      <div>
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <TicketStatsCards guildId={guildId} />
            <TicketActivityChart guildId={guildId} />
          </div>
        )}
        {activeTab === 'tickets' && <TicketTable guildId={guildId} />}
        {activeTab === 'panels' && <PanelList guildId={guildId} />}
        {activeTab === 'settings' && <TicketSettings guildId={guildId} />}
      </div>
    </div>
  );
}
