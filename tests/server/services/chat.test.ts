import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  createSession,
  getSessionById,
  getAllSessions,
  deleteSession,
  getSessionMessages,
} from '../../../src/server/services/chat.js';
import { generatePersona, savePersona } from '../../../src/server/services/persona.js';
import { initDb, closeDb, getDb } from '../../../src/server/db/index.js';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

let dbPath: string;

function createTempDbPath(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dialogos-test-'));
  return path.join(dir, 'test.db');
}

describe('Chat Service', () => {
  beforeEach(() => {
    dbPath = createTempDbPath();
    initDb(dbPath);
  });

  afterEach(() => {
    closeDb();
    if (dbPath && fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      fs.rmSync(path.dirname(dbPath), { recursive: true, force: true });
    }
  });

  // テスト対象: createSession
  // 目的: 正常系 - 指定したペルソナでセッションが正常に作成されることを検証
  // 期待結果: セッションオブジェクトが返却され、ペルソナ情報が含まれる
  it('指定ペルソナでセッションを作成できる', () => {
    const persona = generatePersona();
    savePersona(persona);

    const session = createSession(persona.id);
    expect(session.id).toBeDefined();
    expect(session.persona_id).toBe(persona.id);
    expect(session.persona_name).toBe(persona.name);
    expect(session.persona_occupation).toBe(persona.occupation);
  });

  // テスト対象: createSession
  // 目的: 正常系 - ペルソナIDを指定しない場合にランダムなペルソナでセッションが作成されることを検証
  // 期待結果: セッションがランダムなペルソナで作成される（デフォルトペルソナが初期投入される）
  it('ペルソナ未指定でもセッションを作成できる', () => {
    const session = createSession();
    expect(session.id).toBeDefined();
    expect(session.persona_name).toBeTruthy();
  });

  // テスト対象: getSessionById
  // 目的: 正常系 - セッションIDによる取得が正常に動作することを検証
  // 期待結果: セッション情報とペルソナ情報が取得される
  it('IDでセッションを取得できる', () => {
    const persona = generatePersona();
    savePersona(persona);
    const session = createSession(persona.id);

    const retrieved = getSessionById(session.id);
    expect(retrieved).toBeDefined();
    expect(retrieved!.id).toBe(session.id);
    expect(retrieved!.persona_name).toBe(persona.name);
  });

  // テスト対象: getSessionById
  // 目的: 異常系 - 存在しないセッションIDで取得した場合にundefinedが返されることを検証
  // 期待結果: undefinedが返される
  it('存在しないIDではundefinedが返される', () => {
    const retrieved = getSessionById('nonexistent-id');
    expect(retrieved).toBeUndefined();
  });

  // テスト対象: getAllSessions
  // 目的: 正常系 - 全セッションの一覧取得が正常に動作することを検証
  // 期待結果: 作成した全セッションが取得される
  it('全セッションを一覧取得できる', () => {
    const persona = generatePersona();
    savePersona(persona);
    createSession(persona.id);
    createSession(persona.id);

    const sessions = getAllSessions();
    expect(sessions).toHaveLength(2);
  });

  // テスト対象: deleteSession
  // 目的: 正常系 - セッションとそのメッセージが削除されることを検証
  // 期待結果: セッション削除後にgetSessionByIdでundefinedが返される
  it('セッションを削除できる', () => {
    const persona = generatePersona();
    savePersona(persona);
    const session = createSession(persona.id);

    deleteSession(session.id);

    const retrieved = getSessionById(session.id);
    expect(retrieved).toBeUndefined();
  });

  // テスト対象: getSessionMessages
  // 目的: 正常系 - セッションのメッセージが正しい順序で取得されることを検証
  // 期待結果: メッセージが作成日時の昇順で返される
  it('セッションのメッセージを取得できる', () => {
    const persona = generatePersona();
    savePersona(persona);
    const session = createSession(persona.id);

    const db = getDb();
    db.prepare('INSERT INTO messages (id, session_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)')
      .run(uuidv4(), session.id, 'user', 'こんにちは', new Date().toISOString());
    db.prepare('INSERT INTO messages (id, session_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)')
      .run(uuidv4(), session.id, 'assistant', 'こんにちは！', new Date().toISOString());

    const messages = getSessionMessages(session.id);
    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe('user');
    expect(messages[1].role).toBe('assistant');
  });

  // テスト対象: deleteSession
  // 目的: 正常系 - セッション削除時にメッセージもカスケード削除されることを検証
  // 期待結果: セッション削除後にメッセージも削除される
  it('セッション削除でメッセージもカスケード削除される', () => {
    const persona = generatePersona();
    savePersona(persona);
    const session = createSession(persona.id);

    const db = getDb();
    db.prepare('INSERT INTO messages (id, session_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)')
      .run(uuidv4(), session.id, 'user', 'テスト', new Date().toISOString());

    deleteSession(session.id);

    const messages = getSessionMessages(session.id);
    expect(messages).toHaveLength(0);
  });
});
