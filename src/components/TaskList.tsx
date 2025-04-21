// src/components/TaskList.tsx
import { useState } from 'react';
import { Task, Category, Project } from '../types';

type TaskListProps = {
  tasks: Task[];
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (
    id: string, 
    title: string, 
    dueDate: string | null,
    categories?: string[],
    projectId?: string | null
  ) => void;
  categories: Category[];
  projects: Project[];
};

export default function TaskList({
  tasks,
  toggleTask,
  deleteTask,
  updateTask,
  categories,
  projects,
}: TaskListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDueDate, setEditDueDate] = useState<string>('');
  const [editCategories, setEditCategories] = useState<string[]>([]);

  // Only render top-level tasks (no parentId)
  const topTasks = tasks.filter(t => !t.parentId);

  return (
    <div>
      {topTasks.map(task => (
        <div key={task.id} style={{ 
          marginBottom: 12,
          backgroundColor: 'var(--card-bg)',
          color: 'var(--text-color)',
          padding: '10px',
          borderRadius: '4px',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {editingId === task.id ? (
              <>
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  style={{ 
                    flex: 1, 
                    padding: 4,
                    backgroundColor: 'var(--card-bg)',
                    color: 'var(--text-color)',
                    border: '1px solid var(--border-color)'
                  }}
                />
                <input
                  type="date"
                  value={editDueDate}
                  onChange={e => setEditDueDate(e.target.value)}
                  style={{ 
                    padding: 4,
                    backgroundColor: 'var(--card-bg)',
                    color: 'var(--text-color)',
                    border: '1px solid var(--border-color)'
                  }}
                />
                
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                    {categories.map(category => (
                      <div
                        key={category.id}
                        onClick={() => {
                          if (editCategories.includes(category.id)) {
                            setEditCategories(editCategories.filter(id => id !== category.id));
                          } else {
                            setEditCategories([...editCategories, category.id]);
                          }
                        }}
                        style={{
                          backgroundColor: editCategories.includes(category.id) ? category.color : '#f0f0f0',
                          color: editCategories.includes(category.id) ? '#fff' : '#333',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        {category.name}
                      </div>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    updateTask(task.id, editTitle, editDueDate || null, editCategories, task.projectId);
                    setEditingId(null);
                  }}
                  style={{
                    backgroundColor: 'var(--button-bg)',
                    color: 'var(--text-color)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  Save
                </button>
                <button 
                  onClick={() => setEditingId(null)}
                  style={{
                    backgroundColor: 'var(--button-bg)',
                    color: 'var(--text-color)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <span
                onClick={() => {
                  setEditingId(task.id);
                  setEditTitle(task.title);
                  setEditDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
                  setEditCategories(task.categories || []);
                }}
                style={{
                  cursor: 'pointer',
                  textDecoration:
                    task.status === 'completed' ? 'line-through' : 'none',
                  color: 'var(--text-color)'
                }}
              >
                {task.title}
                {task.dueDate && (
                  <span style={{ marginLeft: 8, fontWeight: 'bold', color: 'var(--text-color)' }}>
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
              </span>
            )}
            
            {/* Display categories */}
            {!editingId && task.categories && task.categories.length > 0 && (
              <div style={{ display: 'flex', marginTop: '4px', flexWrap: 'wrap', gap: '4px' }}>
                {task.categories.map(categoryId => {
                  const category = categories.find(c => c.id === categoryId);
                  return category ? (
                    <span
                      key={categoryId}
                      style={{
                        backgroundColor: category.color,
                        color: '#fff',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.8rem'
                      }}
                    >
                      {category.name}
                    </span>
                  ) : null;
                })}
              </div>
            )}
            
            <button 
              onClick={() => toggleTask(task.id)}
              style={{
                backgroundColor: 'var(--button-bg)',
                color: 'var(--text-color)',
                border: '1px solid var(--border-color)'
              }}
            >
              {task.status === 'pending' ? 'Complete' : 'Undo'}
            </button>
            <button 
              onClick={() => deleteTask(task.id)}
              style={{
                backgroundColor: 'var(--button-bg)',
                color: 'var(--text-color)',
                border: '1px solid var(--border-color)'
              }}
            >
              Delete
            </button>
          </div>

          {/* Render subtasks */}
          {tasks
            .filter(sub => sub.parentId === task.id)
            .map(sub => (
              <div
                key={sub.id}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8, 
                  marginLeft: 24, 
                  marginTop: 4,
                  color: 'var(--text-color)'
                }}
              >
                <span
                  onClick={() => toggleTask(sub.id)}
                  style={{
                    cursor: 'pointer',
                    textDecoration:
                      sub.status === 'completed' ? 'line-through' : 'none',
                    color: 'var(--text-color)'
                  }}
                >
                  {sub.title}
                  {sub.dueDate && (
                    <span style={{ marginLeft: 8, fontWeight: 'bold', color: 'var(--text-color)' }}>
                      {new Date(sub.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </span>
                <button 
                  onClick={() => deleteTask(sub.id)}
                  style={{
                    backgroundColor: 'var(--button-bg)',
                    color: 'var(--text-color)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}