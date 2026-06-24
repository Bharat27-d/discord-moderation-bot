import React from 'react';

export default function TicketTranscriptViewer({ transcriptUrl }) {
  if (!transcriptUrl) {
    return (
      <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-lg p-12 flex flex-col items-center justify-center text-gray-500 shadow-lg">
        <svg className="w-16 h-16 mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
        <p className="text-lg font-medium text-gray-300">No transcript available.</p>
        <p className="text-sm mt-1">This ticket may still be open or transcripts are disabled.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-lg overflow-hidden h-[600px] flex flex-col shadow-lg">
      <div className="bg-[#20222e] px-4 py-3 border-b border-[#2a2a3a] flex justify-between items-center">
        <h3 className="font-semibold text-white">Transcript</h3>
        <a href={transcriptUrl} target="_blank" rel="noreferrer" className="text-sm text-[#5865F2] hover:underline font-medium">
          Open in new tab
        </a>
      </div>
      <iframe 
        src={transcriptUrl} 
        className="w-full flex-1 bg-white" 
        title="Transcript"
        sandbox="allow-same-origin allow-scripts"
      />
    </div>
  );
}
