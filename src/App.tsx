// src/App.tsx
import React, { useState, useEffect } from 'react';
import './app-styles.css';
import CaptureBar from './components/CaptureBar';
import TaskList from './components/TaskList';
import ContextWizard from './components/ContextWizard';
import CategoryManager from './components/CategoryManager';
import { Task, Category, Project } from './types';

function App() {
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
  
  // State for showing the context wizard and category manager
  const [showWizard, setShowWizard] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  
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
  const addProject = (name: string, description?: string) => {
    const id = Date.now().toString();
    const newProject: Project = { id, name, description: description || '' };
    setProjects(prev => [...prev, newProject]);
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
  
  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">Task Manager</h2>
        </div>
        <ul className="nav-links">
          <li><a href="#" className="nav-link active">Dashboard</a></li>
          <li><a href="#" className="nav-link">All Tasks</a></li>
          <li><a href="#" className="nav-link">Projects</a></li>
          <li><a href="#" className="nav-link">Categories</a></li>
        </ul>
      </div>
      
      {/* Main Content */}
      <div className="main-content">
        <div className="content-wrapper">
          <div className="header">
            <h1 className="page-title">My Tasks</h1>
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
    </div>
  );
}

export default App;