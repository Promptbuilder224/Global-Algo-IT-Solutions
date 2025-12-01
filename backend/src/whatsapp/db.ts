import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// Use path.resolve('.') to resolve paths relative to the project root (backend/)
// This works for both 'ts-node src/server.ts' and 'node dist/server.js'
const DATA_DIR = path.resolve('.', 'data');
const DB_PATH = path.join(DATA_DIR, 'whatsapp.db');
const MIGRATION_PATH = path.resolve('.', 'migrations/001_whatsapp.sql');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

export function initDb() {
  if (fs.existsSync(MIGRATION_PATH)) {
    try {
      const migration = fs.readFileSync(MIGRATION_PATH, 'utf8');
      db.exec(migration);
      console.log('Database initialized/migrated successfully.');
    } catch (error) {
      console.error('Failed to run migration:', error);
    }
  } else {
    console.error('Migration file not found at:', MIGRATION_PATH);
    console.error('Ensure you are running the server from the "backend/" directory.');
  }
}

export default db;