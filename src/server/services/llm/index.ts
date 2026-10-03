import { getDb } from '../../db/index.js';
import { loadConfig } from '../../config.js';
import type { LLMProvider, ProviderConfig } from './types.js';
import { AnthropicProvider } from './anthropic.js';
import { OpenAIProvider } from './openai.js';
import { GeminiProvider } from './gemini.js';
import { OllamaProvider } from './ollama.js';

export type ProviderName = 'anthropic' | 'openai' | 'gemini' | 'ollama';

function getSettingValue(key: string): string | null {
  const db = getDb();
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined;
  return row?.value ?? null;
}

export function getProviderConfig(providerName: ProviderName): ProviderConfig {
  const config = loadConfig();

  switch (providerName) {
    case 'anthropic':
      return {
        apiKey: getSettingValue('anthropic_api_key') || config.anthropic.apiKey,
        baseUrl: getSettingValue('anthropic_base_url') || config.anthropic.baseUrl,
      };
    case 'openai':
      return {
        apiKey: getSettingValue('openai_api_key') || config.openai.apiKey,
        baseUrl: getSettingValue('openai_base_url') || config.openai.baseUrl,
      };
    case 'gemini':
      return {
        apiKey: getSettingValue('gemini_api_key') || config.gemini.apiKey,
        baseUrl: getSettingValue('gemini_base_url') || config.gemini.baseUrl,
      };
    case 'ollama':
      return {
        baseUrl: getSettingValue('ollama_base_url') || config.ollama.baseUrl,
      };
    default:
      throw new Error(`Unknown provider: ${providerName}`);
  }
}

export function createProvider(providerName: ProviderName): LLMProvider {
  const providerConfig = getProviderConfig(providerName);

  switch (providerName) {
    case 'anthropic':
      return new AnthropicProvider(providerConfig);
    case 'openai':
      return new OpenAIProvider(providerConfig);
    case 'gemini':
      return new GeminiProvider(providerConfig);
    case 'ollama':
      return new OllamaProvider(providerConfig);
    default:
      throw new Error(`Unknown provider: ${providerName}`);
  }
}

export function getActiveProvider(): { provider: LLMProvider; model: string } {
  const db = getDb();
  const providerName = (getSettingValue('active_provider') || 'anthropic') as ProviderName;
  const model = getSettingValue('active_model') || getDefaultModel(providerName);
  return {
    provider: createProvider(providerName),
    model,
  };
}

function getDefaultModel(providerName: ProviderName): string {
  switch (providerName) {
    case 'anthropic':
      return 'claude-3-5-haiku-20241022';
    case 'openai':
      return 'gpt-4o-mini';
    case 'gemini':
      return 'gemini-2.0-flash';
    case 'ollama':
      return 'llama3';
    default:
      return '';
  }
}

export { type LLMProvider, type LLMRequest, type LLMResponse, type ModelInfo, type ConnectionTestResult, type ProviderConfig } from './types.js';
