import { Router } from 'express';
import { createProvider, type ProviderName } from '../services/llm/index.js';

export const providersRouter = Router();

const VALID_PROVIDERS: ProviderName[] = ['anthropic', 'openai', 'gemini', 'ollama'];

providersRouter.get('/', (_req, res) => {
  res.json(VALID_PROVIDERS.map((p) => ({
    name: p,
    label: getProviderLabel(p),
  })));
});

providersRouter.get('/:provider/models', async (req, res) => {
  const providerName = req.params.provider as ProviderName;
  if (!VALID_PROVIDERS.includes(providerName)) {
    res.status(400).json({ error: '不正なプロバイダーです' });
    return;
  }

  try {
    const provider = createProvider(providerName);
    const models = await provider.listModels();
    res.json(models);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
});

providersRouter.post('/:provider/test', async (req, res) => {
  const providerName = req.params.provider as ProviderName;
  if (!VALID_PROVIDERS.includes(providerName)) {
    res.status(400).json({ error: '不正なプロバイダーです' });
    return;
  }

  try {
    const provider = createProvider(providerName);
    const result = await provider.testConnection();
    res.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    res.json({ success: false, message: `接続テスト失敗: ${message}` });
  }
});

function getProviderLabel(name: ProviderName): string {
  switch (name) {
    case 'anthropic': return 'Anthropic (Claude)';
    case 'openai': return 'OpenAI';
    case 'gemini': return 'Google Gemini';
    case 'ollama': return 'Ollama (ローカル)';
    default: return name;
  }
}
