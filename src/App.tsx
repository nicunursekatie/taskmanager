// src/App.tsx
import React, { useState, useEffect } from 'react';
import CaptureBar from './components/CaptureBar';
import TaskList from './components/TaskList';
import ContextWizard from './components/ContextWizard';
import './App.css';

export type Task = {
  id: string;
  title: string;
  dueDate?: string | null;
  status: 'pending' | 'completed';
  parentId?: string;
};

function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const s = localStorage.getItem('tasks');
    return s ? JSON.parse(s) : [];
  });

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const [showWizard, setShowWizard] = useState(false);
  const [newParent, setNewParent] = useState<string>('');
  const parentOptions = [
    { id: '', title: '— None —' },
    ...tasks.map(t => ({ id: t.id, title: t.title })),
  ];

  const addTask = (title: string, dueDate: string | null, parentId?: string) => {
    setTasks(prev => [
      ...prev,
      { id: Date.now().toString(), title, dueDate, status: 'pending', parentId },
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
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const updateTask = (id: string, title: string, dueDate: string | null) => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, title, dueDate } : t))
    );
  };

  // sort and group tasks by due date
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.dueDate === b.dueDate) return 0;
    if (a.dueDate == null) return 1;
    if (b.dueDate == null) return -1;
    return a.dueDate! < b.dueDate! ? -1 : 1;
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
      <div className="capture-bar">
        <CaptureBar
          addTask={addTask}
          newParent={newParent}
          setNewParent={setNewParent}
          parentOptions={parentOptions}
        />
      </div>
      <div style={{ textAlign: 'center', margin: '16px 0' }}>
        <button onClick={() => setShowWizard(true)}>What should I do now?</button>
      </div>
      {showWizard && (
        <ContextWizard
          tasks={sortedTasks}
          onClose={() => setShowWizard(false)}
          generalTasks={generalTasks}
        />
      )}
      {overdueTasks.length > 0 && (
        <>
          <h2 className="section-header">Overdue</h2>
          <TaskList tasks={overdueTasks} toggleTask={toggleTask} deleteTask={deleteTask} updateTask={updateTask} />
        </>
      )}
      {todayTasks.length > 0 && (
        <>
          <h2 className="section-header">Due Today</h2>
          <TaskList tasks={todayTasks} toggleTask={toggleTask} deleteTask={deleteTask} updateTask={updateTask} />
        </>
      )}
      {upcomingTasks.length > 0 && (
        <>
          <h2 className="section-header">Upcoming</h2>
          <TaskList tasks={upcomingTasks} toggleTask={toggleTask} deleteTask={deleteTask} updateTask={updateTask} />
        </>
      )}
      {noDateTasks.length > 0 && (
        <>
          <h2 className="section-header">No Date</h2>
          <TaskList tasks={noDateTasks} toggleTask={toggleTask} deleteTask={deleteTask} updateTask={updateTask} />
        </>
      )}
    </div>
  );
}

export default App;