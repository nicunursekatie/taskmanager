// src/components/ExportTasks.tsx

import React from 'react';
import { Task, Category, Project } from '../types';

interface ExportTasksProps {
  tasks: Task[];
  categories: Category[];
  projects: Project[];
}

const ExportTasks: React.FC<ExportTasksProps> = ({ tasks, categories, projects }) => {
  const handleExport = () => {
    const exportData = { tasks, categories, projects };
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().slice(0, 10); // e.g., "2025-04-27"
    const link = document.createElement('a');
    link.href = url;
    link.download = `taskmanager-export-${timestamp}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button className="btn btn-outline" onClick={handleExport}>
      📤 Export Tasks
    </button>
  );
};

export default ExportTasks;
