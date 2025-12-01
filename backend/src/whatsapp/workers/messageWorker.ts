
import Redis from 'ioredis';
import db from '../db';
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

      const [_, messages] = results[0];
      
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
  const stmtUpdate = db.prepare('UPDATE messages SET status = ? WHERE id = ?');
  stmtUpdate.run('sending', message_id);

  // 2. Check Opt-in
  const client = db.prepare('SELECT opt_in FROM clients WHERE phone = ?').get(client_phone) as { opt_in: number } | undefined;

  if (!client || client.opt_in !== 1) {
    console.log(`Skipping ${client_phone}: Not opted in.`);
    const stmtSkip = db.prepare('UPDATE messages SET status = ?, error_code = ? WHERE id = ?');
    stmtSkip.run('skipped_opt_out', 'CONSENT_REQUIRED', message_id);
    return;
  }

  // 3. Send via Adapter
  const result = await sendMessage(client_phone, template_body);

  // 4. Update DB result
  if (result.success) {
    const stmtSuccess = db.prepare('UPDATE messages SET status = ?, provider_sid = ? WHERE id = ?');
    stmtSuccess.run('sent', result.sid, message_id);
  } else {
    const stmtFail = db.prepare('UPDATE messages SET status = ?, error_code = ? WHERE id = ?');
    stmtFail.run('failed', result.error, message_id);
  }
}
