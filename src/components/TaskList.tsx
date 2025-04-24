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
  addTask: (
    title: string,
    dueDate: string | null,
    parentId?: string,
    categoryIds?: string[],
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
  addTask,
  categories,
  projects,
}: TaskListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDueDate, setEditDueDate] = useState<string>('');
  const [editCategories, setEditCategories] = useState<string[]>([]);
  const [editProjectId, setEditProjectId] = useState<string | null>(null);
  
  // New state for adding subtasks
  const [addingSubtaskFor, setAddingSubtaskFor] = useState<string | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Only render top-level tasks (no parentId)
  const topTasks = tasks.filter(t => !t.parentId);
  
  // Get subtasks for a specific parent
  const getSubtasks = (parentId: string) => {
    return tasks.filter(t => t.parentId === parentId);
  };

  return (
    <>
      {topTasks.map(task => (
        <div 
          key={task.id} 
          className={`task-item ${task.status === 'completed' ? 'completed' : ''}`}
        >
          {editingId === task.id ? (
            // Edit mode
            <div className="task-edit-form">
              <input
                type="text"
                className="form-control"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
              />
              
              <div className="input-group">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={editDueDate}
                  onChange={e => setEditDueDate(e.target.value)}
                />
              </div>
              
              <div className="input-group">
                <label className="form-label">Categories</label>
                <div className="category-selector">
                  {categories.map(category => (
                    <div
                      key={category.id}
                      className={`category-option ${editCategories.includes(category.id) ? 'selected' : ''}`}
                      style={{
                        backgroundColor: editCategories.includes(category.id) ? category.color : 'transparent',
                        border: `1px solid ${category.color}`
                      }}
                      onClick={() => {
                        if (editCategories.includes(category.id)) {
                          setEditCategories(editCategories.filter(id => id !== category.id));
                        } else {
                          setEditCategories([...editCategories, category.id]);
                        }
                      }}
                    >
                      {category.name}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="input-group">
                <label className="form-label">Project</label>
                <select 
                  className="form-control"
                  value={editProjectId || ''}
                  onChange={(e) => setEditProjectId(e.target.value || null)}
                >
                  <option value="">No Project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-between gap-sm">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    updateTask(task.id, editTitle, editDueDate || null, editCategories, editProjectId);
                    setEditingId(null);
                  }}
                >
                  Save
                </button>
                <button 
                  className="btn btn-outline"
                  onClick={() => setEditingId(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            // View mode
            <>
              <div className="task-header">
                <h3 
                  className={`task-title ${task.status === 'completed' ? 'completed' : ''}`}
                  onClick={() => {
                    setEditingId(task.id);
                    setEditTitle(task.title);
                    setEditDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
                    setEditCategories(task.categories || []);
                    setEditProjectId(task.projectId ?? null);
                  }}
                >
                  {task.title}
                </h3>
                
                <div className="task-actions">
                  <button 
                    className="btn btn-sm btn-outline"
                    onClick={() => {
                      setAddingSubtaskFor(task.id);
                      setNewSubtaskTitle('');
                    }}
                  >
                    Add Subtask
                  </button>
                  <button 
                    className={`btn btn-sm ${task.status === 'pending' ? 'btn-success' : 'btn-outline'}`}
                    onClick={() => toggleTask(task.id)}
                  >
                    {task.status === 'pending' ? 'Complete' : 'Undo'}
                  </button>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => deleteTask(task.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <div className="task-meta">
                {task.dueDate && (
                  <span className="task-date">
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
                
                {task.categories && task.categories.length > 0 && 
                  task.categories.map(categoryId => {
                    const category = categories.find(c => c.id === categoryId);
                    return category ? (
                      <span
                        key={categoryId}
                        className="task-category"
                        style={{ backgroundColor: category.color }}
                      >
                        {category.name}
                      </span>
                    ) : null;
                  })
                }
                
                {task.projectId && (
                  <span className="task-project">
                    {projects.find(p => p.id === task.projectId)?.name || 'Unknown Project'}
                  </span>
                )}
              </div>
              
              {/* Add subtask form */}
              {addingSubtaskFor === task.id && (
                <div className="subtask-form">
                  <div className="flex gap-sm">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="New subtask..."
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        if (newSubtaskTitle.trim()) {
                          addTask(
                            newSubtaskTitle.trim(),
                            null, // No due date for simplicity
                            task.id, // Set the parentId
                            task.categories, // Inherit categories
                            task.projectId // Inherit project
                          );
                          setAddingSubtaskFor(null);
                          setNewSubtaskTitle('');
                        }
                      }}
                    >
                      Add
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={() => setAddingSubtaskFor(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Subtasks */}
          {getSubtasks(task.id).length > 0 && (
            <div className="subtasks">
              {getSubtasks(task.id).map(subtask => (
                <div key={subtask.id} className="subtask-item">
                  <span
                    className={`subtask-title ${subtask.status === 'completed' ? 'completed' : ''}`}
                    onClick={() => toggleTask(subtask.id)}
                  >
                    {subtask.title}
                    {subtask.dueDate && (
                      <span className="task-date ml-xs">
                        {new Date(subtask.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </span>
                  <div className="subtask-actions">
                    <button 
                      className="btn btn-sm btn-outline"
                      onClick={() => toggleTask(subtask.id)}
                    >
                      {subtask.status === 'pending' ? 'Complete' : 'Undo'}
                    </button>
                    <button 
                      className="btn btn-sm btn-outline btn-danger"
                      onClick={() => deleteTask(subtask.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </>
  );
}