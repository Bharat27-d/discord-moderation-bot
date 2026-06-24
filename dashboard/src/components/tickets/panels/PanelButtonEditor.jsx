import React from 'react';

export default function PanelButtonEditor({ buttons, setButtons, roles, categories }) {
  const handleAddButton = () => {
    if (buttons.length >= 5) return;
    setButtons([...buttons, {
      label: 'New Button',
      emoji: '🎫',
      style: 'primary',
      categoryId: null,
      supportRoles: [],
      namingFormat: 'ticket-{username}-{number}',
      welcomeMessage: 'Welcome to your ticket!',
      modalFields: [{ label: 'Reason', placeholder: 'Why do you need support?', style: 'paragraph', required: true }]
    }]);
  };

  const handleUpdateBtn = (idx, field, value) => {
    const newBtns = [...buttons];
    newBtns[idx] = { ...newBtns[idx], [field]: value };
    setButtons(newBtns);
  };

  const handleRemoveBtn = (idx) => {
    const newBtns = buttons.filter((_, i) => i !== idx);
    setButtons(newBtns);
  };

  const handleRolesChange = (e, idx) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) selected.push(options[i].value);
    }
    handleUpdateBtn(idx, 'supportRoles', selected);
  };

  const handleAddModalField = (btnIdx) => {
    const btn = buttons[btnIdx];
    if (btn.modalFields.length >= 5) return;
    handleUpdateBtn(btnIdx, 'modalFields', [...btn.modalFields, { label: 'New Field', placeholder: '', style: 'short', required: true }]);
  };

  const handleUpdateModalField = (btnIdx, fieldIdx, field, value) => {
    const btn = buttons[btnIdx];
    const newFields = [...btn.modalFields];
    newFields[fieldIdx] = { ...newFields[fieldIdx], [field]: value };
    handleUpdateBtn(btnIdx, 'modalFields', newFields);
  };

  const handleRemoveModalField = (btnIdx, fieldIdx) => {
    const btn = buttons[btnIdx];
    const newFields = btn.modalFields.filter((_, i) => i !== fieldIdx);
    handleUpdateBtn(btnIdx, 'modalFields', newFields);
  };

  return (
    <div className="space-y-6">
      {buttons.map((btn, i) => (
        <div key={i} className="bg-[#0f0f13] border border-[#2a2a3a] rounded-xl p-5 shadow-inner transition-all hover:border-gray-700">
          <div className="flex justify-between items-center mb-5 pb-3 border-b border-[#2a2a3a]">
            <h4 className="font-bold text-white text-lg flex items-center">
              <span className="w-6 h-6 rounded-full bg-[#5865F2] text-white text-xs flex items-center justify-center mr-3">{i + 1}</span>
              Button Configuration
            </h4>
            <button onClick={() => handleRemoveBtn(i)} className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors hover:underline">
              Remove Button
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Label <span className="text-red-500">*</span></label>
              <input type="text" value={btn.label || ''} onChange={e => handleUpdateBtn(i, 'label', e.target.value)} className="w-full bg-[#1a1a24] border border-[#2a2a3a] text-white rounded-lg p-2.5 outline-none transition-colors hover:border-gray-600 focus:border-[#5865F2]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Emoji</label>
              <input type="text" value={btn.emoji || ''} onChange={e => handleUpdateBtn(i, 'emoji', e.target.value)} className="w-full bg-[#1a1a24] border border-[#2a2a3a] text-white rounded-lg p-2.5 outline-none transition-colors hover:border-gray-600 focus:border-[#5865F2]" placeholder="🎫" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Style</label>
              <select value={btn.style || 'primary'} onChange={e => handleUpdateBtn(i, 'style', e.target.value)} className="w-full bg-[#1a1a24] border border-[#2a2a3a] text-white rounded-lg p-2.5 outline-none transition-colors hover:border-gray-600 focus:border-[#5865F2] cursor-pointer">
                <option value="primary">Primary (Blue)</option>
                <option value="secondary">Secondary (Grey)</option>
                <option value="success">Success (Green)</option>
                <option value="danger">Danger (Red)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Naming Format</label>
              <input type="text" value={btn.namingFormat || ''} onChange={e => handleUpdateBtn(i, 'namingFormat', e.target.value)} className="w-full bg-[#1a1a24] border border-[#2a2a3a] text-white rounded-lg p-2.5 outline-none transition-colors hover:border-gray-600 focus:border-[#5865F2]" placeholder="ticket-{username}-{number}" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Override Category</label>
              <select value={btn.categoryId || ''} onChange={e => handleUpdateBtn(i, 'categoryId', e.target.value)} className="w-full bg-[#1a1a24] border border-[#2a2a3a] text-white rounded-lg p-2.5 outline-none transition-colors hover:border-gray-600 focus:border-[#5865F2] cursor-pointer">
                <option value="">Use Default Settings</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Override Support Roles</label>
              <select multiple value={btn.supportRoles || []} onChange={e => handleRolesChange(e, i)} className="w-full bg-[#1a1a24] border border-[#2a2a3a] text-white rounded-lg p-2.5 h-24 outline-none transition-colors hover:border-gray-600 focus:border-[#5865F2] custom-scrollbar">
                {roles.map(r => <option key={r.id} value={r.id} style={{ color: r.color !== '#000000' ? r.color : 'inherit' }} className="py-1">{r.name}</option>)}
              </select>
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Welcome Message</label>
            <textarea value={btn.welcomeMessage || ''} onChange={e => handleUpdateBtn(i, 'welcomeMessage', e.target.value)} rows={2} className="w-full bg-[#1a1a24] border border-[#2a2a3a] text-white rounded-lg p-2.5 outline-none transition-colors hover:border-gray-600 focus:border-[#5865F2]" />
          </div>

          <div className="border-t border-[#2a2a3a] pt-5 bg-[#14151a] -mx-5 -mb-5 p-5 rounded-b-xl">
            <div className="flex justify-between items-center mb-4">
              <h5 className="text-sm font-bold text-white uppercase tracking-wide">Modal Fields <span className="text-xs text-gray-500 font-normal ml-2">({btn.modalFields?.length || 0}/5)</span></h5>
              <button onClick={() => handleAddModalField(i)} disabled={(btn.modalFields?.length || 0) >= 5} className="text-[#5865F2] hover:text-[#4752C4] text-sm font-medium disabled:opacity-50 transition-colors flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                Add Field
              </button>
            </div>
            
            <div className="space-y-3">
              {(btn.modalFields || []).map((f, j) => (
                <div key={j} className="flex flex-wrap md:flex-nowrap gap-3 items-center bg-[#1a1a24] p-3 rounded-lg border border-[#2a2a3a] shadow-sm">
                  <div className="flex-1 min-w-[120px]">
                    <input type="text" placeholder="Label" value={f.label || ''} onChange={e => handleUpdateModalField(i, j, 'label', e.target.value)} className="w-full bg-[#0f0f13] border border-[#2a2a3a] text-white text-sm rounded-md px-3 py-2 outline-none transition-colors focus:border-[#5865F2]" />
                  </div>
                  <div className="flex-1 min-w-[120px]">
                    <input type="text" placeholder="Placeholder" value={f.placeholder || ''} onChange={e => handleUpdateModalField(i, j, 'placeholder', e.target.value)} className="w-full bg-[#0f0f13] border border-[#2a2a3a] text-white text-sm rounded-md px-3 py-2 outline-none transition-colors focus:border-[#5865F2]" />
                  </div>
                  <div className="w-32">
                    <select value={f.style || 'short'} onChange={e => handleUpdateModalField(i, j, 'style', e.target.value)} className="w-full bg-[#0f0f13] border border-[#2a2a3a] text-white text-sm rounded-md px-3 py-2 outline-none transition-colors focus:border-[#5865F2] cursor-pointer">
                      <option value="short">Short Text</option>
                      <option value="paragraph">Paragraph</option>
                    </select>
                  </div>
                  <div className="flex items-center px-2 border-l border-[#2a2a3a] pl-4">
                    <input type="checkbox" checked={f.required || false} onChange={e => handleUpdateModalField(i, j, 'required', e.target.checked)} className="rounded bg-[#0f0f13] border-[#2a2a3a] w-4 h-4 cursor-pointer" />
                    <span className="text-xs text-gray-300 ml-2 font-medium cursor-pointer uppercase tracking-wide" onClick={() => handleUpdateModalField(i, j, 'required', !f.required)}>Req</span>
                  </div>
                  <button onClick={() => handleRemoveModalField(i, j)} className="text-red-400 hover:text-red-300 p-2 rounded hover:bg-red-500/10 transition-colors ml-auto border border-transparent hover:border-red-500/30">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
              ))}
              {(!btn.modalFields || btn.modalFields.length === 0) && (
                <div className="text-center py-6 text-sm text-gray-500 italic bg-[#1a1a24] rounded-lg border border-dashed border-[#2a2a3a]">
                  No fields added. A default "Reason" field will be used.
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      <button onClick={handleAddButton} disabled={buttons.length >= 5} className="w-full py-4 border-2 border-dashed border-[#2a2a3a] hover:border-[#5865F2] hover:bg-[#5865F2]/5 text-gray-400 hover:text-[#5865F2] font-semibold rounded-xl transition-all disabled:opacity-50 disabled:hover:border-[#2a2a3a] disabled:hover:bg-transparent disabled:hover:text-gray-400 flex justify-center items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
        Add Button ({buttons.length}/5)
      </button>
    </div>
  );
}
