import { Router } from 'express';
import { createSession, getSessionMessages, sendMessage, getSessionById } from '../services/chat.js';
import { getPersonaById } from '../services/persona.js';

export const chatRouter = Router();

chatRouter.post('/sessions', (req, res) => {
  try {
    const { personaId } = req.body;
    const session = createSession(personaId);
    res.json(session);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(400).json({ error: message });
  }
});

chatRouter.get('/sessions/:sessionId', (req, res) => {
  const session = getSessionById(req.params.sessionId);
  if (!session) {
    res.status(404).json({ error: 'セッションが見つかりません' });
    return;
  }
  const persona = getPersonaById(session.persona_id);
  const messages = getSessionMessages(req.params.sessionId);
  res.json({ session, persona, messages });
});

chatRouter.post('/sessions/:sessionId/messages', async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || typeof content !== 'string') {
      res.status(400).json({ error: 'メッセージ内容が必要です' });
      return;
    }
    const message = await sendMessage(req.params.sessionId, content);
    res.json(message);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
});
