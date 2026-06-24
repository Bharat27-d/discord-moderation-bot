import fs from 'fs';
import path from 'path';

/**
 * Generate an HTML transcript for the ticket.
 * @param {import('discord.js').TextChannel} channel 
 * @param {Object} ticket 
 * @returns {Promise<string>} path to temporary html file
 */
export async function generateTranscript(channel, ticket) {
  const messages = await channel.messages.fetch({ limit: 100 });
  const sortedMessages = Array.from(messages.values()).reverse();
  
  let html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Ticket #${ticket.ticketNumber} - ${ticket.topic}</title>
    <style>
      body { background-color: #313338; color: #dbdee1; font-family: sans-serif; padding: 20px; }
      .message { display: flex; margin-bottom: 20px; }
      .avatar { width: 40px; height: 40px; border-radius: 50%; margin-right: 15px; }
      .content { flex: 1; }
      .header { margin-bottom: 5px; }
      .username { font-weight: bold; color: #fff; margin-right: 10px; }
      .timestamp { color: #949ba4; font-size: 0.8em; }
      .text { white-space: pre-wrap; margin-top: 2px; }
      .embed { border-left: 4px solid #202225; background: #2b2d31; padding: 10px; margin-top: 5px; border-radius: 4px; }
    </style>
  </head>
  <body>
    <h1>Ticket #${ticket.ticketNumber}</h1>
    <p>Topic: ${ticket.topic}</p>
    <p>Opened by: ${ticket.userId}</p>
    <p>Claimed by: ${ticket.claimedBy || 'None'}</p>
    <p>Timestamps: Created at ${new Date(ticket.createdAt).toLocaleString()}</p>
    <hr>
  `;

  for (const msg of sortedMessages) {
    const avatar = msg.author.displayAvatarURL({ extension: 'png' });
    const time = msg.createdAt.toLocaleString();
    let text = msg.content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    let embedsHtml = '';
    msg.embeds.forEach(e => {
      embedsHtml += `<div class="embed"><strong>${e.title || ''}</strong><br>${e.description || ''}</div>`;
    });

    let attachmentsHtml = '';
    msg.attachments.forEach(a => {
      attachmentsHtml += `<div><a href="${a.url}" target="_blank">${a.name}</a></div>`;
    });

    html += `
    <div class="message">
      <img src="${avatar}" class="avatar">
      <div class="content">
        <div class="header">
          <span class="username">${msg.author.username}</span>
          <span class="timestamp">${time}</span>
        </div>
        <div class="text">${text}</div>
        ${embedsHtml}
        ${attachmentsHtml}
      </div>
    </div>
    `;
  }
  
  html += '</body></html>';
  
  const tmpPath = path.join(process.cwd(), `transcript-${channel.id}.html`);
  fs.writeFileSync(tmpPath, html);
  
  return tmpPath;
}
