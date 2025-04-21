// src/App.tsx
import './app-styles.css';
import React, { useState, useEffect } from 'react';
import CaptureBar from './components/CaptureBar';
import TaskList from './components/TaskList';
import ContextWizard from './components/ContextWizard';
import { Task, Category, Project } from './types';
import './App.css';

function App() {
  // Existing state for tasks, parents, etc.
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newParent, setNewParent] = useState<string>('');
  // Example initial categories (lifted from your types)
  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'Work', color: '#F59E0B' },
    { id: '2', name: 'Personal', color: '#10B981' },
    { id: '3', name: 'Other', color: '#3B82F6' },
  ]);

  // 🚀 NEW: Projects state & callback
  const [projects, setProjects] = useState<Project[]>([]);
  const addProject = (name: string, description?: string) => {
    const id = Date.now().toString(); // simplistic unique ID
    const newProject: Project = { id, name, description };
    setProjects(prev => [...prev, newProject]);
  };

  // Existing addTask, updateTask, toggleTask, deleteTask…
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
      categories: categoryIds,
      projectId: projectId || null,
    };
    setTasks(prev => [...prev, newTask]);
  };

  // (Implement updateTask, toggleTask, deleteTask similarly…)

  return (
    <div className="App">
      {/* Pass projects state & addProject into your panel */}
      <CaptureBar
        addTask={addTask}
        newParent={newParent}
        setNewParent={setNewParent}
        parentOptions={[] /* your existing parents */}
        categories={categories}
        projects={projects}
      />

      {/* Somewhere in your UI you can now create new projects: */}
      <div style={{ margin: '16px 0' }}>
        <input
          placeholder="New project name"
          onKeyDown={e => {
            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
              addProject(e.currentTarget.value.trim());
              e.currentTarget.value = '';
            }
          }}
        />
        <button onClick={() => {/* optionally hook into addProject logic */}}>
          + Add Project
        </button>
      </div>

      <TaskList
        tasks={tasks}
        toggleTask={id => {/*…*/}}
        deleteTask={id => setTasks(prev => prev.filter(t => t.id !== id))}
        updateTask={(id, title, dueDate, categoryIds, projId) => {/*…*/}}
        categories={categories}
        projects={projects}
      />

      <ContextWizard tasks={tasks} onClose={() => {}} generalTasks={[]} />
    </div>
  );
}

export default App;
