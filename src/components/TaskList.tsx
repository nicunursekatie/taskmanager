import { useState } from 'react';
import { Task } from '../App';
import { Category, Project } from '../types';

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
  const [editProject, setEditProject] = useState<string>('');
  const [showCategorySelect, setShowCategorySelect] = useState(false);

  // Only render top-level tasks (no parentId)
  const topTasks = tasks.filter(t => !t.parentId);

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : '';
  };

  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
    setEditCategories(task.categories || []);
    setEditProject(task.projectId || '');
  };

  const handleSaveEdit = (taskId: string) => {
    updateTask(
      taskId, 
      editTitle, 
      editDueDate || null,
      editCategories, 
      editProject || null
    );
    setEditingId(null);
  };

  const toggleCategory = (categoryId: string) => {
    setEditCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <div className="task-list">
      {topTasks.map(task => (
        <div key={task.id} className="task-item">
          <div className="task-main">
            {editingId === task.id ? (
              <div className="task-edit-form">
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="edit-title"
                />
                <input
                  type="date"
                  value={editDueDate}
                  onChange={e => setEditDueDate(e.target.value)}
                  className="edit-date"
                />
                
                <div className="edit-categories">
                  <button 
                    type="button" 
                    onClick={() => setShowCategorySelect(!showCategorySelect)}
                    className="category-toggle"
                  >
                    Categories {editCategories.length > 0 && `(${editCategories.length})`}
                  </button>
                  
                  {showCategorySelect && (
                    <div className="category-dropdown">
                      {categories.map(category => (
                        <div 
                          key={category.id} 
                          className={`category-option ${editCategories.includes(category.id) ? 'selected' : ''}`}
                          onClick={() => toggleCategory(category.id)}
                        >
                          <span 
                            className="color-dot" 
                            style={{ backgroundColor: category.color }}
                          />
                          <span>{category.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <select
                  value={editProject}
                  onChange={e => setEditProject(e.target.value)}
                  className="edit-project"
                >
                  <option value="">No Project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
                
                <div className="edit-actions">
                  <button onClick={() => handleSaveEdit(task.id)}>Save</button>
                  <button onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className="task-content">
                <div className="task-header">
                  <span
                    onClick={() => toggleTask(task.id)}
                    className={`task-title ${task.status === 'completed' ? 'completed' : ''}`}
                  >
                    {task.title}
                  </span>
                  
                  {task.dueDate && (
                    <span className="task-date">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
                
                <div className="task-metadata">
                  {/* Display categories as tags */}
                  {task.categories && task.categories.length > 0 && (
                    <div className="task-categories">
                      {task.categories.map(categoryId => {
                        const category = categories.find(c => c.id === categoryId);
                        return category ? (
                          <span
                            key={categoryId}
                            className="category-tag"
                            style={{ backgroundColor: category.color }}
                          >
                            {category.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                  
                  {/* Display project if assigned */}
                  {task.projectId && (
                    <div className="task-project">
                      Project: {getProjectName(task.projectId)}
                    </div>
                  )}
                </div>
                
                <div className="task-actions">
                  <button onClick={() => startEditing(task)}>Edit</button>
                  <button onClick={() => toggleTask(task.id)}>
                    {task.status === 'pending' ? 'Complete' : 'Undo'}
                  </button>
                  <button onClick={() => deleteTask(task.id)}>Delete</button>
                </div>
              </div>
            )}
          </div>

          {/* Render subtasks */}
          {tasks
            .filter(sub => sub.parentId === task.id)
            .map(sub => (
              <div key={sub.id} className="subtask-item">
                <span
                  onClick={() => toggleTask(sub.id)}
                  className={`subtask-title ${sub.status === 'completed' ? 'completed' : ''}`}
                >
                  {sub.title}
                </span>
                
                {sub.dueDate && (
                  <span className="subtask-date">
                    {new Date(sub.dueDate).toLocaleDateString()}
                  </span>
                )}
                
                {/* Display categories as smaller tags */}
                {sub.categories && sub.categories.length > 0 && (
                  <div className="subtask-categories">
                    {sub.categories.map(categoryId => {
                      const category = categories.find(c => c.id === categoryId);
                      return category ? (
                        <span
                          key={categoryId}
                          className="category-tag small"
                          style={{ backgroundColor: category.color }}
                        >
                          {category.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
                
                <div className="subtask-actions">
                  <button onClick={() => toggleTask(sub.id)}>
                    {sub.status === 'pending' ? 'Complete' : 'Undo'}
                  </button>
                  <button onClick={() => deleteTask(sub.id)}>Delete</button>
                </div>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}