// src/components/CaptureBar.tsx
import React, { useState } from 'react';

export type CaptureBarProps = {
  addTask: (
    title: string,
    dueDate: string | null,
    parentId?: string,
    category?: string
  ) => void;
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
  // Predefined category list
  const [categories] = useState<{ id: string; name: string }[]>([
    { id: '1', name: 'Work' },
    { id: '2', name: 'Personal' },
    { id: '3', name: 'Other' },
  ]);

  // Local state for form fields
  const [text, setText] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [dueTime, setDueTime] = useState<string>('');
  const [category, setCategory] = useState<string>(categories[0].id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    // Combine date and time if provided
    const dateTime = dueDate
      ? dueTime
        ? `${dueDate}T${dueTime}`
        : dueDate
      : null;

    // Invoke callback with category
    addTask(trimmed, dateTime, newParent);

    // Reset form fields
    setText('');
    setDueDate('');
    setDueTime('');
    setNewParent('');
    setCategory(categories[0].id);
  };

  const formStyle: React.CSSProperties = {
    display: 'flex',
    gap: 8,
    background: 'var(--section-bg)',
    padding: 10,
    borderRadius: '8px',
  };

  const inputStyle: React.CSSProperties = {
    padding: 8,
    backgroundColor: 'var(--card-bg)',
    color: 'var(--text-color)',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
  };

  const selectStyle = inputStyle;
  const buttonStyle: React.CSSProperties = {
    padding: '8px 12px',
    backgroundColor: 'var(--button-bg)',
    color: 'var(--text-color)',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    cursor: 'pointer',
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <input
        type="text"
        placeholder="Quick capture..."
        value={text}
        onChange={e => setText(e.target.value)}
        style={{ ...inputStyle, flex: 1 }}
      />

      <input
        type="date"
        value={dueDate}
        onChange={e => setDueDate(e.target.value)}
        style={inputStyle}
      />

      <input
        type="time"
        value={dueTime}
        onChange={e => setDueTime(e.target.value)}
        style={inputStyle}
      />

      <select
        value={newParent}
        onChange={e => setNewParent(e.target.value)}
        style={selectStyle}
      >
        {parentOptions.map(o => (
          <option key={o.id} value={o.id}>
            {o.title}
          </option>
        ))}
      </select>

      <select
        value={category}
        onChange={e => setCategory(e.target.value)}
        style={selectStyle}
      >
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      <button type="submit" style={buttonStyle}>
        Add
      </button>
    </form>
  );
}
