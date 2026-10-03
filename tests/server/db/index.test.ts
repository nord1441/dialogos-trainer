import { describe, it, expect, afterEach } from 'vitest';
import { initDb, getDb, closeDb } from '../../../src/server/db/index.js';
import path from 'path';
import fs from 'fs';
import os from 'os';

function createTempDbPath(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dialogos-test-'));
  return path.join(dir, 'test.db');
}

describe('Database', () => {
  let dbPath: string;

  afterEach(() => {
    closeDb();
    if (dbPath && fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      const dir = path.dirname(dbPath);
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  // テスト対象: initDb
  // 目的: 正常系 - データベースが正常に初期化され、テーブルが作成されることを検証
  // 期待結果: データベースインスタンスが返却され、必要なテーブルが存在する
  it('データベースを正常に初期化できる', () => {
    dbPath = createTempDbPath();
    const db = initDb(dbPath);
    expect(db).toBeDefined();

    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all() as Array<{ name: string }>;
    const tableNames = tables.map((t) => t.name);

    expect(tableNames).toContain('settings');
    expect(tableNames).toContain('personas');
    expect(tableNames).toContain('sessions');
    expect(tableNames).toContain('messages');
  });

  // テスト対象: getDb
  // 目的: 異常系 - 初期化前にgetDbを呼び出した場合にエラーがスローされることを検証
  // 期待結果: エラーがスローされる
  it('初期化前にgetDbを呼ぶとエラーが発生する', () => {
    expect(() => getDb()).toThrow('Database not initialized');
  });

  // テスト対象: getDb
  // 目的: 正常系 - 初期化後にgetDbで同じインスタンスが取得できることを検証
  // 期待結果: initDbで返却されたものと同じインスタンスが取得される
  it('初期化後にgetDbで正しいインスタンスが取得できる', () => {
    dbPath = createTempDbPath();
    const db = initDb(dbPath);
    const db2 = getDb();
    expect(db2).toBe(db);
  });

  // テスト対象: initDb マイグレーション
  // 目的: 正常系 - settingsテーブルにデータを挿入・取得できることを検証
  // 期待結果: INSERT/SELECTが正常に動作する
  it('settingsテーブルにデータを保存・取得できる', () => {
    dbPath = createTempDbPath();
    const db = initDb(dbPath);

    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('test_key', 'test_value');
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('test_key') as { value: string };
    expect(row.value).toBe('test_value');
  });

  // テスト対象: initDb マイグレーション
  // 目的: 正常系 - messagesテーブルのrole制約が動作することを検証
  // 期待結果: 不正なrole値ではエラーが発生する
  it('messagesテーブルのrole制約が正常に動作する', () => {
    dbPath = createTempDbPath();
    const db = initDb(dbPath);

    db.prepare(`INSERT INTO personas (id, name, age, gender, occupation, personality, background, speaking_style, system_prompt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run('p1', 'Test', 30, '男性', 'テスト', 'テスト', 'テスト', 'テスト', 'テスト');
    db.prepare(`INSERT INTO sessions (id, persona_id, title) VALUES (?, ?, ?)`).run('s1', 'p1', 'テスト');

    expect(() => {
      db.prepare(`INSERT INTO messages (id, session_id, role, content) VALUES (?, ?, ?, ?)`)
        .run('m1', 's1', 'invalid_role', 'test');
    }).toThrow();
  });
});
