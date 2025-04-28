// src/components/ImportTasks.tsx

import React from 'react';
import { Task, Category, Project } from '../types';

interface ImportTasksProps {
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
}

const ImportTasks: React.FC<ImportTasksProps> = ({ setTasks, setCategories, setProjects }) => {
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      alert('Please select a file first.');
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const importedData = JSON.parse(e.target?.result as string);

        if (importedData.tasks && importedData.projects && importedData.categories) {
          setTasks(importedData.tasks);
          setProjects(importedData.projects);
          setCategories(importedData.categories);
          alert('Import successful!');
        } else {
          alert('The file format looks wrong. Make sure it’s your exported task file.');
        }
      } catch (error) {
        console.error('Error importing tasks:', error);
        alert('Failed to import: Invalid file.');
      }
    };

    reader.readAsText(file);
  };

  return (
    <div style={{ margin: '20px 0' }}>
      <input type="file" accept=".json" onChange={handleImport} />
    </div>
  );
};

export default ImportTasks;
