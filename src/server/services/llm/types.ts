export interface LLMMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface LLMRequest {
  model: string;
  systemPrompt: string;
  messages: LLMMessage[];
  maxTokens?: number;
}

export interface LLMResponse {
  content: string;
  model: string;
  provider: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  models?: ModelInfo[];
}

export interface LLMProvider {
  readonly name: string;
  chat(request: LLMRequest): Promise<LLMResponse>;
  listModels(): Promise<ModelInfo[]>;
  testConnection(): Promise<ConnectionTestResult>;
}

export interface ProviderConfig {
  apiKey?: string;
  baseUrl: string;
}
