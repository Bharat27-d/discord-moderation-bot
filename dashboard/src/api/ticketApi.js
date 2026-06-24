import axios from 'axios';

const api = axios.create({
  baseURL: '/api/guilds',
  withCredentials: true
});

export const fetchTicketStats = (guildId) => api.get(`/${guildId}/tickets/stats`).then(res => res.data);
export const fetchTickets = (guildId, params) => api.get(`/${guildId}/tickets`, { params }).then(res => res.data);
export const fetchTicket = (guildId, ticketId) => api.get(`/${guildId}/tickets/${ticketId}`).then(res => res.data);
export const deleteTicket = (guildId, ticketId) => api.delete(`/${guildId}/tickets/${ticketId}`).then(res => res.data);

export const fetchTicketConfig = (guildId) => api.get(`/${guildId}/tickets/config`).then(res => res.data);
export const updateTicketConfig = (guildId, data) => api.patch(`/${guildId}/tickets/config`, data).then(res => res.data);

export const fetchPanels = (guildId) => api.get(`/${guildId}/tickets/panels/list`).then(res => res.data);
export const fetchPanel = (guildId, panelId) => api.get(`/${guildId}/tickets/panels/${panelId}`).then(res => res.data);
export const createPanel = (guildId, data) => api.post(`/${guildId}/tickets/panels`, data).then(res => res.data);
export const updatePanel = (guildId, panelId, data) => api.patch(`/${guildId}/tickets/panels/${panelId}`, data).then(res => res.data);
export const deletePanel = (guildId, panelId) => api.delete(`/${guildId}/tickets/panels/${panelId}`).then(res => res.data);
export const deployPanel = (guildId, panelId, channelId) => api.post(`/${guildId}/tickets/panels/${panelId}/deploy`, { channelId }).then(res => res.data);
export const redeployPanel = (guildId, panelId) => api.post(`/${guildId}/tickets/panels/${panelId}/redeploy`).then(res => res.data);
export const undeployPanel = (guildId, panelId) => api.post(`/${guildId}/tickets/panels/${panelId}/undeploy`).then(res => res.data);

export const fetchChannels = (guildId) => api.get(`/${guildId}/channels`).then(res => res.data).catch(() => []);
export const fetchRoles = (guildId) => api.get(`/${guildId}/roles`).then(res => res.data).catch(() => []);
export const fetchCategories = (guildId) => api.get(`/${guildId}/categories`).then(res => res.data).catch(() => []);
