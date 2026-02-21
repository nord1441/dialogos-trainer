import { Router } from 'express';
import { getAllSessions, deleteSession } from '../services/chat.js';

export const sessionsRouter = Router();

sessionsRouter.get('/', (_req, res) => {
  const sessions = getAllSessions();
  res.json(sessions);
});

sessionsRouter.delete('/:id', (req, res) => {
  deleteSession(req.params.id);
  res.json({ success: true });
});
