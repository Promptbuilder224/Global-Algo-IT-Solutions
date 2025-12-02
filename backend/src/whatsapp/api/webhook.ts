
import { FastifyInstance } from 'fastify';
import { parseWebhook } from '../adapter/twilioAdapter';
import db, { updateMessageByProviderSid } from '../db';

export async function webhookRoutes(server: FastifyInstance) {
  server.post('/api/whatsapp/webhook', async (req, reply) => {
    const data = parseWebhook(req.body);
    console.log(`[Webhook] Message ${data.messageSid} -> ${data.status}`);

    await updateMessageByProviderSid(data.messageSid, { status: data.status, error_code: data.errorCode || null });

    return reply.code(200).send('OK');
  });
}
