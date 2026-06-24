import React, { useEffect, useState } from 'react';
import { fetchTicketConfig, updateTicketConfig, fetchChannels, fetchRoles, fetchCategories } from '../../../api/ticketApi';

export default function TicketSettings({ guildId }) {
  const [config, setConfig] = useState(null);
  const [categories, setCategories] = useState([]);
  const [roles, setRoles] = useState([]);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchTicketConfig(guildId).catch(() => ({})),
      fetchCategories(guildId).catch(() => []),
      fetchRoles(guildId).catch(() => []),
      fetchChannels(guildId).catch(() => [])
    ]).then(([conf, cats, rols, chans]) => {
      setConfig(conf || {});
      setCategories(cats || []);
      setRoles(rols || []);
      setChannels(chans || []);
      setLoading(false);
    }).catch(console.error);
  }, [guildId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig({
      ...config,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleRolesChange = (e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) selected.push(options[i].value);
    }
    setConfig({ ...config, defaultSupportRoles: selected });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateTicketConfig(guildId, config);
      alert('Settings saved successfully!');
    } catch (e) {
      alert('Failed to save settings.');
    }
    setSaving(false);
  };

  if (loading) return <div className="animate-pulse h-64 bg-[#1a1a24] rounded-lg border border-[#2a2a3a]"></div>;

  return (
    <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-lg p-6 shadow-lg max-w-3xl">
      <h2 className="text-xl font-bold text-white mb-6">Ticket System Settings</h2>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#2a2a3a] pb-4">
          <div>
            <h3 className="text-white font-medium text-base">Enable Ticket System</h3>
            <p className="text-sm text-gray-400 mt-1">Turn on or off the ticket system completely.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" name="enabled" checked={config.enabled || false} onChange={handleChange} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5865F2]"></div>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Default Category</label>
            <select
              name="defaultCategoryId"
              value={config.defaultCategoryId || ''}
              onChange={handleChange}
              className="w-full bg-[#0f0f13] border border-[#2a2a3a] text-white rounded-lg focus:ring-[#5865F2] focus:border-[#5865F2] p-2.5 outline-none transition-colors hover:border-gray-600"
            >
              <option value="">Select Category...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Log Channel</label>
            <select
              name="logChannelId"
              value={config.logChannelId || ''}
              onChange={handleChange}
              className="w-full bg-[#0f0f13] border border-[#2a2a3a] text-white rounded-lg focus:ring-[#5865F2] focus:border-[#5865F2] p-2.5 outline-none transition-colors hover:border-gray-600"
            >
              <option value="">Select Channel...</option>
              {channels.map(c => <option key={c.id} value={c.id}>#{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Max Open Per User</label>
            <input
              type="number"
              name="maxOpenPerUser"
              value={config.maxOpenPerUser || 1}
              onChange={handleChange}
              min="1" max="10"
              className="w-full bg-[#0f0f13] border border-[#2a2a3a] text-white rounded-lg focus:ring-[#5865F2] focus:border-[#5865F2] p-2.5 outline-none transition-colors hover:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Auto-Delete Delay (sec)</label>
            <input
              type="number"
              name="autoDeleteDelay"
              value={config.autoDeleteDelay || 10}
              onChange={handleChange}
              min="0"
              className="w-full bg-[#0f0f13] border border-[#2a2a3a] text-white rounded-lg focus:ring-[#5865F2] focus:border-[#5865F2] p-2.5 outline-none transition-colors hover:border-gray-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Default Support Roles</label>
          <select
            multiple
            value={config.defaultSupportRoles || []}
            onChange={handleRolesChange}
            className="w-full bg-[#0f0f13] border border-[#2a2a3a] text-white rounded-lg focus:ring-[#5865F2] focus:border-[#5865F2] p-2.5 h-32 outline-none transition-colors hover:border-gray-600 custom-scrollbar"
          >
            {roles.map(r => (
              <option key={r.id} value={r.id} style={{ color: r.color !== '#000000' ? r.color : 'inherit' }} className="py-1 px-2">
                {r.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Hold Ctrl (or Cmd) to select multiple roles.</p>
        </div>

        <div className="flex items-center justify-between border-t border-[#2a2a3a] pt-4">
          <div>
            <h3 className="text-white font-medium text-base">Enable Transcripts</h3>
            <p className="text-sm text-gray-400 mt-1">Save an HTML transcript when a ticket is closed.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" name="transcriptsEnabled" checked={config.transcriptsEnabled || false} onChange={handleChange} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5865F2]"></div>
          </label>
        </div>

        <div className="pt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium rounded-lg transition-colors shadow-lg shadow-[#5865F2]/20 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
