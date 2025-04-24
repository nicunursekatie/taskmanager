// src/components/CalendarView.tsx
import { fetchEvents, isAuthenticated, GoogleEvent } from '../services/googleCalendarService';
import GoogleCalendarButton from './GoogleCalendarButton';
import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Task, Category, Project } from '../types';
import './CalendarView.css';

type CalendarViewProps = {
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

const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  toggleTask,
  deleteTask,
  updateTask,
  addTask,
  categories,
  projects
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [googleEvents, setGoogleEvents] = useState<GoogleEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(false);

  // State for editing tasks
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDueDate, setEditDueDate] = useState<string>('');
  const [editCategories, setEditCategories] = useState<string[]>([]);
  const [editProjectId, setEditProjectId] = useState<string | null>(null);

  // Calculate week dates based on the selected date
  const [weekDates, setWeekDates] = useState<Date[]>([]);

  useEffect(() => {
    // Calculate the dates for the current week when selected date changes
    if (viewMode === 'week') {
      const dates = getWeekDates(selectedDate);
      setWeekDates(dates);
    }
  }, [selectedDate, viewMode]);

  // Fetch Google Calendar events when date changes or when authenticated
useEffect(() => {
  const loadGoogleEvents = async () => {
    if (!isAuthenticated()) return;
    
    setIsLoadingEvents(true);
    try {
      // Create date range based on current view
      const start = new Date(selectedDate);
      const end = new Date(selectedDate);
      
      if (viewMode === 'month') {
        start.setDate(1);
        end.setMonth(end.getMonth() + 1);
        end.setDate(0);
      } else if (viewMode === 'week') {
        const day = start.getDay();
        start.setDate(start.getDate() - day + (day === 0 ? -6 : 1));
        end.setDate(start.getDate() + 6);
      } else {
        // day view
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
      }
      
      const events = await fetchEvents(start, end);
      setGoogleEvents(events);
    } catch (error) {
      console.error('Error loading Google events:', error);
    } finally {
      setIsLoadingEvents(false);
    }
  };
  
  loadGoogleEvents();
}, [selectedDate, viewMode]);

  // Get the dates for a week starting from a given date
  const getWeekDates = (date: Date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    
    const monday = new Date(date);
    monday.setDate(diff);
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(monday);
      nextDate.setDate(monday.getDate() + i);
      weekDates.push(nextDate);
    }
    
    return weekDates;
  };

  // Get current month and year
  const currentMonth = selectedDate.toLocaleString('default', { month: 'long' });
  const currentYear = selectedDate.getFullYear();

  // Filter tasks for the selected day
  const getTasksForDate = (date: Date) => {
    const dayStr = date.toISOString().split('T')[0];
    return tasks.filter(
      t => t.dueDate && t.dueDate.split('T')[0] === dayStr && !t.parentId
    );
  };

  // Get tasks for the currently selected date
  const tasksForSelectedDate = getTasksForDate(selectedDate);

  // Handle adding a new task on the selected date
  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;

    // Create ISO string for the selected date
    const dateStr = selectedDate.toISOString();

    // Add the new task
    addTask(
      newTaskTitle.trim(),
      dateStr,
      undefined,
      selectedCategories.length > 0 ? selectedCategories : undefined,
      selectedProject
    );

    // Reset form
    setNewTaskTitle('');
    setSelectedCategories([]);
    setSelectedProject(null);
    setShowTaskForm(false);
  };

  // Custom tile content renderer for the calendar
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null;
  
    const tasksForDay = getTasksForDate(date);
    
    // Get Google events for this day
    const eventsForDay = googleEvents.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === date.toDateString();
    });
    
    const totalItems = tasksForDay.length + eventsForDay.length;
    
    if (totalItems === 0) return null;
  
    // Group tasks by category
    const categoryGroups: Record<string, number> = {};
    
    tasksForDay.forEach(task => {
      if (task.categories && task.categories.length > 0) {
        task.categories.forEach(catId => {
          categoryGroups[catId] = (categoryGroups[catId] || 0) + 1;
        });
      } else {
        // No category
        categoryGroups['none'] = (categoryGroups['none'] || 0) + 1;
      }
    });
  
    return (
      <div className="calendar-tile-content">
        <div className="task-count">{totalItems}</div>
        <div className="category-indicators">
          {Object.entries(categoryGroups).map(([catId]) => {
            if (catId === 'none') {
              return (
                <span 
                  key="none" 
                  className="category-dot"
                  style={{ backgroundColor: '#888888' }}
                />
              );
            }
            
            const category = categories.find(c => c.id === catId);
            if (!category) return null;
            
            return (
              <span 
                key={catId} 
                className="category-dot"
                style={{ backgroundColor: category.color }}
              />
            );
          })}
          
          {/* Google Events Indicator */}
          {eventsForDay.length > 0 && (
            <span 
              key="google-event"
              className="category-dot"
              style={{ backgroundColor: '#4285F4' }} // Google blue
            />
          )}
        </div>
      </div>
    );
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Custom navigation for the calendar
  const onPrevMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedDate(newDate);
  };

  const onNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedDate(newDate);
  };

  const onPrevYear = () => {
    const newDate = new Date(selectedDate);
    newDate.setFullYear(newDate.getFullYear() - 1);
    setSelectedDate(newDate);
  };

  const onNextYear = () => {
    const newDate = new Date(selectedDate);
    newDate.setFullYear(newDate.getFullYear() + 1);
    setSelectedDate(newDate);
  };

  // Week view navigation
  const onPrevWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedDate(newDate);
  };

  const onNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedDate(newDate);
  };

  // Render tasks for a specific day in the week view
  const renderTasksForDay = (date: Date) => {
    const tasksForDay = getTasksForDate(date);
    if (tasksForDay.length === 0) return null;

    return (
      <div className="week-day-tasks">
        {tasksForDay.map(task => (
          <div 
            key={task.id} 
            className={`week-task-item ${task.status === 'completed' ? 'completed' : ''}`}
            onClick={() => {
              setSelectedDate(date);
              setViewMode('day');
            }}
          >
            <div className="week-task-title">
              {task.title}
            </div>
            {task.categories && task.categories.length > 0 && (
              <div className="week-task-categories">
                {task.categories.map(catId => {
                  const category = categories.find(c => c.id === catId);
                  return category ? (
                    <span 
                      key={catId} 
                      className="week-category-indicator"
                      style={{ backgroundColor: category.color }}
                    />
                  ) : null;
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
  <div className="calendar-view">
    <div className="calendar-header">
      <h2>Calendar View</h2>
      <div className="view-controls">
        <button 
          className={`btn ${viewMode === 'month' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setViewMode('month')}
        >
          Month
        </button>
        <button 
          className={`btn ${viewMode === 'week' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setViewMode('week')}
        >
          Week
        </button>
        <button 
          className={`btn ${viewMode === 'day' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setViewMode('day')}
        >
          Day
        </button>
        
        {/* Add Google Calendar button */}
        <GoogleCalendarButton 
          onAuthStatusChange={(isAuthenticated) => {
            if (!isAuthenticated) {
              setGoogleEvents([]);
            }
          }}
        />
      </div>
    </div>

      {viewMode === 'month' && (
        <div className="calendar-container">
          <div className="calendar-navigation">
            <div className="calendar-nav-controls">
              <button onClick={onPrevYear} className="nav-button">«</button>
              <button onClick={onPrevMonth} className="nav-button">‹</button>
              <div className="calendar-title">{currentMonth} {currentYear}</div>
              <button onClick={onNextMonth} className="nav-button">›</button>
              <button onClick={onNextYear} className="nav-button">»</button>
            </div>
          </div>
          
          <div className="custom-calendar-wrapper">
            <Calendar
              onChange={(value) => {
                if (value instanceof Date) {
                  setSelectedDate(value);
                  // Switch to day view when a date is clicked
                  setViewMode('day');
                }
              }}
              value={selectedDate}
              tileContent={tileContent}
              onClickDay={(value) => {
                setSelectedDate(value);
                setViewMode('day');
              }}
              formatShortWeekday={(locale, date) => 
                date.toLocaleDateString(locale, { weekday: 'short' }).toUpperCase()
              }
              formatDay={(locale, date) => date.getDate().toString()}
              showNeighboringMonth={false}
              navigationLabel={() => ''}
              prevLabel={null}
              prev2Label={null}
              nextLabel={null}
              next2Label={null}
            />
          </div>
        </div>
      )}

      {viewMode === 'week' && (
        <div className="calendar-container">
          <div className="calendar-navigation">
            <div className="calendar-nav-controls">
              <button onClick={onPrevWeek} className="nav-button">‹</button>
              <div className="calendar-title">
                {weekDates.length > 0 ? (
                  `${weekDates[0].toLocaleDateString('default', { month: 'long', day: 'numeric' })} - ${weekDates[6].toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })}`
                ) : (
                  'Week View'
                )}
              </div>
              <button onClick={onNextWeek} className="nav-button">›</button>
            </div>
          </div>
          
          <div className="week-view-container">
            <div className="week-header">
              {weekDates.map((date, index) => (
                <div key={index} className="week-day-header">
                  <div className="week-day-name">
                    {date.toLocaleDateString('default', { weekday: 'short' }).toUpperCase()}
                  </div>
                  <div className={`week-day-number ${new Date().toDateString() === date.toDateString() ? 'current-day' : ''}`}>
                    {date.getDate()}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="week-grid">
              {weekDates.map((date, index) => (
                <div 
                  key={index} 
                  className={`week-day-cell ${new Date().toDateString() === date.toDateString() ? 'current-day' : ''} ${date.getDay() === 0 || date.getDay() === 6 ? 'weekend' : ''}`}
                  onClick={() => {
                    setSelectedDate(date);
                    setViewMode('day');
                  }}
                >
                  {renderTasksForDay(date)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

{viewMode === 'day' && (
  <div className="day-view">
    <h3 className="selected-date">{formatDate(selectedDate)}</h3>
    
    {/* Google Calendar Events Section */}
    {isAuthenticated() && (
      <div className="google-events-section">
        <div className="google-events-header">
          <h4>Google Calendar Events</h4>
          {isLoadingEvents && <span>Loading...</span>}
        </div>
        
        <div className="events-list">
          {googleEvents.filter(event => {
            const eventDate = new Date(event.start);
            return eventDate.toDateString() === selectedDate.toDateString();
          }).map(event => (
            <div key={event.id} className="google-event">
              <div className="google-event-title">{event.summary}</div>
              <div className="google-event-time">
                {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                {new Date(event.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              {event.location && (
                <div className="google-event-location">📍 {event.location}</div>
              )}
            </div>
          ))}
          
          {googleEvents.filter(event => {
            const eventDate = new Date(event.start);
            return eventDate.toDateString() === selectedDate.toDateString();
          }).length === 0 && !isLoadingEvents && (
            <div className="no-events-message">No events scheduled for this day</div>
          )}
        </div>
      </div>
    )}
    
    {/* Tasks Section */}
    <div className="day-header">
      <h4>Tasks</h4>
      <button 
        className="btn btn-primary"
        onClick={() => setShowTaskForm(true)}
      >
        + Add Task
      </button>
    </div>
  </div>

    {showTaskForm && (
      <div className="quick-task-form">
        {/* Add your form content here */}
      </div>
    )}
      <div className="quick-task-form">
        <div className="form-group">
          <input
            type="text"
            className="form-control"
            placeholder="Task title"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label>Categories</label>
          <div className="category-selector">
            {categories.map(category => (
              <div
                key={category.id}
                className={`category-option ${selectedCategories.includes(category.id) ? 'selected' : ''}`}
                style={{
                  backgroundColor: selectedCategories.includes(category.id) ? category.color : 'transparent',
                  border: `1px solid ${category.color}`,
                  color: selectedCategories.includes(category.id) ? 'white' : category.color
                }}
                onClick={() => {
                  if (selectedCategories.includes(category.id)) {
                    setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                  } else {
                    setSelectedCategories([...selectedCategories, category.id]);
                  }
                }}
              >
                {category.name}
              </div>
            ))}
          </div>
        </div>
        
        <div className="form-group">
          <label>Project</label>
          <select
            className="form-control"
            value={selectedProject || ''}
            onChange={(e) => setSelectedProject(e.target.value || null)}
          >
            <option value="">No Project</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-actions">
          <button 
            className="btn btn-primary"
            onClick={handleAddTask}
          >
            Add Task
          </button>
          <button 
            className="btn btn-outline"
            onClick={() => setShowTaskForm(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    )}
      <div className="quick-task-form">
        <div className="form-group">
          <input
            type="text"
            className="form-control"
            placeholder="Task title"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label>Categories</label>
          <div className="category-selector">
            {categories.map(category => (
              <div
                key={category.id}
                className={`category-option ${selectedCategories.includes(category.id) ? 'selected' : ''}`}
                style={{
                  backgroundColor: selectedCategories.includes(category.id) ? category.color : 'transparent',
                  border: `1px solid ${category.color}`,
                  color: selectedCategories.includes(category.id) ? 'white' : category.color
                }}
                onClick={() => {
                  if (selectedCategories.includes(category.id)) {
                    setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                  } else {
                    setSelectedCategories([...selectedCategories, category.id]);
                  }
                }}
              >
                {category.name}
              </div>
            ))}
          </div>
        </div>
        
        <div className="form-group">
          <label>Project</label>
          <select
            className="form-control"
            value={selectedProject || ''}
            onChange={(e) => setSelectedProject(e.target.value || null)}
          >
            <option value="">No Project</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-actions">
          <button 
            className="btn btn-primary"
            onClick={handleAddTask}
          >
            Add Task
          </button>
          <button 
            className="btn btn-outline"
            onClick={() => setShowTaskForm(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    )}

    <div className="tasks-for-day">
      {editingId ? (
        // Edit task form
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
                    border: `1px solid ${category.color}`,
                    color: editCategories.includes(category.id) ? 'white' : category.color
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
                if (editingId) {
                  updateTask(editingId, editTitle, editDueDate || null, editCategories, editProjectId);
                  setEditingId(null);
                }
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
        // Task list
        tasksForSelectedDate.length > 0 ? (
          tasksForSelectedDate.map(task => (
            <div 
              key={task.id} 
              className={`calendar-task-item ${task.status === 'completed' ? 'completed' : ''}`}
            >
              <div className="task-header">
                <div className="task-check">
                  <label className="task-checkbox-container">
                    <input 
                      type="checkbox" 
                      checked={task.status === 'completed'}
                      onChange={() => toggleTask(task.id)}
                      className="task-checkbox"
                    />
                    <span className="task-checkmark"></span>
                  </label>
                  <span
                    className={`task-title ${task.status === 'completed' ? 'completed' : ''}`}
                  >
                    {task.title}
                  </span>
                </div>
                
                <div className="task-actions">
                  <button 
                    className="btn btn-sm btn-outline"
                    onClick={() => {
                      setEditingId(task.id);
                      setEditTitle(task.title);
                      setEditDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
                      setEditCategories(task.categories || []);
                      setEditProjectId(task.projectId ?? null);
                    }}
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
            </div>
          ))
        ) : (
          <div className="no-tasks-message">
            No tasks scheduled for this day
          </div>
        )
      )}
    </div>
  </div>
)}