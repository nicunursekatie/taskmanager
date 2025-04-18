
// src/components/TaskList.tsx
import { useState } from 'react';
import { Task } from '../App';

type TaskListProps = {
  tasks: Task[];
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, title: string, dueDate: string | null) => void;
};

export default function TaskList({
  tasks,
  toggleTask,
  deleteTask,
  updateTask,
}: TaskListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDueDate, setEditDueDate] = useState<string>('');

  // Only render top-level tasks (no parentId)
  const topTasks = tasks.filter(t => !t.parentId);

  return (
    <div>
      {topTasks.map(task => (
        <div key={task.id} style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {editingId === task.id ? (
              <>
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  style={{ flex: 1, padding: 4 }}
                />
                <input
                  type="date"
                  value={editDueDate}
                  onChange={e => setEditDueDate(e.target.value)}
                  style={{ padding: 4 }}
                />
                <button
                  onClick={() => {
                    updateTask(task.id, editTitle, editDueDate || null);
                    setEditingId(null);
                  }}
                >
                  Save
                </button>
                <button onClick={() => setEditingId(null)}>Cancel</button>
              </>
            ) : (
              <span
                onClick={() => {
                  setEditingId(task.id);
                  setEditTitle(task.title);
                  setEditDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
                }}
                style={{
                  cursor: 'pointer',
                  textDecoration:
                    task.status === 'completed' ? 'line-through' : 'none',
                }}
              >
                {task.title}
                {task.dueDate && (
                  <span style={{ marginLeft: 8, fontWeight: 'bold', color: '#2c3e50' }}>
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
              </span>
            )}
            <button onClick={() => toggleTask(task.id)}>
              {task.status === 'pending' ? 'Complete' : 'Undo'}
            </button>
            <button onClick={() => deleteTask(task.id)}>Delete</button>
          </div>

          {/* Render subtasks */}
          {tasks
            .filter(sub => sub.parentId === task.id)
            .map(sub => (
              <div
                key={sub.id}
                style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 24, marginTop: 4 }}
              >
                <span
                  onClick={() => toggleTask(sub.id)}
                  style={{
                    cursor: 'pointer',
                    textDecoration:
                      sub.status === 'completed' ? 'line-through' : 'none',
                  }}
                >
                  {sub.title}
                  {sub.dueDate && (
                    <span style={{ marginLeft: 8, fontWeight: 'bold', color: '#2c3e50' }}>
                      {new Date(sub.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </span>
                <button onClick={() => deleteTask(sub.id)}>Delete</button>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}