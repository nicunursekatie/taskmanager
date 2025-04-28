// src/components/ProjectDashboard.tsx
import React, { useState } from 'react';
import { Task, Project, Category } from '../types';

type ProjectDashboardProps = {
  projects: Project[];
  tasks: Task[];
  categories: Category[];
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
};

export default function ProjectDashboard({
  projects,
  tasks,
  categories,
  toggleTask,
  deleteTask,
  updateTask,
  addTask
}: ProjectDashboardProps) {
  // State for the currently expanded project panel
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  
  // State for editing tasks
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDueDate, setEditDueDate] = useState<string>('');
  const [editCategories, setEditCategories] = useState<string[]>([]);
  const [editProjectId, setEditProjectId] = useState<string | null>(null);

  // State for adding subtasks
  const [addingSubtaskFor, setAddingSubtaskFor] = useState<string | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  
  // Get tasks without a project
  const unassignedTasks = tasks.filter(task => !task.projectId);
  
  // Get tasks grouped by status
  const getTasksByStatus = (projectId: string | null) => {
    const projectTasks = tasks.filter(task => task.projectId === projectId && !task.parentId);
    return {
      pending: projectTasks.filter(task => task.status === 'pending'),
      completed: projectTasks.filter(task => task.status === 'completed'),
    };
  };
  
  // Handle expanding/collapsing project panels
  const toggleProjectExpand = (projectId: string) => {
    if (expandedProject === projectId) {
      setExpandedProject(null);
    } else {
      setExpandedProject(projectId);
    }
  };
  
  // Get counts of tasks per project
  const getProjectCounts = (projectId: string) => {
    const projectTasks = tasks.filter(task => task.projectId === projectId);
    return {
      total: projectTasks.length,
      pending: projectTasks.filter(task => task.status === 'pending').length,
      completed: projectTasks.filter(task => task.status === 'completed').length,
    };
  };

  // Get subtasks for a task
  const getSubtasks = (taskId: string) => {
    return tasks.filter(task => task.parentId === taskId);
  };

  // Start editing a task
  const startEditingTask = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
    setEditCategories(task.categories || []);
    setEditProjectId(task.projectId ?? null);
  };

  // Save edited task
  const saveEditedTask = () => {
    if (!editingTaskId) return;
    
    updateTask(
      editingTaskId,
      editTitle,
      editDueDate || null,
      editCategories,
      editProjectId
    );
    
    setEditingTaskId(null);
  };

  // Add a subtask
  const handleAddSubtask = () => {
    if (!addingSubtaskFor || !newSubtaskTitle.trim()) return;
    
    const parentTask = tasks.find(t => t.id === addingSubtaskFor);
    if (!parentTask) return;
    
    addTask(
      newSubtaskTitle.trim(),
      null, // No due date for simplicity
      addingSubtaskFor, // Set the parentId
      parentTask.categories, // Inherit categories
      parentTask.projectId // Inherit project
    );
    
    setAddingSubtaskFor(null);
    setNewSubtaskTitle('');
  };
  
  // Render a single task item with consistent controls
  const renderTaskItem = (task: Task) => {
    const subtasks = getSubtasks(task.id);
    
    if (editingTaskId === task.id) {
      return (
        <div key={task.id} className="task-edit-form">
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
          
          <div className="flex justify-between gap-sm">
            <button
              className="btn btn-primary"
              onClick={saveEditedTask}
            >
              Save
            </button>
            <button 
              className="btn btn-outline"
              onClick={() => setEditingTaskId(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div key={task.id} className={`task-item ${task.status === 'completed' ? 'completed' : ''}`}>
        <div className="task-header">
          <div className="task-title-wrapper">
            <label className="task-checkbox-container">
              <input 
                type="checkbox" 
                checked={task.status === 'completed'}
                onChange={() => toggleTask(task.id)}
                className="task-checkbox"
              />
              <span className="task-checkmark"></span>
            </label>
            <h3 
              className={`task-title ${task.status === 'completed' ? 'completed' : ''}`}
              onClick={() => startEditingTask(task)}
            >
              {task.title}
            </h3>
          </div>
          
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
              className="btn btn-sm btn-outline"
              onClick={() => startEditingTask(task)}
            >
              Edit
            </button>
            <button 
              className="btn btn-sm btn-danger"
              onClick={() => deleteTask(task.id)}
            >
              🗑️
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
                onClick={handleAddSubtask}
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
        
        {/* Subtasks */}
        {subtasks.length > 0 && (
          <div className="subtasks">
            {subtasks.map(subtask => (
              <div key={subtask.id} className="subtask-item">
                <div className="subtask-title-wrapper">
                  <label className="task-checkbox-container small">
                    <input 
                      type="checkbox" 
                      checked={subtask.status === 'completed'}
                      onChange={() => toggleTask(subtask.id)}
                      className="task-checkbox"
                    />
                    <span className="task-checkmark"></span>
                  </label>
                  <span
                    className={`subtask-title ${subtask.status === 'completed' ? 'completed' : ''}`}
                  >
                    {subtask.title}
                    {subtask.dueDate && (
                      <span className="task-date ml-xs">
                        {new Date(subtask.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </span>
                </div>
                <div className="subtask-actions">
                  <button 
                    className="btn btn-sm btn-outline"
                    onClick={() => startEditingTask(subtask)}
                    style={{ padding: '2px 6px', fontSize: '0.75rem' }}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => deleteTask(subtask.id)}
                    style={{ padding: '2px 6px', fontSize: '0.75rem' }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="project-dashboard">
      {/* Unassigned Tasks Section */}
      <div className="project-panel">
        <div 
          className="project-header"
          onClick={() => toggleProjectExpand('unassigned')}
        >
          <h2 className="project-name">Unassigned Tasks</h2>
          <div className="project-stats">
          <span className="task-count">
            ({unassignedTasks.length})
          </span>


            <span className="expand-icon">
              {expandedProject === 'unassigned' ? '▼' : '▶'}
            </span>
          </div>
        </div>
        
        {expandedProject === 'unassigned' && (
          <div className="project-content">
            {unassignedTasks.filter(t => !t.parentId).length > 0 ? (
              <>
                <div className="task-section">
                  <h3 className="task-section-title">Pending</h3>
                  <div className="task-list">
                    {unassignedTasks
                      .filter(t => t.status === 'pending' && !t.parentId)
                      .map(renderTaskItem)
                    }
                  </div>
                </div>
                
                <div className="task-section">
                  <h3 className="task-section-title">Completed</h3>
                  <div className="task-list">
                    {unassignedTasks
                      .filter(t => t.status === 'completed' && !t.parentId)
                      .map(renderTaskItem)
                    }
                  </div>
                </div>
              </>
            ) : (
              <div className="no-tasks-message">
                No unassigned tasks
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Project Sections */}
      {projects.map(project => {
        const counts = getProjectCounts(project.id);
        const { pending, completed } = getTasksByStatus(project.id);
        
        return (
          <div key={project.id} className="project-panel">
            <div 
              className="project-header"
              onClick={() => toggleProjectExpand(project.id)}
            >
              <h2 className="project-name">{project.name}</h2>
              <div className="project-stats">
              <span className="task-count">
                ({counts.total})
              </span>

                <span className="expand-icon">
                  {expandedProject === project.id ? '▼' : '▶'}
                </span>
              </div>
            </div>
            
            {expandedProject === project.id && (
              <div className="project-content">
                {project.description && (
                  <p className="project-description">{project.description}</p>
                )}
                
                {counts.total > 0 ? (
                  <>
                    {pending.length > 0 && (
                      <div className="task-section">
                        <h3 className="task-section-title">Pending</h3>
                        <div className="task-list">
                          {pending.map(renderTaskItem)}
                        </div>
                      </div>
                    )}
                    
                    {completed.length > 0 && (
                      <div className="task-section">
                        <h3 className="task-section-title">Completed</h3>
                        <div className="task-list">
                          {completed.map(renderTaskItem)}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="no-tasks-message">
                    No tasks in this project
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}