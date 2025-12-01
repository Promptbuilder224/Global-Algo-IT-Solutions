
import { FastifyInstance } from 'fastify';
import { parseWebhook } from '../adapter/twilioAdapter';
import db from '../db';

export async function webhookRoutes(server: FastifyInstance) {
  server.post('/api/whatsapp/webhook', async (req, reply) => {
    const data = parseWebhook(req.body);
    console.log(`[Webhook] Message ${data.messageSid} -> ${data.status}`);

    const stmt = db.prepare('UPDATE messages SET status = ?, error_code = ? WHERE provider_sid = ?');
    stmt.run(data.status, data.errorCode || null, data.messageSid);

    return reply.code(200).send('OK');
  });
}
