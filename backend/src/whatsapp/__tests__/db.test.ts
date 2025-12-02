import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';

let mongod: MongoMemoryServer;

beforeAll(async () => {
  try {
    mongod = await MongoMemoryServer.create();
    process.env.MONGO_URI = mongod.getUri();
    process.env.MONGO_DB = 'test_whatsapp_db';
  } catch (err) {
    // If MongoMemoryServer cannot start (CI / restricted env), fall back to a local MongoDB if available
    console.warn('Failed to start MongoMemoryServer, falling back to local MONGO_URI/default', err);
    process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
    process.env.MONGO_DB = process.env.MONGO_DB || 'test_whatsapp_db';
  }
  // import initDb after setting env
  const dbModule = await import('../db');
  await dbModule.initDb();
});

afterAll(async () => {
  if (mongod) await mongod.stop();
});

test('seeded clients exist and campaign/message operations work', async () => {
  const dbModule = await import('../db');

  const clients = await dbModule.getOptedInClients();
  expect(Array.isArray(clients)).toBe(true);
  expect(clients.length).toBeGreaterThanOrEqual(1);

  const campaignId = 'test-campaign-1';
  await dbModule.createCampaign({ id: campaignId, name: 'T1', template_body: 'Hello' });
  const campaign = await dbModule.getCampaignById(campaignId);
  expect(campaign).toBeTruthy();
  expect(campaign!.name).toBe('T1');

  // insert message
  await dbModule.insertMessage({ id: 'mid-1', campaign_id: campaignId, client_phone: clients[0].phone, status: 'queued' });

  const stats = await dbModule.getMessageStats(campaignId);
  expect(Array.isArray(stats)).toBe(true);
  const queuedStat = stats.find((s: any) => s.status === 'queued');
  expect(queuedStat).toBeDefined();
  expect(queuedStat!.count).toBeGreaterThanOrEqual(1);
});
