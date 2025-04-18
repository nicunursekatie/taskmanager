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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    addTask(trimmed, dueDate || null, newParent);
    setText('');
    setDueDate('');
    setNewParent('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, background: '#eee', padding: 10 }}>
      <input
        type="text"
        placeholder="Quick capture..."
        value={text}
        onChange={e => setText(e.target.value)}
        style={{ flex: 1, padding: 8 }}
      />
      <input
        type="date"
        value={dueDate}
        onChange={e => setDueDate(e.target.value)}
        style={{ padding: 8 }}
      />
      <select
        value={newParent}
        onChange={e => setNewParent(e.target.value)}
        style={{ padding: 8 }}
      >
        {parentOptions.map(o => (
          <option key={o.id} value={o.id}>{o.title}</option>
        ))}
      </select>
      <button type="submit" style={{ padding: '8px 12px' }}>
        Add
      </button>
    </form>
  );
}