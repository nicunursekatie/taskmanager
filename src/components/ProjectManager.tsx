import React, { useState } from 'react';
import { Project } from '../types';

type ProjectManagerProps = {
  projects: Project[];
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (id: string, project: Omit<Project, 'id'>) => void;
  deleteProject: (id: string) => void;
  onClose: () => void;
};

export default function ProjectManager({
  projects,
  addProject,
  updateProject,
  deleteProject,
  onClose,
}: ProjectManagerProps) {
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    addProject({
      name: newName.trim(),
      description: newDescription.trim(),
    });
    
    setNewName('');
    setNewDescription('');
  };

  const startEditing = (project: Project) => {
    setEditId(project.id);
    setEditName(project.name);
    setEditDescription(project.description || '');
  };

  const handleUpdateProject = () => {
    if (!editId || !editName.trim()) return;
    
    updateProject(editId, {
      name: editName.trim(),
      description: editDescription.trim(),
    });
    
    setEditId(null);
  };

  return (
    <div className="overlay">
      <div className="modal">
        <h2>Manage Projects</h2>
        
        <form onSubmit={handleAddProject} className="add-form">
          <input
            type="text"
            placeholder="New project name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <textarea
            placeholder="Project description"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
          />
          <button type="submit">Add Project</button>
        </form>
        
        <div className="project-list">
          {projects.map((project) => (
            <div key={project.id} className="project-item">
              {editId === project.id ? (
                <>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                  />
                  <button onClick={handleUpdateProject}>Save</button>
                  <button onClick={() => setEditId(null)}>Cancel</button>
                </>
              ) : (
                <>
                  <h3 className="project-name">{project.name}</h3>
                  {project.description && (
                    <p className="project-description">{project.description}</p>
                  )}
                  <div className="actions">
                    <button onClick={() => startEditing(project)}>Edit</button>
                    <button onClick={() => deleteProject(project.id)}>Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        
        <button className="close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}