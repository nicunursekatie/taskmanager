// src/App.tsx
import React, { useState, useEffect } from 'react';
import CaptureBar from './components/CaptureBar';
import TaskList from './components/TaskList';
import ContextWizard from './components/ContextWizard';
import CategoryManager from './components/CategoryManager';
import ProjectManager from './components/ProjectManager';
import ProjectView from './components/ProjectView';
import FilterPanel from './components/FilterPanel';
import { Category, Project } from './types';
import './App.css';
import './styles/categories-projects.css';

export type Task = {
  id: string;
  title: string;
  dueDate?: string | null;
  status: 'pending' | 'completed';
  parentId?: string;
  categories: string[];
  projectId?: string | null;
};

function App() {
  // Main states
  const [tasks, setTasks] = useState<Task[]>(() => {
    const s = localStorage.getItem('tasks');
    return s ? JSON.parse(s) : [];
  });
  
  const [categories, setCategories] = useState<Category[]>(() => {
    const s = localStorage.getItem('categories');
    return s ? JSON.parse(s) : [
      { id: 'cat1', name: 'Work', color: '#4299e1' },
      { id: 'cat2', name: 'Personal', color: '#68d391' },
      { id: 'cat3', name: 'Urgent', color: '#f56565' },
    ];
  });
  
  const [projects, setProjects] = useState<Project[]>(() => {
    const s = localStorage.getItem('projects');
    return s ? JSON.parse(s) : [];
  });

  // UI states
  const [showWizard, setShowWizard] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [activeView, setActiveView] = useState<'all' | 'projects'>('all');
  const [newParent, setNewParent] = useState<string>('');
  
  // Filter states
  const [activeCategoryFilters, setActiveCategoryFilters] = useState<string[]>([]);
  const [activeProjectFilter, setActiveProjectFilter] = useState<string | null>(null);

  // Migrate existing tasks to include new properties
  useEffect(() => {
    setTasks(prev => 
      prev.map(task => ({
        ...task,
        categories: task.categories || [],
        projectId: task.projectId !== undefined ? task.projectId : null
      }))
    );
  }, []);

  // Save to localStorage whenever our main data changes
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);
  
  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);
  
  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  // Parent options for task hierarchy
  const parentOptions = [
    { id: '', title: '— None —' },
    ...tasks.map(t => ({ id: t.id, title: t.title })),
  ];

  // Task CRUD operations
  const addTask = (
    title: string, 
    dueDate: string | null, 
    parentId?: string,
    categories?: string[],
    projectId?: string | null
  ) => {
    setTasks(prev => [
      ...prev,
      { 
        id: Date.now().toString(), 
        title, 
        dueDate, 
        status: 'pending', 
        parentId,
        categories: categories || [],
        projectId: projectId || null
      },
    ]);
  };

  const toggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === id ? { ...t, status: t.status === 'pending' ? 'completed' : 'pending' } : t
      )
    );
  };

  const deleteTask = (id: string) => {
    // Also delete any subtasks
    const subtaskIds = tasks
      .filter(t => t.parentId === id)
      .map(t => t.id);
    
    setTasks(prev => prev.filter(t => t.id !== id && !subtaskIds.includes(t.id)));
  };

  const updateTask = (
    id: string, 
    title: string, 
    dueDate: string | null,
    categories?: string[],
    projectId?: string | null
  ) => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { 
        ...t, 
        title, 
        dueDate,
        categories: categories !== undefined ? categories : t.categories,
        projectId: projectId !== undefined ? projectId : t.projectId
      } : t))
    );
  };

  // Category CRUD operations
  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      ...category
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const updateCategory = (id: string, updatedData: Omit<Category, 'id'>) => {
    setCategories(prev => 
      prev.map(c => c.id === id ? { ...c, ...updatedData } : c)
    );
  };

  const deleteCategory = (id: string) => {
    // Remove this category from all tasks
    setTasks(prev => 
      prev.map(task => ({
        ...task,
        categories: task.categories.filter(catId => catId !== id)
      }))
    );
    
    // Remove from active filters if present
    if (activeCategoryFilters.includes(id)) {
      setActiveCategoryFilters(prev => prev.filter(catId => catId !== id));
    }
    
    // Remove the category itself
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // Project CRUD operations
  const addProject = (project: Omit<Project, 'id'>) => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      ...project
    };
    setProjects(prev => [...prev, newProject]);
  };

  const updateProject = (id: string, updatedData: Omit<Project, 'id'>) => {
    setProjects(prev => 
      prev.map(p => p.id === id ? { ...p, ...updatedData } : p)
    );
  };

  const deleteProject = (id: string) => {
    // Remove this project from all tasks
    setTasks(prev => 
      prev.map(task => ({
        ...task,
        projectId: task.projectId === id ? null : task.projectId
      }))
    );
    
    // Reset project filter if it was active
    if (activeProjectFilter === id) {
      setActiveProjectFilter(null);
    }
    
    // Remove the project itself
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  // Filter operations
  const toggleCategoryFilter = (categoryId: string) => {
    setActiveCategoryFilters(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const setProjectFilter = (projectId: string | null) => {
    setActiveProjectFilter(projectId);
  };

  const clearFilters = () => {
    setActiveCategoryFilters([]);
    setActiveProjectFilter(null);
  };

  // Apply filters to tasks
  let filteredTasks = [...tasks];
  
  // Filter by categories if any are selected
  if (activeCategoryFilters.length > 0) {
    filteredTasks = filteredTasks.filter(task => 
      // Task has at least one category that matches our filters
      task.categories.some(catId => activeCategoryFilters.includes(catId))
    );
  }
  
  // Filter by project if selected
  if (activeProjectFilter !== null) {
    filteredTasks = filteredTasks.filter(task => 
      activeProjectFilter === 'none'
        ? task.projectId === null  // Special case for "No Project"
        : task.projectId === activeProjectFilter
    );
  }

  // Sort and categorize tasks by due date
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.dueDate === b.dueDate) return 0;
    if (a.dueDate == null) return 1;
    if (b.dueDate == null) return -1;
    return a.dueDate < b.dueDate ? -1 : 1;
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const overdueTasks = sortedTasks.filter(t => t.dueDate && t.dueDate.split('T')[0] < todayStr);
  const todayTasks = sortedTasks.filter(t => t.dueDate && t.dueDate.split('T')[0] === todayStr);
  const upcomingTasks = sortedTasks.filter(t => t.dueDate && t.dueDate.split('T')[0] > todayStr);
  const noDateTasks = sortedTasks.filter(t => !t.dueDate);

  const generalTasks = ['Check email', 'Drink water', 'Quick stretch'];

  return (
    <div className="app-container">
      <h1 className="header">My Task Manager</h1>
      
      {/* Toolbar with category and project management */}
      <div className="toolbar">
        <button onClick={() => setActiveView('all')}>All Tasks</button>
        <button onClick={() => setActiveView('projects')}>Projects</button>
        <button onClick={() => setShowCategoryManager(true)}>Manage Categories</button>
        <button onClick={() => setShowProjectManager(true)}>Manage Projects</button>
      </div>
      
      {/* Quick task entry */}
      <div className="capture-bar-container">
        <CaptureBar
          addTask={addTask}
          newParent={newParent}
          setNewParent={setNewParent}
          parentOptions={parentOptions}
          categories={categories}
          projects={projects}
        />
      </div>
      
      {/* Filter panel */}
      <FilterPanel
        categories={categories}
        projects={projects}
        activeCategories={activeCategoryFilters}
        activeProject={activeProjectFilter}
        toggleCategoryFilter={toggleCategoryFilter}
        setProjectFilter={setProjectFilter}
        clearFilters={clearFilters}
      />
      
      {/* Context Wizard button */}
      <div style={{ textAlign: 'center', margin: '16px 0' }}>
        <button onClick={() => setShowWizard(true)}>What should I do now?</button>
      </div>
      
      {/* Main content area */}
      {activeView === 'all' ? (
        // All tasks view
        <>
          {overdueTasks.length > 0 && (
            <>
              <h2 className="section-header">Overdue</h2>
              <TaskList 
                tasks={overdueTasks} 
                toggleTask={toggleTask} 
                deleteTask={deleteTask} 
                updateTask={updateTask}
                categories={categories}
                projects={projects}
              />
            </>
          )}
          
          {todayTasks.length > 0 && (
            <>
              <h2 className="section-header">Due Today</h2>
              <TaskList 
                tasks={todayTasks} 
                toggleTask={toggleTask} 
                deleteTask={deleteTask} 
                updateTask={updateTask}
                categories={categories}
                projects={projects}
              />
            </>
          )}
          
          {upcomingTasks.length > 0 && (
            <>
              <h2 className="section-header">Upcoming</h2>
              <TaskList 
                tasks={upcomingTasks} 
                toggleTask={toggleTask} 
                deleteTask={deleteTask} 
                updateTask={updateTask}
                categories={categories}
                projects={projects}
              />
            </>
          )}
          
          {noDateTasks.length > 0 && (
            <>
              <h2 className="section-header">No Date</h2>
              <TaskList 
                tasks={noDateTasks} 
                toggleTask={toggleTask} 
                deleteTask={deleteTask} 
                updateTask={updateTask}
                categories={categories}
                projects={projects}
              />
            </>
          )}
          
          {filteredTasks.length === 0 && (
            <div className="no-tasks-message">
              <p>No tasks match your current filters.</p>
              {(activeCategoryFilters.length > 0 || activeProjectFilter !== null) && (
                <button onClick={clearFilters}>Clear Filters</button>
              )}
            </div>
          )}
        </>
      ) : (
        // Projects view
        <ProjectView
          projects={projects}
          tasks={filteredTasks}
          categories={categories}
          toggleTask={toggleTask}
          deleteTask={deleteTask}
          updateTask={updateTask}
        />
      )}
      
      {/* Modals */}
      {showWizard && (
        <ContextWizard
          tasks={sortedTasks}
          onClose={() => setShowWizard(false)}
          generalTasks={generalTasks}
        />
      )}
      
      {showCategoryManager && (
        <CategoryManager
          categories={categories}
          addCategory={addCategory}
          updateCategory={updateCategory}
          deleteCategory={deleteCategory}
          onClose={() => setShowCategoryManager(false)}
        />
      )}
      
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