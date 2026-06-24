import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPanel, createPanel, updatePanel, fetchRoles, fetchCategories } from '../../../api/ticketApi';
import PanelPreview from './PanelPreview';
import PanelButtonEditor from './PanelButtonEditor';
import PanelDeployButton from './PanelDeployButton';

export default function PanelBuilder() {
  const { guildId, panelId } = useParams();
  const navigate = useNavigate();
  
  const isEdit = !!panelId;
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState([]);
  const [categories, setCategories] = useState([]);

  const [name, setName] = useState('New Panel');
  const [embed, setEmbed] = useState({
    title: 'Open a Ticket',
    description: 'Click a button below to open a support ticket.',
    color: '#5865F2',
    thumbnailUrl: '',
    imageUrl: '',
    footerText: '',
    showTimestamp: true
  });
  const [buttons, setButtons] = useState([{
    label: 'Create Ticket',
    emoji: '🎫',
    style: 'primary',
    categoryId: null,
    supportRoles: [],
    namingFormat: 'ticket-{username}-{number}',
    welcomeMessage: 'Welcome to your ticket!',
    modalFields: [{ label: 'Reason', placeholder: 'Why do you need support?', style: 'paragraph', required: true }]
  }]);
  
  const [panelData, setPanelData] = useState(null);

  useEffect(() => {
    Promise.all([
      fetchRoles(guildId).catch(() => []),
      fetchCategories(guildId).catch(() => [])
    ]).then(([rols, cats]) => {
      setRoles(rols || []);
      setCategories(cats || []);
    });

    if (isEdit) {
      fetchPanel(guildId, panelId).then(data => {
        setPanelData(data);
        setName(data.name || '');
        setEmbed(data.embed || embed);
        setButtons(data.buttons || buttons);
        setLoading(false);
      }).catch(e => {
        console.error(e);
        navigate(`/dashboard/${guildId}/tickets`);
      });
    } else {
      setLoading(false);
    }
  }, [guildId, panelId, isEdit, navigate]);

  const handleSave = async (deployAfter = false) => {
    if (!name.trim()) return alert('Panel name is required.');
    if (buttons.length === 0) return alert('At least one button is required.');
    
    setSaving(true);
    const data = { name, embed, buttons };
    
    try {
      if (isEdit) {
        await updatePanel(guildId, panelId, data);
        alert('Panel updated successfully.');
      } else {
        const newPanel = await createPanel(guildId, data);
        alert('Panel created successfully.');
        navigate(`/dashboard/${guildId}/tickets/panels/${newPanel._id}/edit`, { replace: true });
        setPanelData(newPanel);
      }
    } catch (e) {
      alert('Failed to save panel.');
    }
    setSaving(false);
  };

  if (loading) return (
    <div className="min-h-screen p-6 space-y-6 animate-pulse">
      <div className="h-10 w-64 bg-gray-700 rounded mb-6"></div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 h-96 bg-[#1a1a24] rounded-lg"></div>
        <div className="lg:col-span-4 h-96 bg-[#1a1a24] rounded-lg"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0f0f13' }}>
      <div className="sticky top-0 z-30 bg-[#0f0f13]/90 backdrop-blur-md border-b border-[#2a2a3a] px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(`/dashboard/${guildId}/tickets`)}
            className="text-gray-400 hover:text-white transition-colors bg-[#1a1a24] p-2 rounded-lg border border-[#2a2a3a] hover:border-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
          <h1 className="text-xl font-bold text-white">
            {isEdit ? 'Edit Panel' : 'Create Panel'}
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-5 py-2.5 bg-[#2a2a3a] hover:bg-[#3f3f4e] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 border border-transparent hover:border-gray-600"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          
          {isEdit && panelData && (
            <PanelDeployButton 
              guildId={guildId}
              panelId={panelId}
              isDeployed={panelData.isDeployed}
              onDeploySuccess={() => fetchPanel(guildId, panelId).then(setPanelData)}
            />
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          
          <div className="xl:col-span-7 2xl:col-span-8 space-y-6">
            <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-xl p-6 shadow-lg">
              <h2 className="text-lg font-bold text-white mb-4 border-b border-[#2a2a3a] pb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#5865F2]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                General Settings
              </h2>
              
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Internal Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="e.g. Support Panel"
                  className="w-full bg-[#0f0f13] border border-[#2a2a3a] text-white rounded-lg p-3 outline-none transition-colors hover:border-gray-600 focus:border-[#5865F2]" 
                />
                <p className="text-xs text-gray-500 mt-2">Only visible in the dashboard to help you identify it.</p>
              </div>
            </div>

            <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-white mb-5 border-b border-[#2a2a3a] pb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#5865F2]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path></svg>
                Embed Configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Title</label>
                  <input 
                    type="text" 
                    value={embed.title || ''} 
                    onChange={e => setEmbed({...embed, title: e.target.value})} 
                    className="w-full bg-[#0f0f13] border border-[#2a2a3a] text-white rounded-lg p-2.5 outline-none transition-colors hover:border-gray-600 focus:border-[#5865F2]" 
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Description</label>
                  <textarea 
                    value={embed.description || ''} 
                    onChange={e => setEmbed({...embed, description: e.target.value})} 
                    rows={4}
                    className="w-full bg-[#0f0f13] border border-[#2a2a3a] text-white rounded-lg p-3 outline-none transition-colors hover:border-gray-600 focus:border-[#5865F2]" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Accent Color (Hex)</label>
                  <div className="flex gap-3 items-center">
                    <div className="relative w-10 h-10 rounded overflow-hidden border border-[#2a2a3a] shrink-0 cursor-pointer">
                      <input 
                        type="color" 
                        value={embed.color || '#5865F2'} 
                        onChange={e => setEmbed({...embed, color: e.target.value})} 
                        className="absolute -top-2 -left-2 w-14 h-14 cursor-pointer" 
                      />
                    </div>
                    <input 
                      type="text" 
                      value={embed.color || ''} 
                      onChange={e => setEmbed({...embed, color: e.target.value})} 
                      className="flex-1 bg-[#0f0f13] border border-[#2a2a3a] text-white rounded-lg p-2 outline-none transition-colors hover:border-gray-600 focus:border-[#5865F2]" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Footer Text</label>
                  <input 
                    type="text" 
                    value={embed.footerText || ''} 
                    onChange={e => setEmbed({...embed, footerText: e.target.value})} 
                    className="w-full bg-[#0f0f13] border border-[#2a2a3a] text-white rounded-lg p-2.5 outline-none transition-colors hover:border-gray-600 focus:border-[#5865F2]" 
                  />
                </div>

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Thumbnail URL (Optional)</label>
                    <input 
                      type="text" 
                      value={embed.thumbnailUrl || ''} 
                      onChange={e => setEmbed({...embed, thumbnailUrl: e.target.value})} 
                      placeholder="https://..."
                      className="w-full bg-[#0f0f13] border border-[#2a2a3a] text-white rounded-lg p-2.5 outline-none transition-colors hover:border-gray-600 focus:border-[#5865F2]" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Image URL (Optional)</label>
                    <input 
                      type="text" 
                      value={embed.imageUrl || ''} 
                      onChange={e => setEmbed({...embed, imageUrl: e.target.value})} 
                      placeholder="https://..."
                      className="w-full bg-[#0f0f13] border border-[#2a2a3a] text-white rounded-lg p-2.5 outline-none transition-colors hover:border-gray-600 focus:border-[#5865F2]" 
                    />
                  </div>
                </div>

                <div className="md:col-span-2 flex items-center mt-3 bg-[#0f0f13] p-3 rounded-lg border border-[#2a2a3a]">
                  <input 
                    type="checkbox" 
                    id="showTimestamp"
                    checked={embed.showTimestamp || false} 
                    onChange={e => setEmbed({...embed, showTimestamp: e.target.checked})} 
                    className="w-4 h-4 rounded bg-[#1a1a24] border-[#2a2a3a] cursor-pointer" 
                  />
                  <label htmlFor="showTimestamp" className="ml-3 text-sm font-medium text-gray-300 cursor-pointer flex-1">
                    Show Timestamp in Footer
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-xl p-6 shadow-lg">
              <h2 className="text-lg font-bold text-white mb-4 border-b border-[#2a2a3a] pb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#5865F2]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path></svg>
                Buttons
              </h2>
              <p className="text-sm text-gray-400 mb-6 bg-[#0f0f13] p-3 rounded-lg border border-[#2a2a3a]">Configure up to 5 buttons for this panel. Each button can have its own category, support roles, and opening modal questions.</p>
              
              <PanelButtonEditor 
                buttons={buttons} 
                setButtons={setButtons} 
                roles={roles} 
                categories={categories} 
              />
            </div>
          </div>

          <div className="xl:col-span-5 2xl:col-span-4 h-full hidden xl:block relative">
            <PanelPreview embed={embed} buttons={buttons} />
          </div>

        </div>
      </div>
    </div>
  );
}
