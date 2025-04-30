import { useState, useEffect } from 'react';
import './app-styles.css';
import './styles/project-dashboard.css';
import CaptureBar from './components/CaptureBar';
import TaskList from './components/TaskList';
import ContextWizard from './components/ContextWizard';
import CategoryManager from './components/CategoryManager';
import ProjectManager from './components/ProjectManager';
import ProjectDashboard from './components/ProjectDashboard';
import CalendarView from './components/CalendarView';
import ImportTasks from './components/ImportTasks';
import ExportTasks from './components/ExportTasks';
import { Task, Category, Project } from './types';

type TabType = 'dashboard' | 'all-tasks' | 'projects' | 'categories' | 'calendar';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('categories');
    return saved ? JSON.parse(saved) : [];
  });
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('projects');
    return saved ? JSON.parse(saved) : [];
  });

  const [newParent, setNewParent] = useState<string>('');
  const [showWizard, setShowWizard] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showProjectManager, setShowProjectManager] = useState(false);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  const addTask = (title: string, dueDate: string | null, parentId?: string, categoryIds?: string[], projectId?: string | null) => {
    const id = Date.now().toString();
    const newTask: Task = { id, title, dueDate, status: 'pending', parentId, categories: categoryIds || [], projectId: projectId || null };
    setTasks(prev => [...prev, newTask]);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(task => task.id === id ? { ...task, status: task.status === 'pending' ? 'completed' : 'pending' } : task));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id && task.parentId !== id));
  };

  const updateTask = (id: string, title: string, dueDate: string | null, categoryIds?: string[], projectId?: string | null) => {
    setTasks(prev => prev.map(task => task.id === id ? { ...task, title, dueDate, categories: categoryIds || task.categories, projectId: projectId ?? task.projectId } : task));
  };

  const addProject = (project: Omit<Project, 'id'>) => {
    const id = Date.now().toString();
    setProjects(prev => [...prev, { id, ...project }]);
  };

  const updateProject = (id: string, project: Omit<Project, 'id'>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...project } : p));
  };

  const deleteProject = (id: string) => {
    setTasks(prev => prev.map(task => task.projectId === id ? { ...task, projectId: null } : task));
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    const id = Date.now().toString();
    setCategories(prev => [...prev, { id, ...category }]);
  };

  const updateCategory = (id: string, category: Omit<Category, 'id'>) => {
    setCategories(prev => prev.map(cat => cat.id === id ? { ...cat, ...category } : cat));
  };

  const deleteCategory = (id: string) => {
    setTasks(prev => prev.map(task => ({ ...task, categories: task.categories.filter(catId => catId !== id) })));
    setCategories(prev => prev.filter(cat => cat.id !== id));
  };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

  const overdueTasks = tasks.filter(task => task.dueDate && task.dueDate < today && task.status !== 'completed');
  const todayTasks = tasks.filter(task => task.dueDate && task.dueDate >= today && task.dueDate < tomorrow && task.status !== 'completed');
  const upcomingTasks = tasks.filter(task => task.dueDate && task.dueDate >= tomorrow && task.status !== 'completed');
  const completedTasks = tasks.filter(task => task.status === 'completed');
  const noDateTasks = tasks.filter(task => !task.dueDate && task.status !== 'completed');

  const parentOptions = tasks.filter(task => !task.parentId && task.status !== 'completed').map(task => ({ id: task.id, title: task.title }));

  const generalTasks = ['Review your priorities', 'Plan your week', 'Clear your inbox', 'Take a break'];

  const renderMainContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <div className="header">
              <h1 className="page-title">Dashboard</h1>
              <div className="toolbar">
                <button className="btn btn-primary" onClick={() => setShowWizard(true)}>What should I do now?</button>
                <button className="btn btn-outline" onClick={() => setShowCategoryManager(true)}>Manage Categories</button>
                <button className="btn btn-outline" onClick={() => setShowProjectManager(true)}>Manage Projects</button>
                <ImportTasks setTasks={setTasks} setCategories={setCategories} setProjects={setProjects} />
                <ExportTasks tasks={tasks} categories={categories} projects={projects} />
              </div>
            </div>
            <div className="capture-bar">
              <CaptureBar
                addTask={addTask}
                newParent={newParent}
                setNewParent={setNewParent}
                parentOptions={parentOptions}
                categories={categories}
                projects={projects}
              />
            </div>
            <ProjectDashboard
              projects={projects}
              tasks={tasks}
              categories={categories}
              toggleTask={toggleTask}
              deleteTask={deleteTask}
              updateTask={updateTask}
              addTask={addTask}
            />
          </>
        );

      case 'all-tasks':
        return (
          <>
            <div className="header">
              <h1 className="page-title">All Tasks</h1>
              <div className="toolbar">
                <button className="btn btn-primary" onClick={() => setShowWizard(true)}>What should I do now?</button>
                <button className="btn btn-outline" onClick={() => setShowCategoryManager(true)}>Manage Categories</button>
              </div>
            </div>
            <div className="capture-bar">
              <CaptureBar
                addTask={addTask}
                newParent={newParent}
                setNewParent={setNewParent}
                parentOptions={parentOptions}
                categories={categories}
                projects={projects}
              />
            </div>
            {/* Then your tasks split into sections: Overdue, Today, etc. (I can add if you want) */}
          </>
        );

      case 'projects':
        return (
          <>
            <div className="header">
              <h1 className="page-title">Projects</h1>
              <div className="toolbar">
                <button className="btn btn-primary" onClick={() => setShowProjectManager(true)}>Manage Projects</button>
              </div>
            </div>
            <ProjectDashboard
              projects={projects}
              tasks={tasks}
              categories={categories}
              toggleTask={toggleTask}
              deleteTask={deleteTask}
              updateTask={updateTask}
              addTask={addTask}
            />
          </>
        );

      case 'categories':
        return (
          <>
            <div className="header">
              <h1 className="page-title">Categories</h1>
              <div className="toolbar">
                <button className="btn btn-primary" onClick={() => setShowCategoryManager(true)}>Manage Categories</button>
              </div>
            </div>
            {/* List of categories */}
          </>
        );

      case 'calendar':
        return (
          <>
            <div className="header">
              <h1 className="page-title">Calendar</h1>
              <div className="toolbar">
                <button className="btn btn-primary" onClick={() => setShowWizard(true)}>What should I do now?</button>
                <button className="btn btn-outline" onClick={() => setShowCategoryManager(true)}>Manage Categories</button>
                <ImportTasks setTasks={setTasks} setCategories={setCategories} setProjects={setProjects} />
                <ExportTasks tasks={tasks} categories={categories} projects={projects} />
              </div>
            </div>
            <CalendarView />
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
          <li><a href="#" className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}>Dashboard</a></li>
          <li><a href="#" className={`nav-link ${activeTab === 'all-tasks' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('all-tasks'); }}>All Tasks</a></li>
          <li><a href="#" className={`nav-link ${activeTab === 'calendar' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('calendar'); }}>Calendar</a></li>
          <li><a href="#" className={`nav-link ${activeTab === 'projects' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('projects'); }}>Projects</a></li>
          <li><a href="#" className={`nav-link ${activeTab === 'categories' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('categories'); }}>Categories</a></li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="content-wrapper">
          {renderMainContent()}
        </div>
      </div>

      {/* Modals */}
      {showWizard && <ContextWizard tasks={tasks} onClose={() => setShowWizard(false)} generalTasks={generalTasks} />}
      {showCategoryManager && <CategoryManager categories={categories} addCategory={addCategory} updateCategory={updateCategory} deleteCategory={deleteCategory} onClose={() => setShowCategoryManager(false)} />}
      {showProjectManager && <ProjectManager projects={projects} addProject={addProject} updateProject={updateProject} deleteProject={deleteProject} onClose={() => setShowProjectManager(false)} />}
    </div>
  );
}

export default App;
