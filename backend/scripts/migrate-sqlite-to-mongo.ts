#!/usr/bin/env ts-node
/*
  scripts/migrate-sqlite-to-mongo.ts
  - Reads data from data/whatsapp.db (if exists) and migrates rows into MongoDB collections:
    campaigns, clients, messages
  - Uses environment variables MONGO_URI / MONGO_DB
*/

import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { MongoClient } from 'mongodb';

const DATA_DIR = path.resolve('.', 'data');
const SQLITE_DB = path.join(DATA_DIR, 'whatsapp.db');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const MONGO_DB = process.env.MONGO_DB || 'global_algo_whatsapp';

async function migrate() {
  if (!fs.existsSync(SQLITE_DB)) {
    console.log('No sqlite DB found at', SQLITE_DB, '\nNothing to migrate.');
    return;
  }

  console.log('Opening sqlite database:', SQLITE_DB);
  const sqlite = await open({ filename: SQLITE_DB, driver: sqlite3.Database });

  // Read tables if they exist
  const tables = await sqlite.all(`SELECT name FROM sqlite_master WHERE type='table'`);
  const tableNames = (tables || []).map((t: any) => t.name);
  console.log('Detected tables:', tableNames.join(', '));

  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(MONGO_DB);

  const campaignsCol = db.collection('campaigns');
  const clientsCol = db.collection('clients');
  const messagesCol = db.collection('messages');

  if (tableNames.includes('campaigns')) {
    const rows = await sqlite.all('SELECT * FROM campaigns');
    if (rows.length) {
      console.log(`Migrating ${rows.length} campaigns...`);
      const mapped = rows.map((r: any) => ({
        id: r.id?.toString() ?? undefined,
        name: r.name,
        template_body: r.template_body,
        status: r.status ?? 'draft',
        createdAt: r.created_at ? new Date(r.created_at) : new Date()
      }));
      await campaignsCol.insertMany(mapped);
    }
  }

  if (tableNames.includes('clients')) {
    const rows = await sqlite.all('SELECT * FROM clients');
    if (rows.length) {
      console.log(`Migrating ${rows.length} clients...`);
      const mapped = rows.map((r: any) => ({
        phone: r.phone,
        opt_in: !!r.opt_in
      }));
      await clientsCol.insertMany(mapped);
    }
  }

  if (tableNames.includes('messages')) {
    const rows = await sqlite.all('SELECT * FROM messages');
    if (rows.length) {
      console.log(`Migrating ${rows.length} messages...`);
      const mapped = rows.map((r: any) => ({
        id: r.id?.toString(),
        campaign_id: r.campaign_id?.toString(),
        client_phone: r.client_phone,
        status: r.status,
        provider_sid: r.provider_sid || undefined,
        error_code: r.error_code || null,
        createdAt: r.created_at ? new Date(r.created_at) : new Date()
      }));
      await messagesCol.insertMany(mapped);
    }
  }

  console.log('Migration complete.');
  await client.close();
  await sqlite.close();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
