import Anthropic from '@anthropic-ai/sdk';
import type { LLMProvider, LLMRequest, LLMResponse, ModelInfo, ConnectionTestResult, ProviderConfig } from './types.js';

const KNOWN_MODELS: ModelInfo[] = [
  { id: 'claude-opus-4-0-20250514', name: 'Claude Opus 4', provider: 'anthropic' },
  { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', provider: 'anthropic' },
  { id: 'claude-haiku-4-20250514', name: 'Claude Haiku 4', provider: 'anthropic' },
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'anthropic' },
  { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', provider: 'anthropic' },
];

export class AnthropicProvider implements LLMProvider {
  readonly name = 'anthropic';
  private client: Anthropic;

  constructor(config: ProviderConfig) {
    this.client = new Anthropic({
      apiKey: config.apiKey || undefined,
      baseURL: config.baseUrl || undefined,
    });
  }

  async chat(request: LLMRequest): Promise<LLMResponse> {
    const response = await this.client.messages.create({
      model: request.model,
      max_tokens: request.maxTokens || 1024,
      system: request.systemPrompt,
      messages: request.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    return {
      content: textBlock ? textBlock.text : '',
      model: response.model,
      provider: this.name,
    };
  }

  async listModels(): Promise<ModelInfo[]> {
    return KNOWN_MODELS;
  }

  async testConnection(): Promise<ConnectionTestResult> {
    try {
      await this.client.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'hi' }],
      });
      return {
        success: true,
        message: '接続成功',
        models: KNOWN_MODELS,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `接続失敗: ${message}`,
      };
    }
  }
}
