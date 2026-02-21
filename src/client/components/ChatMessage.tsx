import React from 'react';
import './ChatMessage.css';

interface Props {
  role: 'user' | 'assistant';
  content: string;
  name?: string;
}

export function ChatMessage({ role, content, name }: Props) {
  return (
    <div className={`message ${role}`}>
      <div className="message-avatar">
        {role === 'user' ? 'あなた' : name || 'AI'}
      </div>
      <div className="message-bubble">
        {content.split('\n').map((line, i) => (
          <React.Fragment key={i}>
            {i > 0 && <br />}
            {line}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
