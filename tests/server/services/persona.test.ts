import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  generatePersona,
  generateMultiplePersonas,
  savePersona,
  getAllPersonas,
  getPersonaById,
  deletePersona,
  getRandomPersona,
  initDefaultPersonas,
} from '../../../src/server/services/persona.js';
import { initDb, closeDb } from '../../../src/server/db/index.js';
import path from 'path';
import fs from 'fs';
import os from 'os';

let dbPath: string;

function createTempDbPath(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dialogos-test-'));
  return path.join(dir, 'test.db');
}

describe('Persona Service', () => {
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

  // テスト対象: generatePersona
  // 目的: 正常系 - ペルソナが有効な属性で正常に生成されることを検証
  // 期待結果: 必要な全フィールドを持つペルソナオブジェクトが返却される
  it('ペルソナを正常に生成できる', () => {
    const persona = generatePersona();

    expect(persona.id).toBeDefined();
    expect(persona.name).toBeTruthy();
    expect(persona.age).toBeGreaterThanOrEqual(18);
    expect(persona.age).toBeLessThanOrEqual(80);
    expect(['男性', '女性']).toContain(persona.gender);
    expect(persona.occupation).toBeTruthy();
    expect(persona.personality).toBeTruthy();
    expect(persona.background).toBeTruthy();
    expect(persona.speaking_style).toBeTruthy();
    expect(persona.system_prompt).toBeTruthy();
  });

  // テスト対象: generatePersona
  // 目的: 正常系 - 生成されるペルソナのsystem_promptに必要な情報が含まれることを検証
  // 期待結果: system_promptにペルソナの名前・年齢・職業が含まれる
  it('system_promptにペルソナ情報が含まれている', () => {
    const persona = generatePersona();

    expect(persona.system_prompt).toContain(persona.name);
    expect(persona.system_prompt).toContain(String(persona.age));
    expect(persona.system_prompt).toContain(persona.occupation);
  });

  // テスト対象: generateMultiplePersonas
  // 目的: 正常系 - 指定した数のペルソナが生成されることを検証
  // 期待結果: 指定数のペルソナ配列が返却され、各ペルソナのIDがユニーク
  it('指定数のペルソナを一括生成できる', () => {
    const personas = generateMultiplePersonas(5);

    expect(personas).toHaveLength(5);

    const ids = new Set(personas.map((p) => p.id));
    expect(ids.size).toBe(5);
  });

  // テスト対象: savePersona, getPersonaById
  // 目的: 正常系 - ペルソナの保存と取得が正常に動作することを検証
  // 期待結果: 保存したペルソナをIDで取得でき、各フィールドが一致する
  it('ペルソナを保存して取得できる', () => {
    const persona = generatePersona();
    savePersona(persona);

    const retrieved = getPersonaById(persona.id);
    expect(retrieved).toBeDefined();
    expect(retrieved!.name).toBe(persona.name);
    expect(retrieved!.age).toBe(persona.age);
    expect(retrieved!.gender).toBe(persona.gender);
    expect(retrieved!.occupation).toBe(persona.occupation);
  });

  // テスト対象: getAllPersonas
  // 目的: 正常系 - 全ペルソナの一覧取得が正常に動作することを検証
  // 期待結果: 保存した全ペルソナが取得される
  it('全ペルソナを一覧取得できる', () => {
    const personas = generateMultiplePersonas(3);
    for (const p of personas) {
      savePersona(p);
    }

    const all = getAllPersonas();
    expect(all).toHaveLength(3);
  });

  // テスト対象: deletePersona
  // 目的: 正常系 - ペルソナの削除が正常に動作することを検証
  // 期待結果: 削除後にgetPersonaByIdでundefinedが返される
  it('ペルソナを削除できる', () => {
    const persona = generatePersona();
    savePersona(persona);

    deletePersona(persona.id);

    const retrieved = getPersonaById(persona.id);
    expect(retrieved).toBeUndefined();
  });

  // テスト対象: getRandomPersona
  // 目的: 正常系 - ランダムなペルソナの取得が正常に動作することを検証
  // 期待結果: 保存済みのペルソナの中からランダムに1つが返される
  it('ランダムにペルソナを取得できる', () => {
    const personas = generateMultiplePersonas(5);
    for (const p of personas) {
      savePersona(p);
    }

    const random = getRandomPersona();
    expect(random).toBeDefined();
    expect(personas.some((p) => p.id === random!.id)).toBe(true);
  });

  // テスト対象: getRandomPersona
  // 目的: 異常系 - ペルソナが存在しない場合にundefinedが返されることを検証
  // 期待結果: undefinedが返される
  it('ペルソナが存在しない場合undefinedが返される', () => {
    const random = getRandomPersona();
    expect(random).toBeUndefined();
  });

  // テスト対象: initDefaultPersonas
  // 目的: 正常系 - デフォルトペルソナが空のDBに初期投入されることを検証
  // 期待結果: 10件のペルソナが生成される
  it('デフォルトペルソナが初期投入される', () => {
    initDefaultPersonas();

    const all = getAllPersonas();
    expect(all).toHaveLength(10);
  });

  // テスト対象: initDefaultPersonas
  // 目的: 正常系 - 既にペルソナが存在する場合に追加投入されないことを検証
  // 期待結果: 既存のペルソナ数が変わらない
  it('既にペルソナがある場合は追加投入されない', () => {
    const persona = generatePersona();
    savePersona(persona);

    initDefaultPersonas();

    const all = getAllPersonas();
    expect(all).toHaveLength(1);
  });
});
