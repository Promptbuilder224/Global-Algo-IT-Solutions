
import { FastifyInstance } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import Redis from 'ioredis';
import db from '../db';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379')
});

const STREAM_KEY = 'whatsapp_queue';

export async function campaignRoutes(server: FastifyInstance) {
  
  // Create Campaign
  server.post('/api/campaigns', async (req, reply) => {
    const { name, template_body } = req.body as { name: string; template_body: string };
    if (!name || !template_body) return reply.code(400).send({ error: 'Missing fields' });

    const stmt = db.prepare('INSERT INTO campaigns (name, template_body) VALUES (?, ?)');
    const info = stmt.run(name, template_body);

    return { id: info.lastInsertRowid, name, status: 'draft' };
  });

  // Start Campaign (Enqueue)
  server.post('/api/campaigns/:id/start', async (req, reply) => {
    const { id } = req.params as { id: string };
    
    // 1. Get Campaign
    const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(id) as any;
    if (!campaign) return reply.code(404).send({ error: 'Campaign not found' });

    // 2. Get Opted-in Clients
    const clients = db.prepare('SELECT phone FROM clients WHERE opt_in = 1').all() as { phone: string }[];
    
    if (clients.length === 0) return { message: 'No eligible contacts found.' };

    // 3. Batch Enqueue
    const stmtMsg = db.prepare('INSERT INTO messages (id, campaign_id, client_phone, status) VALUES (?, ?, ?, ?)');
    
    const pipeline = redis.pipeline();
    let queuedCount = 0;

    const transaction = db.transaction(() => {
      for (const client of clients) {
        const messageId = uuidv4();
        // Insert DB
        stmtMsg.run(messageId, id, client.phone, 'queued');
        
        // Add to Redis Stream
        pipeline.xadd(STREAM_KEY, '*', 
          'message_id', messageId,
          'client_phone', client.phone,
          'template_body', campaign.template_body
        );
        queuedCount++;
      }
    });

    transaction();
    await pipeline.exec();

    // Update Campaign Status
    db.prepare('UPDATE campaigns SET status = ? WHERE id = ?').run('processing', id);

    return { success: true, queued: queuedCount };
  });

  // Get Campaign Status
  server.get('/api/campaigns/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(id);
    const stats = db.prepare('SELECT status, COUNT(*) as count FROM messages WHERE campaign_id = ? GROUP BY status').all(id);
    
    return { campaign, stats };
  });
}
