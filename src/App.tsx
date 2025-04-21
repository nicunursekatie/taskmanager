// src/App.tsx
import React, { useState, useEffect } from 'react';
import './app-styles.css';
import CaptureBar from './components/CaptureBar';
import TaskList from './components/TaskList';
import ContextWizard from './components/ContextWizard';
import CategoryManager from './components/CategoryManager';
import ProjectManager from './components/ProjectManager';
import ProjectView from './components/ProjectView';
import { Task, Category, Project } from './types';

type TabType = 'dashboard' | 'all-tasks' | 'projects' | 'categories';

function App() {
  // Navigation state
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  
  // State management for tasks
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  
  // Save tasks to localStorage when they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);
  
  // State for parent task selection
  const [newParent, setNewParent] = useState<string>('');
  
  // State for showing modals
  const [showWizard, setShowWizard] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showProjectManager, setShowProjectManager] = useState(false);
  
  // Example initial categories
  const [categories, setCategories] = useState<Category[]>(() => {
    const savedCategories = localStorage.getItem('categories');
    return savedCategories ? JSON.parse(savedCategories) : [
      { id: '1', name: 'Work', color: '#F59E0B' },
      { id: '2', name: 'Personal', color: '#10B981' },
      { id: '3', name: 'Other', color: '#3B82F6' },
    ];
  });

  // Save categories to localStorage when they change
  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);
  
  // Projects state
  const [projects, setProjects] = useState<Project[]>(() => {
    const savedProjects = localStorage.getItem('projects');
    return savedProjects ? JSON.parse(savedProjects) : [];
  });

  // Save projects to localStorage when they change
  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);
  
  // Add new task
  const addTask = (
    title: string,
    dueDate: string | null,
    parentId?: string,
    categoryIds?: string[],
    projectId?: string | null
  ) => {
    const id = Date.now().toString();
    const newTask: Task = {
      id,
      title,
      dueDate,
      status: 'pending',
      parentId,
      categories: categoryIds || [],
      projectId: projectId || null,
    };
    setTasks(prev => [...prev, newTask]);
  };
  
  // Toggle task completion status
  const toggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id
          ? { ...task, status: task.status === 'pending' ? 'completed' : 'pending' }
          : task
      )
    );
  };
  
  // Delete a task
  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id && task.parentId !== id));
  };
  
  // Update a task
  const updateTask = (
    id: string,
    title: string,
    dueDate: string | null,
    categoryIds?: string[],
    projectId?: string | null
  ) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id
          ? {
              ...task,
              title,
              dueDate,
              categories: categoryIds || task.categories,
              projectId: projectId !== undefined ? projectId : task.projectId,
            }
          : task
      )
    );
  };
  
  // Add a new project
  const addProject = (project: Omit<Project, 'id'>) => {
    const id = Date.now().toString();
    const newProject: Project = { id, ...project };
    setProjects(prev => [...prev, newProject]);
  };

  // Update a project
  const updateProject = (id: string, project: Omit<Project, 'id'>) => {
    setProjects(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, ...project }
          : p
      )
    );
  };

  // Delete a project
  const deleteProject = (id: string) => {
    // Update tasks that were associated with this project
    setTasks(prev =>
      prev.map(task =>
        task.projectId === id
          ? { ...task, projectId: null }
          : task
      )
    );
    
    // Remove the project
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  // Add a new category
  const addCategory = (category: Omit<Category, 'id'>) => {
    const id = Date.now().toString();
    const newCategory: Category = { id, ...category };
    setCategories(prev => [...prev, newCategory]);
  };

  // Update a category
  const updateCategory = (id: string, category: Omit<Category, 'id'>) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === id
          ? { ...cat, ...category }
          : cat
      )
    );
  };

  // Delete a category
  const deleteCategory = (id: string) => {
    // Remove the category from all tasks
    setTasks(prev =>
      prev.map(task => ({
        ...task,
        categories: task.categories ? task.categories.filter(catId => catId !== id) : []
      }))
    );
    
    // Remove the category itself
    setCategories(prev => prev.filter(cat => cat.id !== id));
  };
  
  // Filter tasks by due date for different sections
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
  
  const overdueTasks = tasks.filter(
    task => task.dueDate && task.dueDate < today && task.status !== 'completed'
  );
  
  const todayTasks = tasks.filter(
    task => task.dueDate && task.dueDate >= today && task.dueDate < tomorrow && task.status !== 'completed'
  );
  
  const upcomingTasks = tasks.filter(
    task => task.dueDate && task.dueDate >= tomorrow && task.status !== 'completed'
  );
  
  const completedTasks = tasks.filter(task => task.status === 'completed');
  
  const noDateTasks = tasks.filter(
    task => !task.dueDate && task.status !== 'completed'
  );
  
  // Parent task options for the capture bar
  const parentOptions = tasks
    .filter(task => !task.parentId && task.status !== 'completed')
    .map(task => ({ id: task.id, title: task.title }));
  
  // General tasks for context wizard
  const generalTasks = [
    'Review your priorities',
    'Plan your week',
    'Clear your inbox',
    'Take a break'
  ];

  // Render main content based on active tab
  const renderMainContent = () => {
    switch (activeTab) {
      case 'dashboard':
      case 'all-tasks':
        return (
          <>
            <div className="header">
              <h1 className="page-title">{activeTab === 'dashboard' ? 'My Tasks' : 'All Tasks'}</h1>
              <div className="toolbar">
                <button className="btn btn-primary" onClick={() => setShowWizard(true)}>
                  What should I do now?
                </button>
                <button className="btn btn-outline" onClick={() => setShowCategoryManager(true)}>
                  Manage Categories
                </button>
              </div>
            </div>
            
            {/* Capture Bar */}
            <div className="capture-bar">
              <form className="capture-form" onSubmit={(e) => {
                e.preventDefault();
                const titleInput = e.currentTarget.querySelector('input[type="text"]') as HTMLInputElement;
                const dateInput = e.currentTarget.querySelector('input[type="date"]') as HTMLInputElement;
                const timeInput = e.currentTarget.querySelector('input[type="time"]') as HTMLInputElement;
                
                if (titleInput && titleInput.value.trim()) {
                  const title = titleInput.value.trim();
                  const dueDate = dateInput && dateInput.value 
                    ? `${dateInput.value}T${timeInput?.value || '00:00:00'}` 
                    : null;
                  
                  addTask(title, dueDate);
                  titleInput.value = '';
                  if (dateInput) dateInput.value = '';
                  if (timeInput) timeInput.value = '';
                }
              }}>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Quick capture..."
                />
                <input 
                  type="date" 
                  className="form-control"
                />
                <input 
                  type="time" 
                  className="form-control"
                />
                <button type="submit" className="btn btn-primary">Add</button>
              </form>
            </div>
            
            {/* Task Sections */}
            {overdueTasks.length > 0 && (
              <>
                <h2 className="section-title">Overdue</h2>
                <div className="task-list">
                  <TaskList 
                    tasks={overdueTasks} 
                    toggleTask={toggleTask} 
                    deleteTask={deleteTask} 
                    updateTask={updateTask} 
                    categories={categories}
                    projects={projects}
                  />
                </div>
              </>
            )}
            
            {todayTasks.length > 0 && (
              <>
                <h2 className="section-title">Today</h2>
                <div className="task-list">
                  <TaskList 
                    tasks={todayTasks} 
                    toggleTask={toggleTask} 
                    deleteTask={deleteTask} 
                    updateTask={updateTask} 
                    categories={categories}
                    projects={projects}
                  />
                </div>
              </>
            )}
            
            {upcomingTasks.length > 0 && (
              <>
                <h2 className="section-title">Upcoming</h2>
                <div className="task-list">
                  <TaskList 
                    tasks={upcomingTasks} 
                    toggleTask={toggleTask} 
                    deleteTask={deleteTask} 
                    updateTask={updateTask} 
                    categories={categories}
                    projects={projects}
                  />
                </div>
              </>
            )}
            
            {noDateTasks.length > 0 && (
              <>
                <h2 className="section-title">No Due Date</h2>
                <div className="task-list">
                  <TaskList 
                    tasks={noDateTasks} 
                    toggleTask={toggleTask} 
                    deleteTask={deleteTask} 
                    updateTask={updateTask} 
                    categories={categories}
                    projects={projects}
                  />
                </div>
              </>
            )}
            
            {completedTasks.length > 0 && (
              <>
                <h2 className="section-title">Completed</h2>
                <div className="task-list">
                  <TaskList 
                    tasks={completedTasks} 
                    toggleTask={toggleTask} 
                    deleteTask={deleteTask} 
                    updateTask={updateTask} 
                    categories={categories}
                    projects={projects}
                  />
                </div>
              </>
            )}
          </>
        );
        
      case 'projects':
        return (
          <>
            <div className="header">
              <h1 className="page-title">Projects</h1>
              <div className="toolbar">
                <button className="btn btn-primary" onClick={() => setShowProjectManager(true)}>
                  Manage Projects
                </button>
              </div>
            </div>
            
            {projects.length === 0 ? (
              <div className="empty-state">
                <h3>No Projects Yet</h3>
                <p>Create your first project to organize related tasks together.</p>
                <button className="btn btn-primary" onClick={() => setShowProjectManager(true)}>
                  Create Project
                </button>
              </div>
            ) : (
              <ProjectView 
                projects={projects}
                tasks={tasks}
                categories={categories}
                toggleTask={toggleTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
              />
            )}
          </>
        );
        
      case 'categories':
        return (
          <>
            <div className="header">
              <h1 className="page-title">Categories</h1>
              <div className="toolbar">
                <button className="btn btn-primary" onClick={() => setShowCategoryManager(true)}>
                  Manage Categories
                </button>
              </div>
            </div>
            
            <div className="category-grid">
              {categories.map(category => (
                <div 
                  key={category.id} 
                  className="category-card item-card"
                  style={{ borderLeft: `3px solid ${category.color}` }}
                >
                  <div className="item-header">
                    <div className="flex items-center">
                      <span 
                        className="color-dot" 
                        style={{ backgroundColor: category.color }}
                      />
                      <h3 className="item-title">{category.name}</h3>
                    </div>
                  </div>
                  
                  <div className="category-stats">
                    {/* Count tasks in this category */}
                    <p className="text-light">
                      {tasks.filter(t => t.categories?.includes(category.id)).length} tasks
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">Task Manager</h2>
        </div>
        <ul className="nav-links">
          <li>
            <a 
              href="#" 
              className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('dashboard');
              }}
            >
              Dashboard
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className={`nav-link ${activeTab === 'all-tasks' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('all-tasks');
              }}
            >
              All Tasks
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className={`nav-link ${activeTab === 'projects' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('projects');
              }}
            >
              Projects
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className={`nav-link ${activeTab === 'categories' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('categories');
              }}
            >
              Categories
            </a>
          </li>
        </ul>
      </div>
      
      {/* Main Content */}
      <div className="main-content">
        <div className="content-wrapper">
          {renderMainContent()}
        </div>
      </div>
      
      {/* Context Wizard Modal */}
      {showWizard && (
        <ContextWizard
          tasks={tasks}
          onClose={() => setShowWizard(false)}
          generalTasks={generalTasks}
        />
      )}

      {/* Category Manager Modal */}
      {showCategoryManager && (
        <CategoryManager
          categories={categories}
          addCategory={addCategory}
          updateCategory={updateCategory}
          deleteCategory={deleteCategory}
          onClose={() => setShowCategoryManager(false)}
        />
      )}

      {/* Project Manager Modal */}
      {showProjectManager && (
        <ProjectManager
          projects={projects}
          addProject={addProject}
          updateProject={updateProject}
          deleteProject={deleteProject}
          onClose={() => setShowProjectManager(false)}
        />
      )}
    </div>
  );
}

export default App;