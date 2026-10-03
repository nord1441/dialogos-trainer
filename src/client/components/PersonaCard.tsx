import React from 'react';
import './PersonaCard.css';

interface Persona {
  name: string;
  age: number;
  gender: string;
  occupation: string;
  personality: string;
  background: string;
  speaking_style: string;
}

interface Props {
  persona: Persona;
}

export function PersonaCard({ persona }: Props) {
  return (
    <div className="persona-card">
      <div className="persona-card-row">
        <span className="persona-label">名前:</span>
        <span>{persona.name}</span>
      </div>
      <div className="persona-card-row">
        <span className="persona-label">年齢:</span>
        <span>{persona.age}歳</span>
      </div>
      <div className="persona-card-row">
        <span className="persona-label">性別:</span>
        <span>{persona.gender}</span>
      </div>
      <div className="persona-card-row">
        <span className="persona-label">職業:</span>
        <span>{persona.occupation}</span>
      </div>
      <div className="persona-card-row">
        <span className="persona-label">性格:</span>
        <span>{persona.personality}</span>
      </div>
      <div className="persona-card-row">
        <span className="persona-label">話し方:</span>
        <span>{persona.speaking_style}</span>
      </div>
      <div className="persona-card-row">
        <span className="persona-label">背景:</span>
        <span>{persona.background}</span>
      </div>
    </div>
  );
}
