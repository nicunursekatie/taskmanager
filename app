import { useState, useEffect } from 'react';
import { Search, Plus, Home, BrainCircuit, Calendar, Bell, X, ChevronRight, ChevronDown, AlertCircle, Check, Edit, Save, Trash2, ExternalLink, AlignLeft, CheckSquare, Clock, BarChart, Settings, Play, Pause } from 'lucide-react';

export default function MindMapTaskSystem() {
  // Main state management
  const [view, setView] = useState('brain-dump');
  const [brainDump, setBrainDump] = useState('');
  const [savedDumps, setSavedDumps] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showReminders, setShowReminders] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskParentId, setNewTaskParentId] = useState(null);
  const [newTaskProject, setNewTaskProject] = useState(null);
  const [expandedTasks, setExpandedTasks] = useState({});
  const [editingTask, setEditingTask] = useState(null);
  const [taskInputValue, setTaskInputValue] = useState('');
  const [newTaskUrl, setNewTaskUrl] = useState('');
  const [newTaskTimeframe, setNewTaskTimeframe] = useState('anytime');
  const [showTimeframeMenu, setShowTimeframeMenu] = useState(null);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    tasksByProject: {}
  });

  // Load data from localStorage on initial render
  useEffect(() => {
    const savedData = localStorage.getItem('mind-map-data');
    if (savedData) {
      const data = JSON.parse(savedData);
      if (data.brainDump) setBrainDump(data.brainDump);
      if (data.savedDumps) setSavedDumps(data.savedDumps);
      if (data.projects) setProjects(data.projects);
      if (data.tasks) setTasks(data.tasks);
      if (data.reminders) setReminders(data.reminders);
      if (data.expandedTasks) setExpandedTasks(data.expandedTasks);
    }

    // Set up a notification check interval
    const notificationInterval = setInterval(() => {
      checkForReminders();
    }, 60000); // Check every minute

    return () => clearInterval(notificationInterval);
  }, []);

  // Calculate statistics whenever tasks change
  useEffect(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    
    // Calculate tasks by project
    const tasksByProject = {};
    
    projects.forEach(project => {
      const projectTasks = tasks.filter(task => task.projectId === project.id);
      const completed = projectTasks.filter(task => task.completed).length;
      
      tasksByProject[project.id] = {
        total: projectTasks.length,
        completed,
        pending: projectTasks.length - completed,
        percentage: projectTasks.length ? Math.round((completed / projectTasks.length) * 100) : 0
      };
    });
    
    setStats({
      totalTasks,
      completedTasks,
      pendingTasks,
      tasksByProject
    });
  }, [tasks, projects]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('mind-map-data', JSON.stringify({
      brainDump,
      savedDumps,
      projects,
      tasks,
      reminders,
      expandedTasks
    }));
  }, [brainDump, savedDumps, projects, tasks, reminders, expandedTasks]);

  // Check for due reminders
  const checkForReminders = () => {
    const now = new Date();
    const dueReminders = reminders.filter(reminder => {
      const reminderTime = new Date(reminder.time);
      return !reminder.dismissed && reminderTime <= now;
    });

    if (dueReminders.length > 0) {
      setShowReminders(true);
    }
  };

  // Save current brain dump
  const saveBrainDump = () => {
    if (brainDump.trim()) {
      const newDump = {
        id: Date.now(),
        text: brainDump,
        date: new Date().toISOString()
      };
      setSavedDumps([...savedDumps, newDump]);
      setBrainDump('');
    }
  };

  // Create a new project
  const createProject = () => {
    if (newProjectName.trim()) {
      const project = {
        id: Date.now(),
        name: newProjectName,
        created: new Date().toISOString(),
        color: getRandomColor()
      };
      setProjects([...projects, project]);
      setNewProjectName('');
      setShowNewProjectForm(false);
    }
  };

  // Create a new task
  const createTask = () => {
    if (newTaskTitle.trim()) {
      const task = {
        id: Date.now(),
        title: newTaskTitle,
        description: '',
        completed: false,
        created: new Date().toISOString(),
        parentId: newTaskParentId,
        projectId: newTaskProject,
        url: newTaskUrl.trim() || null,
        timeframe: newTaskTimeframe,
        startedAt: newTaskTimeframe === 'now' ? new Date().toISOString() : null
      };
      setTasks([...tasks, task]);
      setNewTaskTitle('');
      setNewTaskUrl('');
      setNewTaskTimeframe('anytime');
      setShowNewTaskForm(false);
      
      // Ensure parent is expanded
      if (newTaskParentId) {
        setExpandedTasks({
          ...expandedTasks,
          [newTaskParentId]: true
        });
      }
    }
  };

  // Extract tasks from brain dump
  const extractTasksFromDump = () => {
    // Split by newlines and filter out empty lines
    const lines = brainDump.split('\n').filter(line => line.trim());
    const newExtractedTasks = [];
    
    // Create a new task for each non-empty line
    lines.forEach((line, index) => {
      if (line.trim()) {
        const task = {
          id: Date.now() + index, // Ensure unique IDs by adding index
          title: line.trim(),
          description: '',
          completed: false,
          created: new Date().toISOString(),
          parentId: null,
          projectId: null,
          url: null,
          timeframe: 'anytime',
          startedAt: null
        };
        newExtractedTasks.push(task);
      }
    });
    
    // Only update if we found at least one task
    if (newExtractedTasks.length > 0) {
      setTasks([...tasks, ...newExtractedTasks]);
      setBrainDump(''); // Clear the brain dump after extracting
      
      // Show a brief confirmation for user feedback
      alert(`Extracted ${newExtractedTasks.length} tasks from your brain dump!`);
    }
  };

  // Toggle task completion
  const toggleTaskCompletion = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  // Start/stop working on a task
  const toggleTaskProgress = (taskId) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        // If task is not started, mark as started now
        if (!task.startedAt) {
          return { ...task, startedAt: new Date().toISOString(), timeframe: 'now' };
        }
        // If task is already started but not completed, mark as paused
        else if (!task.completed && task.timeframe === 'now') {
          return { ...task, timeframe: 'paused' };
        }
        // If task is paused, resume it
        else if (task.timeframe === 'paused') {
          return { ...task, timeframe: 'now' };
        }
        return task;
      }
      return task;
    }));
  };
  
  // Set a timeframe for a task
  const updateTaskTimeframe = (taskId, timeframe) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const updatedTask = { ...task, timeframe };
        
        // If changing to "now", also set startedAt if not already set
        if (timeframe === 'now' && !task.startedAt) {
          updatedTask.startedAt = new Date().toISOString();
        }
        
        return updatedTask;
      }
      return task;
    }));
    
    // Close the timeframe menu
    setShowTimeframeMenu(null);
  };

  // Delete a task and all its children
  const deleteTask = (taskId) => {
    // Get all child tasks recursively
    const getAllChildrenIds = (parentId) => {
      const directChildren = tasks.filter(task => task.parentId === parentId);
      const childrenIds = directChildren.map(task => task.id);
      
      directChildren.forEach(child => {
        const grandChildrenIds = getAllChildrenIds(child.id);
        childrenIds.push(...grandChildrenIds);
      });
      
      return childrenIds;
    };
    
    const childrenIds = getAllChildrenIds(taskId);
    const allIdsToRemove = [taskId, ...childrenIds];
    
    setTasks(tasks.filter(task => !allIdsToRemove.includes(task.id)));
  };

  // Start editing a task
  const startEditTask = (task) => {
    setEditingTask(task.id);
    setTaskInputValue(task.title);
  };

  // Save edited task
  const saveEditedTask = (taskId) => {
    if (taskInputValue.trim()) {
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, title: taskInputValue } : task
      ));
      setEditingTask(null);
      setTaskInputValue('');
    }
  };

  // Toggle task expansion
  const toggleTaskExpanded = (taskId) => {
    setExpandedTasks({
      ...expandedTasks,
      [taskId]: !expandedTasks[taskId]
    });
  };

  // Create a reminder for a task
  const createReminder = (taskId, time) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const reminder = {
        id: Date.now(),
        taskId,
        taskTitle: task.title,
        time,
        dismissed: false
      };
      setReminders([...reminders, reminder]);
    }
  };

  // Dismiss a reminder
  const dismissReminder = (reminderId) => {
    setReminders(reminders.map(reminder => 
      reminder.id === reminderId ? { ...reminder, dismissed: true } : reminder
    ));
  };

  // Get filtered tasks based on search
  const getFilteredTasks = () => {
    if (!searchTerm.trim()) {
      return tasks;
    }
    
    const term = searchTerm.toLowerCase();
    return tasks.filter(task => 
      task.title.toLowerCase().includes(term) || 
      task.description.toLowerCase().includes(term)
    );
  };

  // Get child tasks
  const getChildTasks = (parentId) => {
    return tasks.filter(task => task.parentId === parentId);
  };

  // Get root level tasks
  const getRootTasks = (projectId = null) => {
    return tasks.filter(task => 
      task.parentId === null && 
      (projectId === null || task.projectId === projectId)
    );
  };
  
  // Get timeline-filtered tasks
  const getTasksByTimeframe = (timeframe) => {
    return tasks.filter(task => 
      task.timeframe === timeframe && !task.completed
    );
  };

  // Get a random color for projects
  const getRandomColor = () => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 
      'bg-red-500', 'bg-orange-500'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Get project color
  const getProjectColor = (projectId) => {
    if (!projectId) return 'bg-gray-500';
    const project = projects.find(p => p.id === projectId);
    return project ? project.color : 'bg-gray-500';
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Get timeframe badge color
  const getTimeframeColor = (timeframe) => {
    switch (timeframe) {
      case 'now':
        return 'bg-green-100 text-green-800';
      case 'soon':
        return 'bg-yellow-100 text-yellow-800';
      case 'later':
        return 'bg-blue-100 text-blue-800';
      case 'someday':
        return 'bg-purple-100 text-purple-800';
      case 'paused':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get timeframe display text
  const getTimeframeText = (timeframe) => {
    switch (timeframe) {
      case 'now':
        return 'Now';
      case 'soon':
        return 'Soon';
      case 'later':
        return 'Later';
      case 'someday':
        return 'Someday';
      case 'paused':
        return 'Paused';
      default:
        return 'Anytime';
    }
  };

  // Calculate how long a task has been in progress
  const getElapsedTime = (startedAt) => {
    if (!startedAt) return null;
    
    const started = new Date(startedAt);
    const now = new Date();
    const diffMs = now - started;
    
    // Convert to days
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return 'Started today';
    } else if (days === 1) {
      return 'Started yesterday';
    } else {
      return `Started ${days} days ago`;
    }
  };

  // Recursive function to render task and its children
  const renderTask = (task, level = 0) => {
    const childTasks = getChildTasks(task.id);
    const hasChildren = childTasks.length > 0;
    const isExpanded = expandedTasks[task.id];
    const projectColor = getProjectColor(task.projectId);
    
    return (
      <div key={task.id} className="mb-1">
        <div className={`flex items-center p-2 rounded hover:bg-gray-100 ${task.completed ? 'opacity-60' : ''}`} style={{ marginLeft: `${level * 20}px` }}>
          {/* Expand/Collapse Button (if has children) */}
          {hasChildren ? (
            <button 
              onClick={() => toggleTaskExpanded(task.id)}
              className="mr-1 text-gray-400 hover:text-gray-700"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          ) : (
            <div className="w-4 mr-1"></div>
          )}
          
          {/* Checkbox */}
          <button 
            onClick={() => toggleTaskCompletion(task.id)}
            className={`mr-2 w-5 h-5 border rounded-sm flex items-center justify-center ${task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}
          >
            {task.completed && <Check className="w-3 h-3" />}
          </button>
          
          {/* Task Title */}
          {editingTask === task.id ? (
            <input
              type="text"
              value={taskInputValue}
              onChange={(e) => setTaskInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveEditedTask(task.id)}
              onBlur={() => saveEditedTask(task.id)}
              className="flex-1 border rounded p-1"
              autoFocus
            />
          ) : (
            <div className="flex-1 flex items-center">
              <span className={task.completed ? 'line-through text-gray-500' : ''}>{task.title}</span>
              
              {/* Project Color Indicator */}
              {task.projectId && (
                <span className={`ml-2 w-3 h-3 rounded-full ${projectColor}`}></span>
              )}
              
              {/* URL Link */}
              {task.url && (
                <a 
                  href={task.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="ml-2 text-blue-500 hover:text-blue-700"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              
              {/* Timeframe Badge */}
              {task.timeframe && task.timeframe !== 'anytime' && (
                <span 
                  className={`ml-2 px-2 py-0.5 rounded text-xs ${getTimeframeColor(task.timeframe)}`}
                >
                  {getTimeframeText(task.timeframe)}
                </span>
              )}
              
              {/* Started Duration */}
              {task.startedAt && !task.completed && (
                <span className="ml-2 text-xs text-gray-500">
                  {getElapsedTime(task.startedAt)}
                </span>
              )}
            </div>
          )}
          
          {/* Task Actions */}
          <div className="flex space-x-2">
            {/* Progress Toggle Button */}
            {!task.completed && (
              <button 
                onClick={() => toggleTaskProgress(task.id)}
                className={`text-gray-400 hover:text-gray-700 ${task.timeframe === 'now' ? 'text-green-500 hover:text-green-700' : ''}`}
              >
                {task.timeframe === 'now' ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </button>
            )}
            
            {/* Timeframe Button */}
            <button 
              onClick={() => setShowTimeframeMenu(showTimeframeMenu === task.id ? null : task.id)}
              className="text-gray-400 hover:text-gray-700"
            >
              <Clock className="w-4 h-4" />
            </button>
            
            <button 
              onClick={() => startEditTask(task)}
              className="text-gray-400 hover:text-gray-700"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button 
              onClick={() => {
                setShowNewTaskForm(true);
                setNewTaskParentId(task.id);
                setNewTaskProject(task.projectId);
              }}
              className="text-gray-400 hover:text-gray-700"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button 
              onClick={() => deleteTask(task.id)}
              className="text-red-400 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          
          {/* Timeframe Menu Dropdown */}
          {showTimeframeMenu === task.id && (
            <div className="absolute mt-6 ml-20 bg-white border rounded shadow-lg z-10">
              <div className="py-1">
                <button
                  onClick={() => updateTaskTimeframe(task.id, 'now')}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  <span className="inline-block w-4 h-4 bg-green-500 rounded-full mr-2"></span>
                  Now (In Progress)
                </button>
                <button
                  onClick={() => updateTaskTimeframe(task.id, 'soon')}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  <span className="inline-block w-4 h-4 bg-yellow-500 rounded-full mr-2"></span>
                  Soon
                </button>
                <button
                  onClick={() => updateTaskTimeframe(task.id, 'later')}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  <span className="inline-block w-4 h-4 bg-blue-500 rounded-full mr-2"></span>
                  Later
                </button>
                <button
                  onClick={() => updateTaskTimeframe(task.id, 'someday')}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  <span className="inline-block w-4 h-4 bg-purple-500 rounded-full mr-2"></span>
                  Someday
                </button>
                <button
                  onClick={() => updateTaskTimeframe(task.id, 'anytime')}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  <span className="inline-block w-4 h-4 bg-gray-300 rounded-full mr-2"></span>
                  Anytime
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Render Children */}
        {isExpanded && hasChildren && (
          <div>
            {childTasks.map(childTask => renderTask(childTask, level + 1))}
          </div>
        )}
      </div>
    );
  };
  
  // Timeline View
  const renderTimeline = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4">Task Timeline</h2>
      
      <div className="space-y-6">
        {/* Now Section */}
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="bg-green-500 h-1"></div>
          <div className="p-4">
            <h3 className="font-medium text-lg mb-2 flex items-center">
              <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              In Progress
            </h3>
            
            <div className="space-y-1">
              {getTasksByTimeframe('now').length === 0 ? (
                <p className="text-gray-500 text-center py-2">No tasks in progress</p>
              ) : (
                getTasksByTimeframe('now').map(task => renderTask(task))
              )}
            </div>
          </div>
        </div>
        
        {/* Soon Section */}
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="bg-yellow-500 h-1"></div>
          <div className="p-4">
            <h3 className="font-medium text-lg mb-2 flex items-center">
              <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
              Coming Soon
            </h3>
            
            <div className="space-y-1">
              {getTasksByTimeframe('soon').length === 0 ? (
                <p className="text-gray-500 text-center py-2">No upcoming tasks</p>
              ) : (
                getTasksByTimeframe('soon').map(task => renderTask(task))
              )}
            </div>
          </div>
        </div>
        
        {/* Later Section */}
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="bg-blue-500 h-1"></div>
          <div className="p-4">
            <h3 className="font-medium text-lg mb-2 flex items-center">
              <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
              Later
            </h3>
            
            <div className="space-y-1">
              {getTasksByTimeframe('later').length === 0 ? (
                <p className="text-gray-500 text-center py-2">No tasks planned for later</p>
              ) : (
                getTasksByTimeframe('later').map(task => renderTask(task))
              )}
            </div>
          </div>
        </div>
        
        {/* Someday Section */}
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="bg-purple-500 h-1"></div>
          <div className="p-4">
            <h3 className="font-medium text-lg mb-2 flex items-center">
              <span className="inline-block w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
              Someday
            </h3>
            
            <div className="space-y-1">
              {getTasksByTimeframe('someday').length === 0 ? (
                <p className="text-gray-500 text-center py-2">No someday/maybe tasks</p>
              ) : (
                getTasksByTimeframe('someday').map(task => renderTask(task))
              )}
            </div>
          </div>
        </div>
        
        {/* Paused Section */}
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="bg-red-500 h-1"></div>
          <div className="p-4">
            <h3 className="font-medium text-lg mb-2 flex items-center">
              <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
              Paused
            </h3>
            
            <div className="space-y-1">
              {getTasksByTimeframe('paused').length === 0 ? (
                <p className="text-gray-500 text-center py-2">No paused tasks</p>
              ) : (
                getTasksByTimeframe('paused').map(task => renderTask(task))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Dashboard statistics view
  const renderDashboard = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4">Your Task Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 border rounded shadow-sm">
          <h3 className="font-medium text-gray-700 mb-2">Total Tasks</h3>
          <p className="text-3xl font-bold text-indigo-600">{stats.totalTasks}</p>
        </div>
        
        <div className="bg-white p-4 border rounded shadow-sm">
          <h3 className="font-medium text-gray-700 mb-2">Completed</h3>
          <p className="text-3xl font-bold text-green-600">{stats.completedTasks}</p>
        </div>
        
        <div className="bg-white p-4 border rounded shadow-sm">
          <h3 className="font-medium text-gray-700 mb-2">Pending</h3>
          <p className="text-3xl font-bold text-orange-600">{stats.pendingTasks}</p>
        </div>
      </div>
      
      <div className="bg-white p-4 border rounded shadow-sm mb-6">
        <h3 className="font-medium text-gray-700 mb-4">Tasks In Progress</h3>
        <div>
          {getTasksByTimeframe('now').length === 0 ? (
            <p className="text-gray-500 text-center py-2">No tasks in progress</p>
          ) : (
            <div className="space-y-2">
              {getTasksByTimeframe('now').map(task => (
                <div key={task.id} className="flex items-center justify-between p-2 border-b">
                  <div className="flex items-center">
                    <Play className="w-4 h-4 mr-2 text-green-500" />
                    <span>{task.title}</span>
                    {task.startedAt && (
                      <span className="ml-2 text-xs text-gray-500">
                        {getElapsedTime(task.startedAt)}
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => toggleTaskCompletion(task.id)}
                    className="text-gray-400 hover:text-gray-700"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white p-4 border rounded shadow-sm">
        <h3 className="font-medium text-gray-700 mb-4">Project Progress</h3>
        
        {projects.length === 0 ? (
          <p className="text-gray-500 text-center py-2">No projects yet</p>
        ) : (
          <div className="space-y-4">
            {projects.map(project => {
              const projectStats = stats.tasksByProject[project.id] || { total: 0, completed: 0, percentage: 0 };
              
              return (
                <div key={project.id} className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{project.name}</span>
                    <span>
                      {projectStats.completed}/{projectStats.total} ({projectStats.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${project.color} h-2 rounded-full`} 
                      style={{ width: `${projectStats.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-indigo-600 text-white p-4 shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Mind Map Task System</h1>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setShowReminders(true)}
              className="relative bg-indigo-700 p-2 rounded-full hover:bg-indigo-800"
            >
              <Bell className="w-5 h-5" />
              {reminders.filter(r => !r.dismissed).length > 0 && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b shadow-sm">
        <div className="flex">
          <button 
            onClick={() => setView('dashboard')} 
            className={`flex items-center px-4 py-3 ${view === 'dashboard' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-600'}`}
          >
            <Home className="w-4 h-4 mr-2" />
            Dashboard
          </button>
          <button 
            onClick={() => setView('brain-dump')} 
            className={`flex items-center px-4 py-3 ${view === 'brain-dump' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-600'}`}
          >
            <BrainCircuit className="w-4 h-4 mr-2" />
            Brain Dump
          </button>
          <button 
            onClick={() => setView('tasks')} 
            className={`flex items-center px-4 py-3 ${view === 'tasks' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-600'}`}
          >
            <CheckSquare className="w-4 h-4 mr-2" />
            Tasks
          </button>
          <button 
            onClick={() => setView('timeline')} 
            className={`flex items-center px-4 py-3 ${view === 'timeline' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-600'}`}
          >
            <Clock className="w-4 h-4 mr-2" />
            Timeline
          </button>
          <button 
            onClick={() => setView('projects')} 
            className={`flex items-center px-4 py-3 ${view === 'projects' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-600'}`}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Projects
          </button>
        </div>
      </nav>

      {/* Search Bar */}
      <div className="bg-white p-2 border-b shadow-sm">
        <div className="max-w-3xl mx-auto flex">
          <div className="flex items-center w-full border rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 ml-2 outline-none bg-transparent"
              placeholder="Search tasks, projects, or brain dumps..."
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto">
          {/* Dashboard View */}
          {view === 'dashboard' && renderDashboard()}
          
          {/* Brain Dump View */}
          {view === 'brain-dump' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Brain Dump</h2>
              <p className="text-sm text-gray-600 mb-4">
                Capture your thoughts without organizing them. Just write them down.
              </p>
              
              <textarea
                value={brainDump}
                onChange={(e) => setBrainDump(e.target.value)}
                className="w-full border rounded-lg p-3 mb-3"
                placeholder="Just start typing anything that's on your mind..."
                rows="10"
              />
              
              <div className="flex space-x-3 mb-6">
                <button 
                  onClick={saveBrainDump}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                  Save Dump
                </button>
                <button 
                  onClick={extractTasksFromDump}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Extract Tasks
                </button>
                <button 
                  onClick={() => setBrainDump('')}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Clear
                </button>
              </div>
              
              <h3 className="font-semibold text-lg mt-8 mb-3">Previous Brain Dumps</h3>
              
              {savedDumps.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No saved brain dumps yet</p>
              ) : (
                <div className="space-y-3">
                  {savedDumps.map(dump => (
                    <div key={dump.id} className="bg-white p-4 border rounded-lg shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm text-gray-500">{formatDate(dump.date)}</span>
                        <button 
                          onClick={() => {
                            setBrainDump(dump.text);
                            setSavedDumps(savedDumps.filter(d => d.id !== dump.id));
                          }}
                          className="text-indigo-500 hover:text-indigo-700 text-sm"
                        >
                          Edit Again
                        </button>
                      </div>
                      <p className="whitespace-pre-wrap text-gray-700">{dump.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Tasks View */}
          {view === 'tasks' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Tasks</h2>
                <button 
                  onClick={() => {
                    setShowNewTaskForm(true);
                    setNewTaskParentId(null);
                    setNewTaskProject(null);
                  }}
                  className="bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Task
                </button>
              </div>
              
              {searchTerm ? (
                <div>
                  <h3 className="font-medium mb-3">Search Results</h3>
                  <div className="space-y-1">
                    {getFilteredTasks().map(task => renderTask(task))}
                  </div>
                  {getFilteredTasks().length === 0 && (
                    <p className="text-gray-500 text-center py-4">No matching tasks found</p>
                  )}
                </div>
              ) : (
                <div>
                  {getRootTasks().length === 0 ? (
                    <div className="text-center py-10 bg-white border rounded-lg">
                      <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">No tasks yet</p>
                      <button 
                        onClick={() => {
                          setShowNewTaskForm(true);
                          setNewTaskParentId(null);
                        }}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                      >
                        Add Your First Task
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {getRootTasks().map(task => renderTask(task))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Timeline View */}
          {view === 'timeline' && renderTimeline()}
          
          {/* Projects View */}
          {view === 'projects' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Projects</h2>
                <button 
                  onClick={() => setShowNewProjectForm(true)}
                  className="bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Project
                </button>
              </div>
              
              {projects.length === 0 ? (
                <div className="text-center py-10 bg-white border rounded-lg">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No projects yet</p>
                  <button 
                    onClick={() => setShowNewProjectForm(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                  >
                    Create Your First Project
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {projects.map(project => (
                    <div key={project.id} className="bg-white border rounded-lg shadow-sm overflow-hidden">
                      <div className={`${project.color} h-2`}></div>
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="font-medium text-lg">{project.name}</h3>
                          <button 
                            onClick={() => {
                              setShowNewTaskForm(true);
                              setNewTaskParentId(null);
                              setNewTaskProject(project.id);
                            }}
                            className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Task
                          </button>
                        </div>
                        
                        <div className="space-y-1">
                          {getRootTasks(project.id).length === 0 ? (
                            <p className="text-gray-500 text-center py-2 text-sm">No tasks in this project</p>
                          ) : (
                            getRootTasks(project.id).map(task => renderTask(task))
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* New Project Modal */}
      {showNewProjectForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-10">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-lg font-semibold mb-4">Create New Project</h2>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="w-full border rounded p-2 mb-4"
              placeholder="Project name"
              autoFocus
            />
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowNewProjectForm(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button 
                onClick={createProject}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Task Modal */}
      {showNewTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-10">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-lg font-semibold mb-4">Create New Task</h2>
            
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="w-full border rounded p-2 mb-3"
              placeholder="Task title"
              autoFocus
            />
            
            <input
              type="text"
              value={newTaskUrl}
              onChange={(e) => setNewTaskUrl(e.target.value)}
              className="w-full border rounded p-2 mb-4"
              placeholder="Link URL (optional)"
            />
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project
              </label>
              <select
                value={newTaskProject || ''}
                onChange={(e) => setNewTaskProject(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full border rounded p-2"
              >
                <option value="">No Project</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                When will you work on this?
              </label>
              <select
                value={newTaskTimeframe}
                onChange={(e) => setNewTaskTimeframe(e.target.value)}
                className="w-full border rounded p-2"
              >
                <option value="anytime">Anytime</option>
                <option value="now">Now (Start Immediately)</option>
                <option value="soon">Soon</option>
                <option value="later">Later</option>
                <option value="someday">Someday/Maybe</option>
              </select>
            </div>
            
            {newTaskParentId && (
              <div className="mb-4">
                <div className="text-sm text-gray-600">
                  This will be a subtask of: {tasks.find(t => t.id === newTaskParentId)?.title}
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowNewTaskForm(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button 
                onClick={createTask}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reminders Modal */}
      {showReminders && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-10">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Reminders</h2>
              <button 
                onClick={() => setShowReminders(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {reminders.filter(r => !r.dismissed).length === 0 ? (
                <p className="text-gray-500 text-center py-4">No active reminders</p>
              ) : (
                <div className="space-y-2">
                  {reminders
                    .filter(r => !r.dismissed)
                    .map(reminder => (
                      <div key={reminder.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-medium">{reminder.taskTitle}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(reminder.time).toLocaleString()}
                          </div>
                        </div>
                        <button 
                          onClick={() => dismissReminder(reminder.id)}
                          className="text-gray-400 hover:text-gray-700"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
            
            <button 
              onClick={() => setShowReminders(false)}
              className="mt-4 w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
