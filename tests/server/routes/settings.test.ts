import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import express from 'express';
import { settingsRouter } from '../../../src/server/routes/settings.js';
import { initDb, closeDb } from '../../../src/server/db/index.js';
import http from 'http';
import path from 'path';
import fs from 'fs';
import os from 'os';

describe('Settings Route', () => {
  let app: express.Express;
  let server: http.Server;
  let baseUrl: string;
  let dbPath: string;

  beforeEach(async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dialogos-test-'));
    dbPath = path.join(dir, 'test.db');
    initDb(dbPath);

    app = express();
    app.use(express.json());
    app.use('/api/settings', settingsRouter);

    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const addr = server.address();
        if (addr && typeof addr === 'object') {
          baseUrl = `http://localhost:${addr.port}`;
        }
        resolve();
      });
    });
  });

  afterEach(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
    closeDb();
    if (dbPath && fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      fs.rmSync(path.dirname(dbPath), { recursive: true, force: true });
    }
  });

  // テスト対象: GET /api/settings
  // 目的: 正常系 - 設定一覧が空のオブジェクトとして取得されることを検証（初期状態）
  // 期待結果: status 200で空のオブジェクトが返される
  it('初期状態で設定一覧を取得できる', async () => {
    const res = await fetch(`${baseUrl}/api/settings`);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(typeof data).toBe('object');
  });

  // テスト対象: PUT /api/settings
  // 目的: 正常系 - 設定の保存と取得が正常に動作することを検証
  // 期待結果: 設定を保存した後、GET で保存した値が取得できる
  it('設定を保存して取得できる', async () => {
    const putRes = await fetch(`${baseUrl}/api/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        active_provider: 'openai',
        active_model: 'gpt-4o',
        ollama_base_url: 'http://localhost:11434',
      }),
    });
    expect(putRes.status).toBe(200);

    const getRes = await fetch(`${baseUrl}/api/settings`);
    const data = await getRes.json();

    expect(data.active_provider).toBe('openai');
    expect(data.active_model).toBe('gpt-4o');
    expect(data.ollama_base_url).toBe('http://localhost:11434');
  });

  // テスト対象: PUT /api/settings
  // 目的: 正常系 - 許可されていないキーが無視されることを検証
  // 期待結果: 不正なキーの値は保存されない
  it('許可されていないキーは無視される', async () => {
    await fetch(`${baseUrl}/api/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        active_provider: 'anthropic',
        malicious_key: 'bad_value',
      }),
    });

    const getRes = await fetch(`${baseUrl}/api/settings`);
    const data = await getRes.json();

    expect(data.active_provider).toBe('anthropic');
    expect(data.malicious_key).toBeUndefined();
  });

  // テスト対象: GET /api/settings
  // 目的: 正常系 - APIキーがマスクされて返されることを検証
  // 期待結果: APIキーの中間部分が'...'でマスクされる
  it('APIキーがマスクされて返される', async () => {
    await fetch(`${baseUrl}/api/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        anthropic_api_key: 'sk-ant-api03-abcdefghijklmnop',
      }),
    });

    const getRes = await fetch(`${baseUrl}/api/settings`);
    const data = await getRes.json();

    expect(data.anthropic_api_key).toContain('...');
    expect(data.anthropic_api_key).not.toBe('sk-ant-api03-abcdefghijklmnop');
  });
});
