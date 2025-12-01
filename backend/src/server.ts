import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import formbody from '@fastify/formbody';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { exit } from 'process';

// Load env vars
dotenv.config();

// Import WhatsApp modules
import { initDb } from './whatsapp/db';
import { campaignRoutes } from './whatsapp/api/campaigns';
import { webhookRoutes } from './whatsapp/api/webhook';
import { startWorker } from './whatsapp/workers/messageWorker';

// --- TYPES ---
interface User {
  id: string;
  username: string;
  role: string;
  passwordHash: string;
}

interface LoginAttempt {
  count: number;
  firstAttemptAt: number;
  lockedUntil: number | null;
}

// --- STATE ---
const USERS = new Map<string, User>();
const SESSIONS = new Map<string, string>(); // sessionId -> username
const LOCKOUTS = new Map<string, LoginAttempt>(); // username -> attempt state
const DATA_DIR = path.resolve('.', 'data');
const AUDIT_FILE = path.join(DATA_DIR, 'audit.jsonl');

// --- CONFIG ---
const SALT_ROUNDS = 10;
const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_DURATION_MS = 60 * 60 * 1000; // 1 hour
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours
const PORT = parseInt(process.env.PORT || '3001');

// --- INITIALIZATION ---
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// Init WhatsApp DB
initDb();

// Start Worker in Background (For PoC only)
if (process.env.ENABLE_WORKER === 'true') {
  startWorker().catch(err => console.error('Worker failed to start:', err));
}

// Seed Mock Users (Matching frontend constants)
const SEED_USERS = [
  { u: 'admin.team', p: 'Root-Admin123', r: 'Admin' },
  { u: 'owner', p: 'Root-Owner123', r: 'Admin' },
  { u: 'bm01', p: 'SetC-Temp123', r: 'Branch Manager' },
  { u: 'tl01', p: 'SetA-Temp123', r: 'Team Lead' },
  { u: 'ag001', p: 'SetB-Temp123', r: 'Agent' },
];

// Pre-hash passwords on startup
(async () => {
  console.log('Seeding in-memory database...');
  for (const cred of SEED_USERS) {
    const hash = await bcrypt.hash(cred.p, SALT_ROUNDS);
    USERS.set(cred.u, {
      id: uuidv4(),
      username: cred.u,
      role: cred.r,
      passwordHash: hash
    });
  }
  console.log(`Seeded ${USERS.size} users.`);
})();

// --- SERVER SETUP ---
const server = Fastify({ logger: true });

server.register(cors, {
  origin: (origin, cb) => {
    // Allow localhost for dev, distinct for prod
    const isLocal = !origin || /^http:\/\/localhost/.test(origin);
    cb(null, isLocal); // Allow requests from localhost
  },
  credentials: true // Allow cookies to be sent
});

server.register(cookie, {
  secret: 'dev-secret-key-change-in-prod-1234567890',
  parseOptions: {}
});

server.register(formbody);

// Register WhatsApp API Routes
server.register(campaignRoutes);
server.register(webhookRoutes);

// --- HELPERS ---
function logAudit(event: any) {
  const line = JSON.stringify({ ...event, _ts: new Date().toISOString() }) + '\n';
  fs.appendFile(AUDIT_FILE, line, (err) => {
    if (err) console.error('Failed to write audit log', err);
  });
}

// --- ROUTES ---

