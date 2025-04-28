// src/components/CaptureBar.tsx
import { useState } from 'react';
import { Category, Project } from '../types';

type CaptureBarProps = {
  addTask: (
    title: string,
    dueDate: string | null,
    parentId?: string,
    categoryIds?: string[],
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
  projects
}: CaptureBarProps) {
  // Local state for form fields
  const [text, setText] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [dueTime, setDueTime] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [showAdditionalOptions, setShowAdditionalOptions] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    // Combine date and time if provided
    const dateTime = dueDate
      ? dueTime
        ? `${dueDate}T${dueTime}`
        : `${dueDate}T00:00:00`
      : null;

    // Add the task
    addTask(
      trimmed,
      dateTime,
      newParent,
      selectedCategories.length > 0 ? selectedCategories : undefined,
      projectId
    );
    
    // Reset form fields
    setText('');
    setDueDate('');
    setDueTime('');
    setNewParent('');
    setSelectedCategories([]);
    setProjectId(null);
    setShowAdditionalOptions(false);
  };

  return (
    <div className="capture-bar">
      <form className="capture-form" onSubmit={handleSubmit}>
        <div className="main-capture-row">
          <input
            type="text"
            className="form-control task-input"
            placeholder="Quick capture new task..."
            value={text}
            onChange={e => setText(e.target.value)}
            aria-label="Task description"
          />
          
          <div className="date-time-container">
            <input
              type="date"
              className="form-control date-input"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              aria-label="Due date"
            />
            
            <input
              type="time"
              className="form-control time-input"
              value={dueTime}
              onChange={e => setDueTime(e.target.value)}
              aria-label="Due time"
            />
          </div>
          
          <button type="submit" className="btn btn-primary">
            <span className="btn-icon">+</span>
            <span className="btn-text">Add</span>
          </button>
        </div>
        
        {showAdditionalOptions && (
          <div className="additional-options">
            <div className="option-group">
              <label className="form-label">Project</label>
              <select
                className="form-control"
                value={projectId || ''}
                onChange={e => setProjectId(e.target.value || null)}
                aria-label="Select project"
              >
                <option value="">No Project</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="option-group">
              <label className="form-label">Parent Task</label>
              <select
                className="form-control"
                value={newParent}
                onChange={e => setNewParent(e.target.value)}
                aria-label="Select parent task"
              >
                <option value="">No Parent Task</option>
                {parentOptions.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.title}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="option-group category-container">
              <label className="form-label">Categories</label>
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
          </div>
        )}
      </form>
      
      {!showAdditionalOptions && (
        <button 
          className="btn btn-sm btn-outline expand-options-btn" 
          onClick={() => setShowAdditionalOptions(true)}
          type="button"
          aria-expanded="false"
          aria-controls="additional-options"
        >
          More options
        </button>
      )}
    </div>
  );
}