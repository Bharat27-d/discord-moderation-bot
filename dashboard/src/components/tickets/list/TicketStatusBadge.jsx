import React from 'react';

export default function TicketStatusBadge({ status }) {
  const config = {
    open: { color: '#57F287', label: 'Open', bg: 'rgba(87,242,135,0.1)' },
    closed: { color: '#ED4245', label: 'Closed', bg: 'rgba(237,66,69,0.1)' },
    claimed: { color: '#FEE75C', label: 'Claimed', bg: 'rgba(254,231,92,0.1)' },
  };

  const style = config[status] || config.open;

  return (
    <span 
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: style.color }}></span>
      {style.label}
    </span>
  );
}
