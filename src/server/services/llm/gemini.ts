import { GoogleGenerativeAI } from '@google/generative-ai';
import type { LLMProvider, LLMRequest, LLMResponse, ModelInfo, ConnectionTestResult, ProviderConfig } from './types.js';

export class GeminiProvider implements LLMProvider {
  readonly name = 'gemini';
  private client: GoogleGenerativeAI;
  private baseUrl: string;
  private apiKey: string;

  constructor(config: ProviderConfig) {
    this.apiKey = config.apiKey || '';
    this.baseUrl = config.baseUrl || 'https://generativelanguage.googleapis.com';
    this.client = new GoogleGenerativeAI(this.apiKey);
  }

  async chat(request: LLMRequest): Promise<LLMResponse> {
    const model = this.client.getGenerativeModel({
      model: request.model,
      systemInstruction: request.systemPrompt,
    });

    const chat = model.startChat({
      history: request.messages.slice(0, -1).map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
    });

    const lastMessage = request.messages[request.messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    const response = result.response;

    return {
      content: response.text(),
      model: request.model,
      provider: this.name,
    };
  }

  async listModels(): Promise<ModelInfo[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/v1beta/models?key=${this.apiKey}`
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json() as { models?: Array<{ name: string; displayName: string }> };
      return (data.models || [])
        .filter((m) => m.name.includes('gemini'))
        .map((m) => ({
          id: m.name.replace('models/', ''),
          name: m.displayName || m.name,
          provider: this.name,
        }));
    } catch {
      return [];
    }
  }

  async testConnection(): Promise<ConnectionTestResult> {
    try {
      const models = await this.listModels();
      if (models.length === 0) {
        return {
          success: false,
          message: '接続失敗: モデルが取得できませんでした',
        };
      }
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
