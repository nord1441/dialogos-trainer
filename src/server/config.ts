import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export interface AppConfig {
  host: string;
  port: number;
  dbPath: string;
  anthropic: {
    apiKey: string;
    baseUrl: string;
  };
  openai: {
    apiKey: string;
    baseUrl: string;
  };
  gemini: {
    apiKey: string;
    baseUrl: string;
  };
  ollama: {
    baseUrl: string;
  };
}

export function loadConfig(): AppConfig {
  return {
    host: process.env.HOST || '0.0.0.0',
    port: parseInt(process.env.PORT || '3000', 10),
    dbPath: process.env.DB_PATH || path.join(process.cwd(), 'data', 'dialogos.db'),
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      baseUrl: process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com',
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY || '',
      baseUrl: process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com',
    },
    ollama: {
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    },
  };
}
