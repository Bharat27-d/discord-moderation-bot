import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchTicketStats } from '../../../api/ticketApi';

export default function TicketActivityChart({ guildId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTicketStats(guildId).then(res => {
      setData(res.ticketsLast30Days || []);
      setLoading(false);
    }).catch(e => {
      console.error(e);
      setLoading(false);
    });
  }, [guildId]);

  if (loading) {
    return <div className="bg-[#1a1a24] border border-[#2a2a3a] p-6 rounded-lg animate-pulse h-80"></div>;
  }

  return (
    <div className="bg-[#1a1a24] border border-[#2a2a3a] p-6 rounded-lg">
      <h2 className="text-lg font-semibold mb-4 text-white">Ticket Activity (Last 30 Days)</h2>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorOpened" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#5865F2" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#5865F2" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorClosed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#57F287" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#57F287" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" vertical={false} />
            <XAxis dataKey="date" stroke="#6b7280" tick={{ fill: '#6b7280' }} tickLine={false} axisLine={false} />
            <YAxis stroke="#6b7280" tick={{ fill: '#6b7280' }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: '8px' }}
              itemStyle={{ color: '#fff' }}
            />
            <Area type="monotone" dataKey="opened" stroke="#5865F2" fillOpacity={1} fill="url(#colorOpened)" name="Opened" />
            <Area type="monotone" dataKey="closed" stroke="#57F287" fillOpacity={1} fill="url(#colorClosed)" name="Closed" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
