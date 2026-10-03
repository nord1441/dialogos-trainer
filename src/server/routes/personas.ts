import { Router } from 'express';
import {
  getAllPersonas,
  getPersonaById,
  generatePersona,
  generateMultiplePersonas,
  savePersona,
  deletePersona,
  initDefaultPersonas,
} from '../services/persona.js';

export const personasRouter = Router();

personasRouter.get('/', (_req, res) => {
  initDefaultPersonas();
  const personas = getAllPersonas();
  res.json(personas);
});

personasRouter.get('/:id', (req, res) => {
  const persona = getPersonaById(req.params.id);
  if (!persona) {
    res.status(404).json({ error: 'ペルソナが見つかりません' });
    return;
  }
  res.json(persona);
});

personasRouter.post('/generate', (req, res) => {
  const count = Math.min(Math.max(parseInt(req.body.count) || 1, 1), 20);
  const personas = count === 1 ? [generatePersona()] : generateMultiplePersonas(count);
  for (const persona of personas) {
    savePersona(persona);
  }
  res.json(personas);
});

personasRouter.delete('/:id', (req, res) => {
  const persona = getPersonaById(req.params.id);
  if (!persona) {
    res.status(404).json({ error: 'ペルソナが見つかりません' });
    return;
  }
  deletePersona(req.params.id);
  res.json({ success: true });
});
