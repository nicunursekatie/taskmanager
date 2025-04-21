// src/components/CaptureBar.tsx
import React, { useState } from 'react';

export type CaptureBarProps = {
  addTask: (title: string, dueDate: string | null, parentId?: string) => void;
  newParent: string;
  setNewParent: (id: string) => void;
  parentOptions: { id: string; title: string }[];
};

export default function CaptureBar({
  addTask,
  newParent,
  setNewParent,
  parentOptions,
}: CaptureBarProps) {
  const [text, setText] = useState('');
  const [dueDate, setDueDate] = useState<string>('');
  const [dueTime, setDueTime] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    // combine date and time if provided
    const dateTime = dueDate
      ? dueTime
        ? `${dueDate}T${dueTime}`
        : dueDate
      : null;
    addTask(trimmed, dateTime, newParent);
    setText('');
    setDueDate('');
    setDueTime('');
    setNewParent('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ 
      display: 'flex', 
      gap: 8, 
      background: 'var(--section-bg)', 
      padding: 10,
      borderRadius: '8px'
    }}>
      <input
        type="text"
        placeholder="Quick capture..."
        value={text}
        onChange={e => setText(e.target.value)}
        style={{ 
          flex: 1, 
          padding: 8,
          backgroundColor: 'var(--card-bg)',
          color: 'var(--text-color)',
          border: '1px solid var(--border-color)',
          borderRadius: '4px'
        }}
      />
      <input
        type="date"
        value={dueDate}
        onChange={e => setDueDate(e.target.value)}
        style={{ 
          padding: 8,
          backgroundColor: 'var(--card-bg)',
          color: 'var(--text-color)',
          border: '1px solid var(--border-color)',
          borderRadius: '4px'
        }}
      />
      <input
        type="time"
        value={dueTime}
        onChange={e => setDueTime(e.target.value)}
        style={{ 
          padding: 8,
          backgroundColor: 'var(--card-bg)',
          color: 'var(--text-color)',
          border: '1px solid var(--border-color)',
          borderRadius: '4px'
        }}
      />
      <select
        value={newParent}
        onChange={e => setNewParent(e.target.value)}
        style={{ 
          padding: 8,
          backgroundColor: 'var(--card-bg)',
          color: 'var(--text-color)',
          border: '1px solid var(--border-color)',
          borderRadius: '4px'
        }}
      >
        {parentOptions.map(o => (
          <option key={o.id} value={o.id}>{o.title}</option>
        ))}
      </select>
      <button 
        type="submit" 
        style={{ 
          padding: '8px 12px',
          backgroundColor: 'var(--button-bg)',
          color: 'var(--text-color)',
          border: '1px solid var(--border-color)',
          borderRadius: '4px'
        }}
      >
        Add
      </button>
    </form>
  );
}