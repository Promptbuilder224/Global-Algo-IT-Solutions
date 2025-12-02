import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve('.', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const MONGO_DB = process.env.MONGO_DB || 'global_algo_whatsapp';

let client: MongoClient | null = null;
let db: Db | null = null;

interface CampaignDoc {
  _id?: ObjectId;
  id?: string;
  name: string;
  template_body: string;
  status?: string;
  createdAt?: Date;
}

interface ClientDoc {
  _id?: ObjectId;
  phone: string;
  opt_in: boolean;
}

interface MessageDoc {
  _id?: ObjectId;
  id: string;
  campaign_id: string;
  client_phone: string;
  status: string;
  provider_sid?: string;
  error_code?: string | null;
  createdAt?: Date;
}

let campaigns: Collection<CampaignDoc> | null = null;
let clients: Collection<ClientDoc> | null = null;
let messages: Collection<MessageDoc> | null = null;

export async function initDb() {
  client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db(MONGO_DB);

  // Collections
  campaigns = db.collection('campaigns');
  clients = db.collection('clients');
  messages = db.collection('messages');

  // Indexes for common queries
  await campaigns.createIndex({ name: 1 });
  await clients.createIndex({ phone: 1 }, { unique: true, sparse: true });
  await clients.createIndex({ opt_in: 1 });
  await messages.createIndex({ id: 1 }, { unique: true, sparse: true });
  await messages.createIndex({ campaign_id: 1 });
  await messages.createIndex({ provider_sid: 1 }, { sparse: true });

  // If collections were empty we can seed some minimal sample data (no-op if already present)
  const clientCount = await clients.countDocuments();
  if (clientCount === 0) {
    // Add a few sample clients to mirror previous PoC expectations
    await clients.insertMany([
      { phone: '+15550000001', opt_in: true },
      { phone: '+15550000002', opt_in: false },
      { phone: '+15550000003', opt_in: true }
    ]);
  }

  console.log(`Connected to MongoDB ${MONGO_URI} db=${MONGO_DB}`);
}

function assertReady() {
  if (!db || !campaigns || !clients || !messages) {
    throw new Error('Database not initialized. Call initDb() first.');
  }
}

// Campaigns
export async function createCampaign(doc: { id?: string; name: string; template_body: string }) {
  assertReady();
  const { id, name, template_body } = doc;
  const payload: any = { name, template_body, status: 'draft', createdAt: new Date() };
  if (id) payload.id = id;
  const res = await campaigns!.insertOne(payload);
  return { id: payload.id ?? res.insertedId.toString(), insertedId: res.insertedId };
}

function toObjectId(id: string) {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

export async function getCampaignById(id: string) {
  assertReady();
  const maybeId = toObjectId(id);
  const query = maybeId ? { $or: [{ id }, { _id: maybeId }] } : { id };
  return await campaigns!.findOne(query as any);
}

export async function updateCampaignStatus(id: string, status: string) {
  assertReady();
  const maybeId = toObjectId(id);
  const query = maybeId ? { $or: [{ id }, { _id: maybeId }] } : { id };
  await campaigns!.updateOne(query as any, { $set: { status } });
}

// Clients
export async function getOptedInClients() {
  assertReady();
  return await clients!.find({ opt_in: true }).toArray();
}

export async function getClientByPhone(phone: string) {
  assertReady();
  return await clients!.findOne({ phone });
}

// Messages
export async function insertMessage(doc: { id: string; campaign_id: string; client_phone: string; status: string }) {
  assertReady();
  await messages!.insertOne({ ...doc, createdAt: new Date() });
}

export async function updateMessageById(id: string, patch: Record<string, any>) {
  assertReady();
  return await messages!.updateOne({ id }, { $set: patch });
}

export async function updateMessageByProviderSid(providerSid: string, patch: Record<string, any>) {
  assertReady();
  return await messages!.updateOne({ provider_sid: providerSid }, { $set: patch });
}

export async function getMessageStats(campaign_id: string) {
  assertReady();
  const res = await messages!.aggregate([
    { $match: { campaign_id } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $project: { status: '$_id', count: 1, _id: 0 } }
  ]).toArray();
  return res;
}

// Provide a minimal default object for callers that imported default previously (not used by server.ts)
const exportedDefault = {
  initDb,
  createCampaign,
  getCampaignById,
  updateCampaignStatus,
  getOptedInClients,
  getClientByPhone,
  insertMessage,
  updateMessageById,
  updateMessageByProviderSid,
  getMessageStats
};

export default exportedDefault;