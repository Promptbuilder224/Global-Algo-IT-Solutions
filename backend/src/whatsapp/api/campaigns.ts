
import { FastifyInstance } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import Redis from 'ioredis';
import db, {
  createCampaign,
  getCampaignById,
  getOptedInClients,
  insertMessage,
  updateCampaignStatus,
  getMessageStats
} from '../db';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379')
});

// Avoid throwing unhandled errors when Redis is not available during dev
redis.on('error', (err: any) => {
  console.warn('[Redis] connection error:', err && err.message ? err.message : err);
});

const STREAM_KEY = 'whatsapp_queue';

export async function campaignRoutes(server: FastifyInstance) {
  
  // Create Campaign
  server.post('/api/campaigns', async (req, reply) => {
    const { name, template_body } = req.body as { name: string; template_body: string };
    if (!name || !template_body) return reply.code(400).send({ error: 'Missing fields' });

    const campaignId = uuidv4();
    const res = await createCampaign({ id: campaignId, name, template_body });
    return { id: campaignId, name, status: 'draft' };
  });

  // Start Campaign (Enqueue)
  server.post('/api/campaigns/:id/start', async (req, reply) => {
    const { id } = req.params as { id: string };
    
    // 1. Get Campaign
    const campaign = await getCampaignById(id) as any;
    if (!campaign) return reply.code(404).send({ error: 'Campaign not found' });

    // 2. Get Opted-in Clients
    const clients = await getOptedInClients() as { phone: string }[];
    
    if (clients.length === 0) return { message: 'No eligible contacts found.' };

    // 3. Batch Enqueue
    const stmtMsg = insertMessage;
    
    const pipeline = redis.pipeline();
    let queuedCount = 0;

    for (const client of clients) {
      const messageId = uuidv4();
      // Insert DB
      await stmtMsg({ id: messageId, campaign_id: id, client_phone: client.phone, status: 'queued' });

      // Add to Redis Stream
      pipeline.xadd(STREAM_KEY, '*', 
        'message_id', messageId,
        'client_phone', client.phone,
        'template_body', campaign.template_body
      );
      queuedCount++;
    }
    try {
      await pipeline.exec();
    } catch (err: any) {
      // If Redis is unavailable, log and continue — messages are already inserted in DB
      console.warn('[Redis] pipeline.exec failed - Redis may be down:', err && err.message ? err.message : err);
    }

    // Update Campaign Status
    await updateCampaignStatus(id, 'processing');

    return { success: true, queued: queuedCount };
  });

  // Get Campaign Status
  server.get('/api/campaigns/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const campaign = await getCampaignById(id);
    const stats = await getMessageStats(id);
    
    return { campaign, stats };
  });
}
