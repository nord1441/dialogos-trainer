import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/index.js';
import { getActiveProvider } from './llm/index.js';
import { getPersonaById, getRandomPersona, initDefaultPersonas } from './persona.js';
import type { LLMMessage } from './llm/types.js';

export interface Session {
  id: string;
  persona_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface SessionWithPersona extends Session {
  persona_name: string;
  persona_occupation: string;
}

export function createSession(personaId?: string): SessionWithPersona {
  initDefaultPersonas();

  const persona = personaId ? getPersonaById(personaId) : getRandomPersona();
  if (!persona) {
    throw new Error('ペルソナが見つかりません');
  }

  const session: Session = {
    id: uuidv4(),
    persona_id: persona.id,
    title: `${persona.name}との会話`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const db = getDb();
  db.prepare(`
    INSERT INTO sessions (id, persona_id, title, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(session.id, session.persona_id, session.title, session.created_at, session.updated_at);

  return {
    ...session,
    persona_name: persona.name,
    persona_occupation: persona.occupation,
  };
}

export function getSessionById(id: string): SessionWithPersona | undefined {
  const db = getDb();
  const row = db.prepare(`
    SELECT s.*, p.name as persona_name, p.occupation as persona_occupation
    FROM sessions s
    JOIN personas p ON s.persona_id = p.id
    WHERE s.id = ?
  `).get(id) as SessionWithPersona | undefined;
  return row;
}

export function getAllSessions(): SessionWithPersona[] {
  const db = getDb();
  return db.prepare(`
    SELECT s.*, p.name as persona_name, p.occupation as persona_occupation
    FROM sessions s
    JOIN personas p ON s.persona_id = p.id
    ORDER BY s.updated_at DESC
  `).all() as SessionWithPersona[];
}

export function deleteSession(id: string): void {
  const db = getDb();
  db.prepare('DELETE FROM messages WHERE session_id = ?').run(id);
  db.prepare('DELETE FROM sessions WHERE id = ?').run(id);
}

export function getSessionMessages(sessionId: string): Message[] {
  const db = getDb();
  return db.prepare('SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC').all(sessionId) as Message[];
}

export async function sendMessage(sessionId: string, userContent: string): Promise<Message> {
  const db = getDb();
  const session = getSessionById(sessionId);
  if (!session) {
    throw new Error('セッションが見つかりません');
  }

  const persona = getPersonaById(session.persona_id);
  if (!persona) {
    throw new Error('ペルソナが見つかりません');
  }

  const userMessage: Message = {
    id: uuidv4(),
    session_id: sessionId,
    role: 'user',
    content: userContent,
    created_at: new Date().toISOString(),
  };

  db.prepare(`
    INSERT INTO messages (id, session_id, role, content, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(userMessage.id, userMessage.session_id, userMessage.role, userMessage.content, userMessage.created_at);

  const history = getSessionMessages(sessionId);
  const llmMessages: LLMMessage[] = history.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const { provider, model } = getActiveProvider();

  const response = await provider.chat({
    model,
    systemPrompt: persona.system_prompt,
    messages: llmMessages,
  });

  const assistantMessage: Message = {
    id: uuidv4(),
    session_id: sessionId,
    role: 'assistant',
    content: response.content,
    created_at: new Date().toISOString(),
  };

  db.prepare(`
    INSERT INTO messages (id, session_id, role, content, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(assistantMessage.id, assistantMessage.session_id, assistantMessage.role, assistantMessage.content, assistantMessage.created_at);

  db.prepare('UPDATE sessions SET updated_at = ? WHERE id = ?').run(new Date().toISOString(), sessionId);

  return assistantMessage;
}
