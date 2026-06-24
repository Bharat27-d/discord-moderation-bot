import express from 'express';
import Ticket from '../../models/Ticket.js';
import TicketPanel from '../../models/TicketPanel.js';
import { redis, getGuildConfig } from '../../utils/ticketUtils.js';

const router = express.Router({ mergeParams: true });

// Dummy auth middleware for route
const authMiddleware = (req, res, next) => next();

router.use(authMiddleware);

// GET /api/guilds/:guildId/tickets
router.get('/', async (req, res) => {
  try {
    const { guildId } = req.params;
    const { status, page = 1, limit = 20, userId, search, panelId } = req.query;
    
    const query = { guildId };
    if (status && status !== 'all') query.status = status;
    if (userId) query.userId = userId;
    if (panelId && panelId !== 'all') query.panelId = panelId;
    if (search) {
      query.$or = [
        { topic: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const tickets = await Ticket.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
      
    const total = await Ticket.countDocuments(query);
    
    res.json({
      tickets,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)) || 1
    });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// GET /api/guilds/:guildId/tickets/stats
router.get('/stats', async (req, res) => {
  try {
    const { guildId } = req.params;
    
    const cacheKey = `ticket:stats:${guildId}`;
    const cached = await redis.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    const open = await Ticket.countDocuments({ guildId, status: 'open' });
    
    // Closed today
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    const closed = await Ticket.countDocuments({ guildId, status: 'closed', closedAt: { $gte: startOfDay } });
    
    const claimed = await Ticket.countDocuments({ guildId, status: 'claimed' });
    
    const ticketsWithResponse = await Ticket.find({ guildId, firstResponseAt: { $ne: null } });
    let totalMs = 0;
    ticketsWithResponse.forEach(t => {
      totalMs += (new Date(t.firstResponseAt).getTime() - new Date(t.createdAt).getTime());
    });
    const avgFirstResponseMs = ticketsWithResponse.length ? totalMs / ticketsWithResponse.length : 0;
    
    const mins = Math.floor(avgFirstResponseMs / 60000);
    const secs = Math.floor((avgFirstResponseMs % 60000) / 1000);
    const avgFirstResponse = ticketsWithResponse.length ? `${mins}m ${secs}s` : 'N/A';

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentTickets = await Ticket.find({ guildId, createdAt: { $gte: thirtyDaysAgo } });
    
    const ticketsLast30DaysMap = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      ticketsLast30DaysMap[dateStr] = { date: dateStr, opened: 0, closed: 0 };
    }
    
    recentTickets.forEach(t => {
      const dateStr = new Date(t.createdAt).toISOString().split('T')[0];
      if (ticketsLast30DaysMap[dateStr]) ticketsLast30DaysMap[dateStr].opened++;
      
      if (t.closedAt) {
        const closedStr = new Date(t.closedAt).toISOString().split('T')[0];
        if (ticketsLast30DaysMap[closedStr]) ticketsLast30DaysMap[closedStr].closed++;
      }
    });

    const ticketsLast30Days = Object.values(ticketsLast30DaysMap).reverse();

    const stats = { open, closed, claimed, avgFirstResponse, ticketsLast30Days };
    
    await redis.set(cacheKey, JSON.stringify(stats), 'EX', 60);
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// GET /api/guilds/:guildId/tickets/config
router.get('/config', async (req, res) => {
  try {
    const config = await getGuildConfig(req.params.guildId);
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// PATCH /api/guilds/:guildId/tickets/config
router.patch('/config', async (req, res) => {
  try {
    res.json({ success: true, message: 'Config updated' });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// GET /api/guilds/:guildId/tickets/:ticketId
router.get('/:ticketId', async (req, res) => {
  try {
    if (req.params.ticketId === 'stats' || req.params.ticketId === 'config' || req.params.ticketId === 'panels') {
      return res.status(404).json({error: 'Not found'});
    }
    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) return res.status(404).json({ error: 'Not found' });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// GET /api/guilds/:guildId/tickets/:ticketId/transcript
router.get('/:ticketId/transcript', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket || !ticket.transcriptUrl) return res.status(404).send('No transcript');
    res.redirect(ticket.transcriptUrl);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// DELETE /api/guilds/:guildId/tickets/:ticketId
router.delete('/:ticketId', async (req, res) => {
  try {
    const { guildId, ticketId } = req.params;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return res.status(404).json({ error: 'Not found' });
    
    await redis.publish('ticket:forceClose', JSON.stringify({
      ticketId,
      guildId,
      channelId: ticket.channelId,
      closedBy: req.user ? req.user.id : 'Admin'
    }));

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// --- Panel Routes ---

router.get('/panels/list', async (req, res) => {
  try {
    const panels = await TicketPanel.find({ guildId: req.params.guildId });
    res.json(panels);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

router.post('/panels', async (req, res) => {
  try {
    const { name, embed, buttons } = req.body;
    const panel = new TicketPanel({
      guildId: req.params.guildId,
      name,
      embed,
      buttons
    });
    await panel.save();
    res.json(panel);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

router.get('/panels/:panelId', async (req, res) => {
  try {
    const panel = await TicketPanel.findById(req.params.panelId);
    if (!panel) return res.status(404).json({ error: 'Not found' });
    res.json(panel);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

router.patch('/panels/:panelId', async (req, res) => {
  try {
    const panel = await TicketPanel.findByIdAndUpdate(req.params.panelId, req.body, { new: true });
    
    if (panel.isDeployed) {
      await redis.publish('ticket:redeploy', JSON.stringify({
        panelId: panel._id,
        guildId: panel.guildId
      }));
    }
    
    res.json(panel);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

router.delete('/panels/:panelId', async (req, res) => {
  try {
    const panel = await TicketPanel.findById(req.params.panelId);
    if (!panel) return res.status(404).json({ error: 'Not found' });
    
    if (panel.isDeployed) {
      await redis.publish('ticket:undeploy', JSON.stringify({
        panelId: panel._id,
        guildId: panel.guildId,
        messageId: panel.messageId,
        channelId: panel.channelId
      }));
    }
    
    await TicketPanel.findByIdAndDelete(req.params.panelId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

router.post('/panels/:panelId/deploy', async (req, res) => {
  try {
    const { channelId } = req.body;
    await redis.publish('ticket:deploy', JSON.stringify({
      panelId: req.params.panelId,
      guildId: req.params.guildId,
      channelId
    }));
    res.json({ success: true, channelId });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

router.post('/panels/:panelId/redeploy', async (req, res) => {
  try {
    await redis.publish('ticket:redeploy', JSON.stringify({
      panelId: req.params.panelId,
      guildId: req.params.guildId
    }));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

router.post('/panels/:panelId/undeploy', async (req, res) => {
  try {
    const panel = await TicketPanel.findById(req.params.panelId);
    if (!panel) return res.status(404).json({ error: 'Not found' });
    
    await redis.publish('ticket:undeploy', JSON.stringify({
      panelId: panel._id,
      guildId: panel.guildId,
      messageId: panel.messageId,
      channelId: panel.channelId
    }));
    
    panel.isDeployed = false;
    await panel.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

export default router;
