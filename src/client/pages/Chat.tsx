import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../components/ChatMessage.tsx';
import { PersonaCard } from '../components/PersonaCard.tsx';
import './Chat.css';

interface Persona {
  id: string;
  name: string;
  age: number;
  gender: string;
  occupation: string;
  personality: string;
  background: string;
  speaking_style: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface Session {
  id: string;
  persona_id: string;
  title: string;
  persona_name: string;
  persona_occupation: string;
  updated_at: string;
}

export function Chat() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentPersona, setCurrentPersona] = useState<Persona | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPersonaInfo, setShowPersonaInfo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadSessions() {
    const res = await fetch('/api/sessions');
    const data = await res.json();
    setSessions(data);
  }

  async function startNewSession() {
    setLoading(true);
    try {
      const res = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const session = await res.json();
      setCurrentSessionId(session.id);
      setMessages([]);
      await loadSessionDetail(session.id);
      await loadSessions();
    } finally {
      setLoading(false);
    }
  }

  async function loadSessionDetail(sessionId: string) {
    const res = await fetch(`/api/chat/sessions/${sessionId}`);
    const data = await res.json();
    setMessages(data.messages);
    setCurrentPersona(data.persona);
    setCurrentSessionId(sessionId);
  }

  async function handleSend() {
    if (!input.trim() || !currentSessionId || loading) return;

    const userMessage: Message = {
      id: 'temp-' + Date.now(),
      role: 'user',
      content: input,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`/api/chat/sessions/${currentSessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: userMessage.content }),
      });
      const assistantMessage = await res.json();
      if (assistantMessage.error) {
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== userMessage.id),
          { ...userMessage, id: 'user-' + Date.now() },
          {
            id: 'error-' + Date.now(),
            role: 'assistant',
            content: `エラー: ${assistantMessage.error}`,
            created_at: new Date().toISOString(),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== userMessage.id),
          { ...userMessage, id: 'user-' + Date.now() },
          assistantMessage,
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'error-' + Date.now(),
          role: 'assistant',
          content: `通信エラーが発生しました。設定を確認してください。`,
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteSession(sessionId: string) {
    await fetch(`/api/sessions/${sessionId}`, { method: 'DELETE' });
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
      setMessages([]);
      setCurrentPersona(null);
    }
    await loadSessions();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="chat-layout">
      <aside className="chat-sidebar">
        <button className="new-chat-btn" onClick={startNewSession} disabled={loading}>
          新しい会話を始める
        </button>
        <div className="session-list">
          {sessions.map((s) => (
            <div
              key={s.id}
              className={`session-item ${currentSessionId === s.id ? 'active' : ''}`}
              onClick={() => loadSessionDetail(s.id)}
            >
              <div className="session-title">{s.title || s.persona_name}</div>
              <div className="session-meta">{s.persona_occupation}</div>
              <button
                className="session-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteSession(s.id);
                }}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </aside>

      <div className="chat-main">
        {!currentSessionId ? (
          <div className="chat-empty">
            <h2>Dialogos Trainer</h2>
            <p>コミュニケーショントレーニングを始めましょう</p>
            <p>様々なペルソナを持つ相手との会話を通じて、</p>
            <p>コミュニケーションスキルを磨くことができます。</p>
            <button className="start-btn" onClick={startNewSession} disabled={loading}>
              ランダムなペルソナと会話を開始
            </button>
          </div>
        ) : (
          <>
            {currentPersona && (
              <div className="chat-persona-bar">
                <span className="persona-name-bar">
                  {currentPersona.name} ({currentPersona.age}歳・{currentPersona.gender}・{currentPersona.occupation})
                </span>
                <button
                  className="persona-info-toggle"
                  onClick={() => setShowPersonaInfo(!showPersonaInfo)}
                >
                  {showPersonaInfo ? '情報を隠す' : 'ペルソナ情報'}
                </button>
              </div>
            )}

            {showPersonaInfo && currentPersona && (
              <PersonaCard persona={currentPersona} />
            )}

            <div className="chat-messages">
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                  name={msg.role === 'assistant' ? currentPersona?.name : undefined}
                />
              ))}
              {loading && (
                <div className="chat-loading">
                  <span className="loading-dots">考え中...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
              <textarea
                className="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="メッセージを入力... (Enter で送信、Shift+Enter で改行)"
                rows={2}
                disabled={loading}
              />
              <button
                className="send-btn"
                onClick={handleSend}
                disabled={!input.trim() || loading}
              >
                送信
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
