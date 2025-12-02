
import Redis from 'ioredis';
import db, { updateMessageById, getClientByPhone } from '../db';
import { sendMessage } from '../adapter/twilioAdapter';

const STREAM_KEY = 'whatsapp_queue';
const GROUP_NAME = 'whatsapp_workers';
const CONSUMER_NAME = 'worker_1';

// Initialize Redis
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null
});

async function setupStream() {
  try {
    await redis.xgroup('CREATE', STREAM_KEY, GROUP_NAME, '$', 'MKSTREAM');
  } catch (err: any) {
    if (!err.message.includes('BUSYGROUP')) throw err;
  }
}

export async function startWorker() {
  await setupStream();
  console.log(`Worker ${CONSUMER_NAME} started listening on ${STREAM_KEY}...`);

  while (true) {
    try {
      // Read from stream
      const results = await redis.xreadgroup(
        'GROUP',
        GROUP_NAME,
        CONSUMER_NAME,
        'COUNT',
        1,
        'BLOCK',
        5000,
        'STREAMS',
        STREAM_KEY,
        '>'
      );

      if (!results) continue;

      const [_, messages] = results[0] as any;
      
      for (const [id, fields] of messages) {
        const data: Record<string, string> = {};
        for (let i = 0; i < fields.length; i += 2) {
          data[fields[i]] = fields[i + 1];
        }

        await processMessage(id, data);
        
        // Acknowledge
        await redis.xack(STREAM_KEY, GROUP_NAME, id);
      }
    } catch (error) {
      console.error('Worker loop error:', error);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

async function processMessage(streamId: string, data: any) {
  const { message_id, client_phone, template_body } = data;
  console.log(`Processing message ${message_id} for ${client_phone}`);

  // 1. Update status to processing
  await updateMessageById(message_id, { status: 'sending' });

  // 2. Check Opt-in
  const client = await getClientByPhone(client_phone) as { opt_in: boolean } | undefined;

  if (!client || client.opt_in !== true) {
    console.log(`Skipping ${client_phone}: Not opted in.`);
    await updateMessageById(message_id, { status: 'skipped_opt_out', error_code: 'CONSENT_REQUIRED' });
    return;
  }

  // 3. Send via Adapter
  const result = await sendMessage(client_phone, template_body);

  // 4. Update DB result
  if (result.success) {
    await updateMessageById(message_id, { status: 'sent', provider_sid: result.sid });
  } else {
    await updateMessageById(message_id, { status: 'failed', error_code: result.error });
  }
}
