import React, { useState } from 'react';
import { Chat } from './pages/Chat.tsx';
import { Settings } from './pages/Settings.tsx';
import './App.css';

type Page = 'chat' | 'settings';

export function App() {
  const [page, setPage] = useState<Page>('chat');

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Dialogos Trainer</h1>
        <nav className="app-nav">
          <button
            className={`nav-btn ${page === 'chat' ? 'active' : ''}`}
            onClick={() => setPage('chat')}
          >
            チャット
          </button>
          <button
            className={`nav-btn ${page === 'settings' ? 'active' : ''}`}
            onClick={() => setPage('settings')}
          >
            設定
          </button>
        </nav>
      </header>
      <main className="app-main">
        {page === 'chat' && <Chat />}
        {page === 'settings' && <Settings />}
      </main>
    </div>
  );
}
