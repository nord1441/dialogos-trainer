import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import express from 'express';
import { healthRouter } from '../../../src/server/routes/health.js';
import http from 'http';

describe('Health Route', () => {
  let app: express.Express;
  let server: http.Server;
  let baseUrl: string;

  beforeEach(async () => {
    app = express();
    app.use('/api/health', healthRouter);
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
  });

  // テスト対象: GET /api/health
  // 目的: 正常系 - ヘルスチェックエンドポイントが正常なレスポンスを返すことを検証
  // 期待結果: status 200でstatus: 'ok'とtimestampが含まれるJSONが返される
  it('ヘルスチェックが正常に応答する', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.status).toBe('ok');
    expect(data.timestamp).toBeDefined();
  });

  // テスト対象: GET /api/health
  // 目的: 正常系 - timestampが有効なISO 8601形式であることを検証
  // 期待結果: timestampがDateオブジェクトとして正常にパースできる
  it('timestampが有効なISO形式である', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    const data = await res.json();

    const date = new Date(data.timestamp);
    expect(date.getTime()).not.toBeNaN();
  });
});
