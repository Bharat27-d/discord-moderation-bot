import React, { useState, useEffect } from 'react';
import { fetchChannels, deployPanel, redeployPanel } from '../../../api/ticketApi';

export default function PanelDeployButton({ guildId, panelId, isDeployed, onDeploySuccess }) {
  const [isOpen, setIsOpen] = useState(false);
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState('');
  const [deploying, setDeploying] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchChannels(guildId).then(setChannels).catch(console.error);
    }
  }, [isOpen, guildId]);

  const handleDeploy = async () => {
    if (!selectedChannel) return alert('Please select a channel');
    setDeploying(true);
    try {
      await deployPanel(guildId, panelId, selectedChannel);
      setIsOpen(false);
      onDeploySuccess();
    } catch (e) {
      alert('Failed to deploy.');
    }
    setDeploying(false);
  };

  const handleRedeploy = async () => {
    setDeploying(true);
    try {
      await redeployPanel(guildId, panelId);
      onDeploySuccess();
    } catch (e) {
      alert('Failed to redeploy.');
    }
    setDeploying(false);
  };

  if (isDeployed) {
    return (
      <button
        onClick={handleRedeploy}
        disabled={deploying}
        className="px-4 py-1.5 bg-[#5865F2]/10 hover:bg-[#5865F2]/20 text-[#5865F2] text-sm font-medium rounded transition-colors border border-[#5865F2]/20 disabled:opacity-50"
      >
        {deploying ? 'Redeploying...' : 'Redeploy'}
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-1.5 bg-[#5865F2] hover:bg-[#4752C4] text-white text-sm font-medium rounded transition-colors shadow-lg shadow-[#5865F2]/20"
      >
        Deploy
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Deploy Panel</h3>
            <p className="text-sm text-gray-400 mb-6">Select the channel where you want to deploy this ticket panel. The bot will send a message with the panel's embed and buttons.</p>
            
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="w-full bg-[#0f0f13] border border-[#2a2a3a] text-white rounded-lg focus:ring-[#5865F2] focus:border-[#5865F2] p-3 outline-none mb-6 transition-colors hover:border-gray-600"
            >
              <option value="">Select Channel...</option>
              {channels.map(c => <option key={c.id} value={c.id}>#{c.name}</option>)}
            </select>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-[#2a2a3a] hover:bg-[#3f3f4e] text-white text-sm font-medium rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeploy}
                disabled={deploying || !selectedChannel}
                className="px-6 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white text-sm font-medium rounded transition-colors disabled:opacity-50 shadow-lg shadow-[#5865F2]/20"
              >
                {deploying ? 'Deploying...' : 'Deploy Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
