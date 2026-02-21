import { describe, it, expect } from 'vitest';
import { AnthropicProvider } from '../../../../src/server/services/llm/anthropic.js';

describe('AnthropicProvider', () => {
  // テスト対象: AnthropicProvider.constructor
  // 目的: 正常系 - プロバイダーが正しく初期化されることを検証
  // 期待結果: nameプロパティが'anthropic'となる
  it('正しい名前で初期化される', () => {
    const provider = new AnthropicProvider({ apiKey: 'test-key', baseUrl: 'https://api.anthropic.com' });
    expect(provider.name).toBe('anthropic');
  });

  // テスト対象: AnthropicProvider.listModels
  // 目的: 正常系 - 既知のモデル一覧が返されることを検証
  // 期待結果: 空でないモデル配列が返され、各モデルにid, name, providerが含まれる
  it('既知のモデル一覧を返す', async () => {
    const provider = new AnthropicProvider({ apiKey: 'test-key', baseUrl: 'https://api.anthropic.com' });
    const models = await provider.listModels();

    expect(models.length).toBeGreaterThan(0);
    for (const model of models) {
      expect(model.id).toBeTruthy();
      expect(model.name).toBeTruthy();
      expect(model.provider).toBe('anthropic');
    }
  });

  // テスト対象: AnthropicProvider.listModels
  // 目的: 正常系 - Claude 3.5 Sonnetモデルが一覧に含まれることを検証
  // 期待結果: claude-3-5-sonnet のIDを持つモデルが存在する
  it('Claude 3.5 Sonnetモデルが含まれる', async () => {
    const provider = new AnthropicProvider({ apiKey: 'test-key', baseUrl: 'https://api.anthropic.com' });
    const models = await provider.listModels();

    const sonnet = models.find((m) => m.id.includes('claude-3-5-sonnet'));
    expect(sonnet).toBeDefined();
  });
});