// 1. Auth: Login
server.post('/api/auth/login', async (req: FastifyRequest<{ Body: { username: string; password: string } }>, reply) => {
  const { username, password } = req.body || {};
  if (!username || !password) return reply.code(400).send({ error: 'Missing credentials' });

  const userKey = username.toLowerCase();
  
  // Check Lockout
  const attempt = LOCKOUTS.get(userKey);
  if (attempt?.lockedUntil) {
    if (Date.now() < attempt.lockedUntil) {
      logAudit({ event: 'login_locked', actor: username, status: 'rejected' });
      return reply.code(423).send({ error: 'Account locked. Try again later.' });
    } else {
      // Lock expired
      LOCKOUTS.delete(userKey);
    }
  }

  const user = USERS.get(userKey);
  const isValid = user ? await bcrypt.compare(password, user.passwordHash) : false;

  if (!isValid) {
    // Handle Failure / Lockout logic
    const now = Date.now();
    const current = LOCKOUTS.get(userKey) || { count: 0, firstAttemptAt: now, lockedUntil: null };
    
    // Reset window if hour passed
    if (now - current.firstAttemptAt > LOCKOUT_DURATION_MS) {
      current.count = 1;
      current.firstAttemptAt = now;
    } else {
      current.count++;
    }

    if (current.count >= LOCKOUT_THRESHOLD) {
      current.lockedUntil = now + LOCKOUT_DURATION_MS;
      logAudit({ event: 'account_lockout_triggered', actor: username });
    }
    
    LOCKOUTS.set(userKey, current);
    logAudit({ event: 'login_failure', actor: username });
    
    if (current.lockedUntil) return reply.code(423).send({ error: 'Account locked.' });
    return reply.code(401).send({ error: 'Invalid credentials' });
  }

  // Success
  LOCKOUTS.delete(userKey);
  const sessionId = uuidv4();
  SESSIONS.set(sessionId, userKey);

  logAudit({ event: 'login_success', actor: username });

  reply.setCookie('session', sessionId, {
    path: '/',
    httpOnly: true,
    secure: false, // Set to true if serving over HTTPS
    sameSite: 'lax', // Use 'lax' or 'none' (with secure: true) for cross-origin dev if needed, 'strict' otherwise
    maxAge: SESSION_DURATION_MS / 1000 
  });

  return { 
    user: { 
      user_id: user!.id, 
      username: user!.username, 
      role: user!.role,
      issued_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + SESSION_DURATION_MS).toISOString()
    } 
  };
});

// 2. Auth: Me (Session Check)
server.get('/api/auth/me', async (req, reply) => {
  const sessionId = req.cookies.session;
  if (!sessionId || !SESSIONS.has(sessionId)) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }

  const userKey = SESSIONS.get(sessionId);
  const user = USERS.get(userKey!);

  if (!user) return reply.code(401).send({ error: 'User not found' });

  // Extend session if valid? (Simplified: just return info)
  return { 
    user: { 
      user_id: user.id, 
      username: user.username, 
      role: user.role,
      issued_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + SESSION_DURATION_MS).toISOString()
    } 
  };
});

// 3. Auth: Logout
server.post('/api/auth/logout', async (req, reply) => {
  const sessionId = req.cookies.session;
  if (sessionId) {
    SESSIONS.delete(sessionId);
  }
  
  logAudit({ event: 'logout', actor: sessionId ? 'session_user' : 'unknown' });

  reply.clearCookie('session', { path: '/' });
  return { success: true };
});

// 4. Audit: Ingest
server.post('/api/audit', async (req: FastifyRequest<{ Body: Record<string, any> }>, reply) => {
  const payload = req.body as Record<string, any> || {};
  logAudit({ ...payload, source: 'client_report' });
  return { status: 'ok' };
});

// 5. Modules: Pluggable Connector
server.get('/api/modules/:moduleName', async (req: FastifyRequest<{ Params: { moduleName: string } }>, reply) => {
  const { moduleName } = req.params;
  
  // Auth Check - Ensure session exists
  const sessionId = req.cookies.session;
  if (!sessionId || !SESSIONS.has(sessionId)) return reply.code(401).send({ error: 'Unauthorized' });

  // Mock Connector Logic
  switch (moduleName) {
    case 'team_performance':
      // Return structured data matching frontend interface TeamPerformanceData
      const performanceData = Array.from({ length: 8 }, (_, i) => {
          const num = (i + 1).toString().padStart(2, '0');
          const baseSeed = (i + 1) * 17;
          return {
            teamLeadId: `tl_${num}`,
            teamLeadName: `Team Lead ${num}`,
            weeklyKYCs: 15 + (baseSeed % 35),
            weeklyCollection: 50000 + ((baseSeed * 13) % 450000),
            weeklyTradingVolume: 500000 + ((baseSeed * 29) % 4500000),
            totalAgents: 20
          };
      });
      return { data: performanceData };

    case 'upload_xlsx':
       return { status: 'ready', allowed_types: ['.xlsx', '.xls'] };
    default:
      return { 
        module: moduleName, 
        status: 'active', 
        data: { message: `Mock data for ${moduleName}` } 
      };
  }
});

// Start
const start = async () => {
  try {
    await server.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Backend running at http://localhost:${PORT}`);
  } catch (err) {
    server.log.error(err);
    exit(1);
  }
};
start();