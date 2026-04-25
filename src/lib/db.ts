// ============================================================
// Turso (libSQL) Database Layer
// ============================================================
import { createClient, type Client } from '@libsql/client';
import { DEFAULT_STATUS, DEFAULT_DNA, type PetStatus, type PetDNA, type JournalEntry, type DailyTask, INTERACTION, RANK_XP_THRESHOLDS } from './types';

let _client: Client | null = null;

function getClient(): Client {
  if (_client) return _client;

  _client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  return _client;
}

let _initialized = false;

async function ensureInit(): Promise<Client> {
  const client = getClient();
  if (_initialized) return client;

  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      display_name TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS pet_status (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS pet_dna (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dna TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS interactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      interaction_type INTEGER NOT NULL,
      metadata TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS memories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      metadata TEXT,
      keywords TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS journal (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      thought TEXT NOT NULL,
      sentiment TEXT NOT NULL DEFAULT 'neutral',
      unlock_level INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS chat_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS accessories_owned (
      id TEXT PRIMARY KEY,
      equipped INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS daily_tasks (
      id TEXT PRIMARY KEY,
      description TEXT NOT NULL,
      type TEXT NOT NULL,
      target INTEGER NOT NULL,
      current INTEGER NOT NULL DEFAULT 0,
      xp_reward INTEGER NOT NULL DEFAULT 10,
      completed INTEGER NOT NULL DEFAULT 0,
      cycle TEXT NOT NULL DEFAULT 'daily',
      created_date TEXT NOT NULL DEFAULT (date('now'))
    );
  `);

  // Migration: Add cycle column if missing
  try {
    await client.execute('ALTER TABLE daily_tasks ADD COLUMN cycle TEXT NOT NULL DEFAULT "daily"');
  } catch (e) {
    // Column likely already exists
  }

  // Seed initial state if empty
  const count = await client.execute('SELECT COUNT(*) as count FROM pet_status');
  if (Number(count.rows[0]?.count) === 0) {
    await client.execute({ sql: 'INSERT INTO pet_status (status) VALUES (?)', args: [JSON.stringify(DEFAULT_STATUS)] });
    await client.execute({ sql: 'INSERT INTO pet_dna (dna) VALUES (?)', args: [JSON.stringify(DEFAULT_DNA)] });
    await seedDailyTasks(client);
  }

  _initialized = true;
  return client;
}


// ============================================================
// Status Operations
// ============================================================

export async function getLatestStatus(): Promise<PetStatus> {
  const client = await ensureInit();
  const result = await client.execute('SELECT status FROM pet_status ORDER BY id DESC LIMIT 1');
  if (result.rows.length === 0) return DEFAULT_STATUS;
  return JSON.parse(result.rows[0].status as string);
}

export async function updateStatus(s: PetStatus): Promise<void> {
  const client = await ensureInit();
  await client.execute({ sql: 'INSERT INTO pet_status (status) VALUES (?)', args: [JSON.stringify(s)] });
}

export async function addXP(amount: number): Promise<PetStatus> {
  const status = await getLatestStatus();
  status.xp += amount;
  
  // Check for rank up
  const nextRankThreshold = RANK_XP_THRESHOLDS[status.rank + 1];
  if (nextRankThreshold && status.xp >= nextRankThreshold) {
    status.rank = Math.min(5, status.rank + 1);
  }
  
  await updateStatus(status);
  return status;
}

// ============================================================
// DNA Operations
// ============================================================

export async function getLatestDNA(): Promise<PetDNA> {
  const client = await ensureInit();
  const result = await client.execute('SELECT dna FROM pet_dna ORDER BY id DESC LIMIT 1');
  if (result.rows.length === 0) return DEFAULT_DNA;
  return JSON.parse(result.rows[0].dna as string);
}

export async function updateDNA(dna: PetDNA): Promise<void> {
  const client = await ensureInit();
  await client.execute({ sql: 'INSERT INTO pet_dna (dna) VALUES (?)', args: [JSON.stringify(dna)] });
}

// ============================================================
// Interaction Operations
// ============================================================

export async function saveInteraction(type: INTERACTION, metadata: Record<string, unknown> = {}): Promise<void> {
  const client = await ensureInit();
  await client.execute({ sql: 'INSERT INTO interactions (interaction_type, metadata) VALUES (?, ?)', args: [type, JSON.stringify(metadata)] });
}

export async function getLastInteractions(limit: number = 10): Promise<{ interaction_type: number; metadata: string; created_at: string }[]> {
  const client = await ensureInit();
  const result = await client.execute({ sql: 'SELECT interaction_type, metadata, created_at FROM interactions ORDER BY id DESC LIMIT ?', args: [limit] });
  return result.rows.map(r => ({
    interaction_type: Number(r.interaction_type),
    metadata: r.metadata as string,
    created_at: r.created_at as string,
  }));
}

// ============================================================
// Memory Operations
// ============================================================

export async function saveMemory(content: string, metadata: Record<string, unknown> = {}): Promise<void> {
  const client = await ensureInit();
  const keywords = content.toLowerCase().split(/\W+/).filter(w => w.length > 2).join(',');
  await client.execute({ sql: 'INSERT INTO memories (content, metadata, keywords) VALUES (?, ?, ?)', args: [content, JSON.stringify(metadata), keywords] });
}

export async function searchMemories(query: string, limit: number = 5): Promise<{ content: string; metadata: string }[]> {
  const client = await ensureInit();
  const queryWords = query.toLowerCase().split(/\W+/).filter(w => w.length > 2);

  if (queryWords.length === 0) {
    const result = await client.execute({ sql: 'SELECT content, metadata FROM memories ORDER BY id DESC LIMIT ?', args: [limit] });
    return result.rows.map(r => ({ content: r.content as string, metadata: r.metadata as string }));
  }

  // Simple keyword-based similarity search
  const conditions = queryWords.map(() => "keywords LIKE ?").join(' OR ');
  const args = [...queryWords.map(w => `%${w}%`), limit];

  const result = await client.execute({ sql: `SELECT content, metadata FROM memories WHERE ${conditions} ORDER BY id DESC LIMIT ?`, args });
  return result.rows.map(r => ({ content: r.content as string, metadata: r.metadata as string }));
}

// ============================================================
// Journal Operations
// ============================================================

export async function addJournalEntry(thought: string, sentiment: string, unlockLevel: number): Promise<void> {
  const client = await ensureInit();
  await client.execute({ sql: 'INSERT INTO journal (thought, sentiment, unlock_level) VALUES (?, ?, ?)', args: [thought, sentiment, unlockLevel] });
}

export async function getJournalEntries(currentSyncLevel: number): Promise<JournalEntry[]> {
  const client = await ensureInit();
  const result = await client.execute({ sql: 'SELECT id, thought, sentiment, created_at as createdAt, unlock_level as unlockLevel FROM journal WHERE unlock_level <= ? ORDER BY id DESC LIMIT 20', args: [currentSyncLevel] });
  return result.rows.map(r => ({
    id: Number(r.id),
    thought: r.thought as string,
    sentiment: r.sentiment as string,
    createdAt: r.createdAt as string,
    unlockLevel: Number(r.unlockLevel),
  }));
}

export async function getLockedJournalCount(currentSyncLevel: number): Promise<number> {
  const client = await ensureInit();
  const result = await client.execute({ sql: 'SELECT COUNT(*) as count FROM journal WHERE unlock_level > ?', args: [currentSyncLevel] });
  return Number(result.rows[0]?.count ?? 0);
}

// ============================================================
// Chat Operations
// ============================================================

export async function saveChatMessage(role: string, content: string): Promise<void> {
  const client = await ensureInit();
  await client.execute({ sql: 'INSERT INTO chat_history (role, content) VALUES (?, ?)', args: [role, content] });
}

export async function getChatHistory(limit: number = 20): Promise<{ role: string; content: string; created_at: string }[]> {
  const client = await ensureInit();
  const result = await client.execute({ sql: 'SELECT role, content, created_at FROM chat_history ORDER BY id DESC LIMIT ?', args: [limit] });
  return result.rows.map(r => ({
    role: r.role as string,
    content: r.content as string,
    created_at: r.created_at as string,
  }));
}

// ============================================================
// Accessories Operations
// ============================================================

export async function getOwnedAccessories(): Promise<string[]> {
  const client = await ensureInit();
  const result = await client.execute('SELECT id FROM accessories_owned');
  return result.rows.map(r => r.id as string);
}

export async function getEquippedAccessories(): Promise<string[]> {
  const client = await ensureInit();
  const result = await client.execute('SELECT id FROM accessories_owned WHERE equipped = 1');
  return result.rows.map(r => r.id as string);
}

export async function buyAccessory(id: string): Promise<void> {
  const client = await ensureInit();
  await client.execute({ sql: 'INSERT OR IGNORE INTO accessories_owned (id, equipped) VALUES (?, 0)', args: [id] });
}

export async function toggleAccessory(id: string): Promise<boolean> {
  const client = await ensureInit();
  const result = await client.execute({ sql: 'SELECT equipped FROM accessories_owned WHERE id = ?', args: [id] });
  if (result.rows.length === 0) return false;
  const newState = Number(result.rows[0].equipped) ? 0 : 1;
  await client.execute({ sql: 'UPDATE accessories_owned SET equipped = ? WHERE id = ?', args: [newState, id] });
  return newState === 1;
}

// ============================================================
// Tasks Operations
// ============================================================

export async function getTasks(): Promise<DailyTask[]> {
  const client = await ensureInit();
  const firstTask = await client.execute('SELECT created_date FROM daily_tasks LIMIT 1');
  const today = new Date().toISOString().split('T')[0];

  if (firstTask.rows.length > 0 && (firstTask.rows[0].created_date as string) !== today) {
    // Keep weekly/monthly, reset daily
    await client.execute('DELETE FROM daily_tasks WHERE cycle = "daily"');
    await seedDailyTasks(client);
  }

  const result = await client.execute('SELECT id, description, type, target, current, xp_reward as xpReward, completed, cycle FROM daily_tasks');
  return result.rows.map(r => ({
    id: r.id as string,
    description: r.description as string,
    type: r.type as 'play' | 'feed' | 'chat' | 'bath' | 'discipline',
    target: Number(r.target),
    current: Number(r.current),
    xpReward: Number(r.xpReward),
    completed: Number(r.completed) !== 0,
    cycle: (r.cycle as 'daily' | 'weekly' | 'monthly') || 'daily',
  }));
}

export const getDailyTasks = getTasks;

async function seedDailyTasks(client: Client) {
  const daily = [
    { id: 'd1', desc: 'Feed your pet twice', type: 'feed', target: 2, xp: 20 },
    { id: 'd2', desc: 'Play with your pet', type: 'play', target: 1, xp: 15 },
    { id: 'd3', desc: 'Chat 5 times', type: 'chat', target: 5, xp: 25 },
  ];
  const weekly = [
    { id: 'w1', desc: 'Max out all stats once', type: 'play', target: 1, xp: 100 },
    { id: 'w2', desc: 'Reach Sync 50', type: 'chat', target: 50, xp: 150 },
  ];
  const monthly = [
    { id: 'm1', desc: 'Reach Legendary Rank', type: 'play', target: 1, xp: 500 },
  ];

  for (const t of daily) {
    await client.execute({ sql: 'INSERT OR IGNORE INTO daily_tasks (id, description, type, target, xp_reward, cycle) VALUES (?, ?, ?, ?, ?, "daily")', args: [t.id, t.desc, t.type, t.target, t.xp] });
  }
  for (const t of weekly) {
    await client.execute({ sql: 'INSERT OR IGNORE INTO daily_tasks (id, description, type, target, xp_reward, cycle) VALUES (?, ?, ?, ?, ?, "weekly")', args: [t.id, t.desc, t.type, t.target, t.xp] });
  }
  for (const t of monthly) {
    await client.execute({ sql: 'INSERT OR IGNORE INTO daily_tasks (id, description, type, target, xp_reward, cycle) VALUES (?, ?, ?, ?, ?, "monthly")', args: [t.id, t.desc, t.type, t.target, t.xp] });
  }
}

export async function incrementTaskProgress(taskType: string): Promise<{ completed: boolean; xpReward: number } | null> {
  const client = await ensureInit();
  const result = await client.execute({ sql: 'SELECT id, current, target, xp_reward, completed FROM daily_tasks WHERE type = ? AND completed = 0 LIMIT 1', args: [taskType] });

  if (result.rows.length === 0) return null;

  const task = result.rows[0];
  const newCurrent = Number(task.current) + 1;
  const justCompleted = newCurrent >= Number(task.target);

  await client.execute({ sql: 'UPDATE daily_tasks SET current = ?, completed = ? WHERE id = ?', args: [newCurrent, justCompleted ? 1 : 0, task.id as string] });

  return justCompleted ? { completed: true, xpReward: Number(task.xp_reward) } : { completed: false, xpReward: 0 };
}

// ============================================================
// Auth Operations
// ============================================================

function simpleHash(str: string): string {
  // Simple hash for demo purposes (NOT production-ready)
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36) + str.length.toString(36) + 'x' + str.split('').reduce((a, c) => a + c.charCodeAt(0), 0).toString(36);
}

function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 48; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export async function createUser(username: string, password: string, displayName?: string): Promise<{ success: boolean; error?: string; token?: string; user?: { id: number; username: string; displayName: string } }> {
  const client = await ensureInit();
  try {
    const existing = await client.execute({ sql: 'SELECT id FROM users WHERE username = ?', args: [username.toLowerCase()] });
    if (existing.rows.length > 0) {
      return { success: false, error: 'Username already taken' };
    }
    const hash = simpleHash(password);
    const name = displayName || username;
    await client.execute({ sql: 'INSERT INTO users (username, password_hash, display_name) VALUES (?, ?, ?)', args: [username.toLowerCase(), hash, name] });
    const user = await client.execute({ sql: 'SELECT id, username, display_name FROM users WHERE username = ?', args: [username.toLowerCase()] });
    const userId = Number(user.rows[0].id);
    const token = generateToken();
    await client.execute({ sql: 'INSERT INTO sessions (token, user_id) VALUES (?, ?)', args: [token, userId] });
    return { success: true, token, user: { id: userId, username: username.toLowerCase(), displayName: name } };
  } catch (error) {
    console.error('Create user error:', error);
    return { success: false, error: 'Failed to create user' };
  }
}

export async function loginUser(username: string, password: string): Promise<{ success: boolean; error?: string; token?: string; user?: { id: number; username: string; displayName: string } }> {
  const client = await ensureInit();
  try {
    const hash = simpleHash(password);
    const result = await client.execute({ sql: 'SELECT id, username, display_name, password_hash FROM users WHERE username = ?', args: [username.toLowerCase()] });
    if (result.rows.length === 0) {
      return { success: false, error: 'Invalid username or password' };
    }
    if (result.rows[0].password_hash !== hash) {
      return { success: false, error: 'Invalid username or password' };
    }
    const userId = Number(result.rows[0].id);
    const token = generateToken();
    await client.execute({ sql: 'INSERT INTO sessions (token, user_id) VALUES (?, ?)', args: [token, userId] });
    return {
      success: true,
      token,
      user: {
        id: userId,
        username: result.rows[0].username as string,
        displayName: (result.rows[0].display_name as string) || (result.rows[0].username as string),
      },
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Login failed' };
  }
}

export async function getUserByToken(token: string): Promise<{ id: number; username: string; displayName: string } | null> {
  const client = await ensureInit();
  try {
    const result = await client.execute({
      sql: 'SELECT u.id, u.username, u.display_name FROM users u JOIN sessions s ON u.id = s.user_id WHERE s.token = ?',
      args: [token],
    });
    if (result.rows.length === 0) return null;
    return {
      id: Number(result.rows[0].id),
      username: result.rows[0].username as string,
      displayName: (result.rows[0].display_name as string) || (result.rows[0].username as string),
    };
  } catch {
    return null;
  }
}

export async function deleteSession(token: string): Promise<void> {
  const client = await ensureInit();
  await client.execute({ sql: 'DELETE FROM sessions WHERE token = ?', args: [token] });
}
