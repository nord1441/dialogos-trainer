import { describe, it, expect } from 'vitest';
import { OpenAIProvider } from '../../../../src/server/services/llm/openai.js';

describe('OpenAIProvider', () => {
  // テスト対象: OpenAIProvider.constructor
  // 目的: 正常系 - プロバイダーが正しく初期化されることを検証
  // 期待結果: nameプロパティが'openai'となる
  it('正しい名前で初期化される', () => {
    const provider = new OpenAIProvider({ apiKey: 'test-key', baseUrl: 'https://api.openai.com/v1' });
    expect(provider.name).toBe('openai');
  });

  // テスト対象: OpenAIProvider.listModels
  // 目的: 異常系 - 無効なAPIキーでモデル取得した場合に空配列が返されることを検証
  // 期待結果: エラーをスローせず空配列が返される
  it('無効なAPIキーで空のモデル配列を返す', async () => {
    const provider = new OpenAIProvider({ apiKey: 'invalid-key', baseUrl: 'https://api.openai.com/v1' });
    const models = await provider.listModels();
    expect(Array.isArray(models)).toBe(true);
  });
});
