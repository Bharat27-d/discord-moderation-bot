import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPanels, deletePanel, undeployPanel } from '../../../api/ticketApi';
import PanelDeployButton from './PanelDeployButton';

export default function PanelList({ guildId }) {
  const [panels, setPanels] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadPanels = () => {
    fetchPanels(guildId).then(data => {
      setPanels(data);
      setLoading(false);
    }).catch(console.error);
  };

  useEffect(() => {
    loadPanels();
  }, [guildId]);

  const handleDelete = async (panelId) => {
    if (window.confirm("Are you sure you want to delete this panel? This will remove the deployed message.")) {
      await deletePanel(guildId, panelId);
      loadPanels();
    }
  };

  const handleUndeploy = async (panelId) => {
    if (window.confirm("Are you sure you want to undeploy this panel?")) {
      await undeployPanel(guildId, panelId);
      loadPanels();
    }
  };

  if (loading) return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
      {[1,2].map(i => <div key={i} className="h-48 bg-[#1a1a24] rounded-lg"></div>)}
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Ticket Panels</h2>
        <button
          onClick={() => navigate(`/dashboard/${guildId}/tickets/panels/new`)}
          className="px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium rounded-lg transition-colors shadow-lg shadow-[#5865F2]/20"
        >
          + Create New Panel
        </button>
      </div>

      {panels.length === 0 ? (
        <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-lg p-12 text-center shadow-lg">
          <div className="text-5xl mb-4">🎫</div>
          <h3 className="text-xl font-bold text-white mb-2">No panels yet</h3>
          <p className="text-gray-400 mb-6">Create your first ticket panel to allow users to open tickets.</p>
          <button
            onClick={() => navigate(`/dashboard/${guildId}/tickets/panels/new`)}
            className="px-6 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium rounded-lg transition-colors shadow-lg shadow-[#5865F2]/20"
          >
            Create Panel
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {panels.map(panel => (
            <div key={panel._id} className="bg-[#1a1a24] border border-[#2a2a3a] rounded-lg p-6 shadow-lg flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: panel.embed?.color || '#5865F2' }}></div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-3">
                    {panel.name}
                    {panel.isDeployed ? (
                      <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-xs rounded-full font-medium border border-green-500/20">Deployed</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-gray-500/10 text-gray-400 text-xs rounded-full font-medium border border-gray-500/20">Draft</span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {panel.buttons?.length || 0} Button{panel.buttons?.length !== 1 && 's'}
                  </p>
                </div>
              </div>

              {panel.isDeployed && panel.deployedAt && (
                <div className="bg-[#0f0f13] border border-[#2a2a3a] p-3 rounded-md mb-4 text-sm text-gray-300 flex items-center">
                  <div className="relative flex h-2 w-2 mr-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </div>
                  Deployed on <span className="text-gray-500 ml-2">{new Date(panel.deployedAt).toLocaleDateString()}</span>
                </div>
              )}

              <div className="mt-auto pt-4 border-t border-[#2a2a3a] flex flex-wrap gap-2">
                <button
                  onClick={() => navigate(`/dashboard/${guildId}/tickets/panels/${panel._id}/edit`)}
                  className="px-4 py-1.5 bg-[#2a2a3a] hover:bg-[#3f3f4e] text-white text-sm font-medium rounded transition-colors"
                >
                  Edit
                </button>
                <PanelDeployButton 
                  guildId={guildId} 
                  panelId={panel._id} 
                  isDeployed={panel.isDeployed} 
                  onDeploySuccess={loadPanels}
                />
                {panel.isDeployed && (
                  <button
                    onClick={() => handleUndeploy(panel._id)}
                    className="px-4 py-1.5 bg-[#ED4245]/10 hover:bg-[#ED4245]/20 text-[#ED4245] text-sm font-medium rounded transition-colors border border-[#ED4245]/20"
                  >
                    Undeploy
                  </button>
                )}
                <button
                  onClick={() => handleDelete(panel._id)}
                  className="px-4 py-1.5 ml-auto text-gray-400 hover:text-red-400 hover:bg-red-500/10 text-sm font-medium rounded transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
