import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadConfig } from './config.js';
import { initDb } from './db/index.js';
import { healthRouter } from './routes/health.js';
import { chatRouter } from './routes/chat.js';
import { personasRouter } from './routes/personas.js';
import { sessionsRouter } from './routes/sessions.js';
import { settingsRouter } from './routes/settings.js';
import { providersRouter } from './routes/providers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = loadConfig();

initDb(config.dbPath);

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/health', healthRouter);
app.use('/api/chat', chatRouter);
app.use('/api/personas', personasRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/providers', providersRouter);

const clientDistPath = path.join(__dirname, '..', 'client');
app.use(express.static(clientDistPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

app.listen(config.port, config.host, () => {
  console.log(`Dialogos Trainer running at http://${config.host}:${config.port}`);
});

export { app };
