import OpenAI from 'openai';
import type { LLMProvider, LLMRequest, LLMResponse, ModelInfo, ConnectionTestResult, ProviderConfig } from './types.js';

export class OpenAIProvider implements LLMProvider {
  readonly name = 'openai';
  private client: OpenAI;

  constructor(config: ProviderConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey || undefined,
      baseURL: config.baseUrl || undefined,
    });
  }

  async chat(request: LLMRequest): Promise<LLMResponse> {
    const response = await this.client.chat.completions.create({
      model: request.model,
      max_tokens: request.maxTokens || 1024,
      messages: [
        { role: 'system', content: request.systemPrompt },
        ...request.messages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ],
    });

    return {
      content: response.choices[0]?.message?.content || '',
      model: response.model,
      provider: this.name,
    };
  }

  async listModels(): Promise<ModelInfo[]> {
    try {
      const response = await this.client.models.list();
      const models: ModelInfo[] = [];
      for await (const model of response) {
        models.push({
          id: model.id,
          name: model.id,
          provider: this.name,
        });
      }
      return models.sort((a, b) => a.id.localeCompare(b.id));
    } catch {
      return [];
    }
  }

  async testConnection(): Promise<ConnectionTestResult> {
    try {
      const models = await this.listModels();
      return {
        success: true,
        message: `接続成功 (${models.length}モデル検出)`,
        models,
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
