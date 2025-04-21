import React, { useState } from 'react';
import { Category, Project } from '../types';

export type CaptureBarProps = {
  addTask: (
    title: string, 
    dueDate: string | null, 
    parentId?: string,
    categories?: string[],
    projectId?: string | null
  ) => void;
  newParent: string;
  setNewParent: (id: string) => void;
  parentOptions: { id: string; title: string }[];
  categories: Category[];
  projects: Project[];
};

export default function CaptureBar({
  addTask,
  newParent,
  setNewParent,
  parentOptions,
  categories,
  projects,
}: CaptureBarProps) {
  const [text, setText] = useState('');
  const [dueDate, setDueDate] = useState<string>('');
  const [dueTime, setDueTime] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [showCategorySelect, setShowCategorySelect] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    
    // combine date and time if provided
    const dateTime = dueDate
      ? dueTime
        ? `${dueDate}T${dueTime}`
        : dueDate
      : null;
      
    addTask(
      trimmed, 
      dateTime, 
      newParent, 
      selectedCategories.length > 0 ? selectedCategories : undefined,
      selectedProject || null
    );
    
    setText('');
    setDueDate('');
    setDueTime('');
    setNewParent('');
    setSelectedCategories([]);
    setSelectedProject('');
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="capture-bar">
      <div className="main-inputs">
        <input
          type="text"
          placeholder="Quick capture..."
          value={text}
          onChange={e => setText(e.target.value)}
          className="text-input"
        />
        <input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
        />
        <input
          type="time"
          value={dueTime}
          onChange={e => setDueTime(e.target.value)}
        />
        <select
          value={newParent}
          onChange={e => setNewParent(e.target.value)}
        >
          {parentOptions.map(o => (
            <option key={o.id} value={o.id}>{o.title}</option>
          ))}
        </select>
      </div>
      
      <div className="additional-options">
        <div className="category-selector">
          <button 
            type="button" 
            onClick={() => setShowCategorySelect(!showCategorySelect)}
            className="category-toggle"
          >
            Categories {selectedCategories.length > 0 && `(${selectedCategories.length})`}
          </button>
          
          {showCategorySelect && (
            <div className="category-dropdown">
              {categories.map(category => (
                <div 
                  key={category.id} 
                  className={`category-option ${selectedCategories.includes(category.id) ? 'selected' : ''}`}
                  onClick={() => toggleCategory(category.id)}
                >
                  <span 
                    className="color-dot" 
                    style={{ backgroundColor: category.color }}
                  />
                  <span>{category.name}</span>
                </div>
              ))}
              {categories.length === 0 && (
                <div className="no-categories">No categories created yet</div>
              )}
            </div>
          )}
        </div>
        
        <select
          value={selectedProject}
          onChange={e => setSelectedProject(e.target.value)}
          className="project-select"
        >
          <option value="">No Project</option>
          {projects.map(project => (
            <option key={project.id} value={project.id}>{project.name}</option>
          ))}
        </select>
      </div>
      
      <button type="submit" className="add-btn">Add</button>
    </form>
  );
}