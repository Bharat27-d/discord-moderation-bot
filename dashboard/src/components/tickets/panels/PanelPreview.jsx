import React from 'react';

export default function PanelPreview({ embed, buttons }) {
  const getButtonClass = (style) => {
    switch (style) {
      case 'primary': return 'bg-[#5865F2] text-white hover:bg-[#4752C4]';
      case 'secondary': return 'bg-[#4E5058] text-white hover:bg-[#6D6F78]';
      case 'success': return 'bg-[#248046] text-white hover:bg-[#1A6334]';
      case 'danger': return 'bg-[#DA373C] text-white hover:bg-[#A12828]';
      default: return 'bg-[#5865F2] text-white hover:bg-[#4752C4]';
    }
  };

  return (
    <div className="bg-[#313338] rounded-lg p-6 w-full shadow-2xl font-sans sticky top-6 border border-[#1e1f22]">
      <div className="text-xs text-gray-400 mb-6 uppercase font-bold tracking-wider flex items-center">
        <div className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse"></div>
        Live Preview
      </div>
      
      <div className="flex items-start mb-1">
        <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center text-white mr-4 shrink-0 font-bold shadow-lg">
          Bot
        </div>
        <div>
          <span className="font-semibold text-white mr-2">BotName</span>
          <span className="bg-[#5865F2] text-[10px] px-1.5 py-0.5 rounded text-white mr-2 uppercase font-bold">Bot</span>
          <span className="text-[#949ba4] text-xs">Today at {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
      </div>

      <div className="ml-14">
        <div className="flex bg-[#2b2d31] rounded-r-lg rounded-l-sm border-l-4 overflow-hidden mb-3 max-w-[520px] shadow-md" style={{ borderColor: embed.color || '#5865F2' }}>
          <div className="p-4 w-full">
            {embed.title && <div className="font-bold text-white mb-2 text-[15px]">{embed.title}</div>}
            {embed.description && <div className="text-[#dbdee1] text-sm whitespace-pre-wrap leading-relaxed">{embed.description}</div>}
            {embed.imageUrl && <img src={embed.imageUrl} alt="Embed" className="mt-4 rounded-lg max-h-[300px] object-cover w-full" />}
            
            {(embed.footerText || embed.showTimestamp) && (
              <div className="flex items-center mt-4 text-xs text-[#949ba4] font-medium">
                {embed.thumbnailUrl && <img src={embed.thumbnailUrl} alt="Footer" className="w-5 h-5 rounded-full mr-2 object-cover" />}
                <span>{embed.footerText}</span>
                {embed.footerText && embed.showTimestamp && <span className="mx-1.5">•</span>}
                {embed.showTimestamp && <span>Today at {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>}
              </div>
            )}
          </div>
          {embed.thumbnailUrl && !embed.footerText && (
            <div className="p-4 pl-0">
              <img src={embed.thumbnailUrl} alt="Thumbnail" className="w-20 h-20 rounded-lg object-cover" />
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {buttons.map((btn, i) => (
            <button 
              key={i} 
              className={`px-4 py-1.5 rounded flex items-center gap-2 text-sm font-medium transition-colors ${getButtonClass(btn.style)}`}
            >
              {btn.emoji && <span>{btn.emoji}</span>}
              <span>{btn.label || 'Button'}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
