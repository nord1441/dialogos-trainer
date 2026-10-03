import { Router } from 'express';
import { getDb } from '../db/index.js';

export const settingsRouter = Router();

const ALLOWED_KEYS = [
  'active_provider',
  'active_model',
  'anthropic_api_key',
  'anthropic_base_url',
  'openai_api_key',
  'openai_base_url',
  'gemini_api_key',
  'gemini_base_url',
  'ollama_base_url',
  'selected_models',
];

settingsRouter.get('/', (_req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT key, value FROM settings').all() as Array<{ key: string; value: string }>;
  const settings: Record<string, string> = {};
  for (const row of rows) {
    if (row.key.includes('api_key') && row.value) {
      settings[row.key] = row.value.substring(0, 8) + '...' + row.value.substring(row.value.length - 4);
    } else {
      settings[row.key] = row.value;
    }
  }
  res.json(settings);
});

settingsRouter.put('/', (req, res) => {
  const db = getDb();
  const updates = req.body as Record<string, string>;
  const upsert = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');

  const transaction = db.transaction(() => {
    for (const [key, value] of Object.entries(updates)) {
      if (ALLOWED_KEYS.includes(key)) {
        upsert.run(key, value);
      }
    }
  });

  transaction();
  res.json({ success: true });
});

settingsRouter.get('/raw/:key', (req, res) => {
  const { key } = req.params;
  if (!ALLOWED_KEYS.includes(key)) {
    res.status(400).json({ error: '不正な設定キーです' });
    return;
  }
  const db = getDb();
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined;
  res.json({ value: row?.value || '' });
});
