import type { LLMProvider, LLMRequest, LLMResponse, ModelInfo, ConnectionTestResult, ProviderConfig } from './types.js';

interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
}

interface OllamaChatResponse {
  message: {
    role: string;
    content: string;
  };
  model: string;
}

export class OllamaProvider implements LLMProvider {
  readonly name = 'ollama';
  private baseUrl: string;

  constructor(config: ProviderConfig) {
    this.baseUrl = (config.baseUrl || 'http://localhost:11434').replace(/\/$/, '');
  }

  async chat(request: LLMRequest): Promise<LLMResponse> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: request.model,
        messages: [
          { role: 'system', content: request.systemPrompt },
          ...request.messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as OllamaChatResponse;
    return {
      content: data.message.content,
      model: data.model,
      provider: this.name,
    };
  }

  async listModels(): Promise<ModelInfo[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = (await response.json()) as { models?: OllamaModel[] };
      return (data.models || []).map((m) => ({
        id: m.name,
        name: m.name,
        provider: this.name,
      }));
    } catch {
      return [];
    }
  }

  async testConnection(): Promise<ConnectionTestResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = (await response.json()) as { models?: OllamaModel[] };
      const models = (data.models || []).map((m) => ({
        id: m.name,
        name: m.name,
        provider: this.name,
      }));
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
