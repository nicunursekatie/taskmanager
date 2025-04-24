// src/components/ProjectDashboard.tsx
import React, { useState } from 'react';
import { Task, Project, Category } from '../types';
import TaskList from './TaskList';

type ProjectDashboardProps = {
  projects: Project[];
  tasks: Task[];
  categories: Category[];
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
};

export default function ProjectDashboard({
  projects,
  tasks,
  categories,
  toggleTask,
  deleteTask,
  updateTask,
  addTask
}: ProjectDashboardProps) {
  // State for the currently expanded project panel
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  
  // Get tasks without a project
  const unassignedTasks = tasks.filter(task => !task.projectId);
  
  // Get tasks grouped by status
  const getTasksByStatus = (projectId: string | null) => {
    const projectTasks = tasks.filter(task => task.projectId === projectId);
    return {
      pending: projectTasks.filter(task => task.status === 'pending'),
      completed: projectTasks.filter(task => task.status === 'completed'),
    };
  };
  
  // Handle expanding/collapsing project panels
  const toggleProjectExpand = (projectId: string) => {
    if (expandedProject === projectId) {
      setExpandedProject(null);
    } else {
      setExpandedProject(projectId);
    }
  };
  
  // Get counts of tasks per project
  const getProjectCounts = (projectId: string) => {
    const projectTasks = tasks.filter(task => task.projectId === projectId);
    return {
      total: projectTasks.length,
      pending: projectTasks.filter(task => task.status === 'pending').length,
      completed: projectTasks.filter(task => task.status === 'completed').length,
    };
  };

  return (
    <div className="project-dashboard">
      {/* Unassigned Tasks Section */}
      <div className="project-panel">
        <div 
          className="project-header"
          onClick={() => toggleProjectExpand('unassigned')}
        >
          <h2 className="project-name">Unassigned Tasks</h2>
          <div className="project-stats">
            <span className="task-count">{unassignedTasks.length} tasks</span>
            <span className="expand-icon">
              {expandedProject === 'unassigned' ? '▼' : '▶'}
            </span>
          </div>
        </div>
        
        {expandedProject === 'unassigned' && (
          <div className="project-content">
            {unassignedTasks.length > 0 ? (
              <>
                <div className="task-section">
                  <h3 className="task-section-title">Pending</h3>
                  <TaskList 
                                      tasks={unassignedTasks.filter(t => t.status === 'pending')}
                                      toggleTask={toggleTask}
                                      deleteTask={deleteTask}
                                      updateTask={updateTask}
                                      categories={categories}
                                      projects={projects} addTask={function (title: string, dueDate: string | null, parentId?: string, categoryIds?: string[], projectId?: string | null): void {
                                          throw new Error('Function not implemented.');
                                      } }                  />
                </div>
                
                <div className="task-section">
                  <h3 className="task-section-title">Completed</h3>
                  <TaskList 
                                      tasks={unassignedTasks.filter(t => t.status === 'completed')}
                                      toggleTask={toggleTask}
                                      deleteTask={deleteTask}
                                      updateTask={updateTask}
                                      categories={categories}
                                      projects={projects} addTask={function (title: string, dueDate: string | null, parentId?: string, categoryIds?: string[], projectId?: string | null): void {
                                          throw new Error('Function not implemented.');
                                      } }                  />
                </div>
              </>
            ) : (
              <div className="no-tasks-message">
                No unassigned tasks
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Project Sections */}
      {projects.map(project => {
        const counts = getProjectCounts(project.id);
        const { pending, completed } = getTasksByStatus(project.id);
        
        return (
          <div key={project.id} className="project-panel">
            <div 
              className="project-header"
              onClick={() => toggleProjectExpand(project.id)}
            >
              <h2 className="project-name">{project.name}</h2>
              <div className="project-stats">
                <span className="task-count">
                  {counts.pending} pending / {counts.total} total
                </span>
                <span className="expand-icon">
                  {expandedProject === project.id ? '▼' : '▶'}
                </span>
              </div>
            </div>
            
            {expandedProject === project.id && (
              <div className="project-content">
                {project.description && (
                  <p className="project-description">{project.description}</p>
                )}
                
                {counts.total > 0 ? (
                  <>
                    {pending.length > 0 && (
                      <div className="task-section">
                        <h3 className="task-section-title">Pending</h3>
                        <TaskList 
                                            tasks={pending}
                                            toggleTask={toggleTask}
                                            deleteTask={deleteTask}
                                            updateTask={updateTask}
                                            categories={categories}
                                            projects={projects} addTask={function (title: string, dueDate: string | null, parentId?: string, categoryIds?: string[], projectId?: string | null): void {
                                                throw new Error('Function not implemented.');
                                            } }                        />
                      </div>
                    )}
                    
                    {completed.length > 0 && (
                      <div className="task-section">
                        <h3 className="task-section-title">Completed</h3>
                        <TaskList 
                                            tasks={completed}
                                            toggleTask={toggleTask}
                                            deleteTask={deleteTask}
                                            updateTask={updateTask}
                                            categories={categories}
                                            projects={projects} addTask={function (title: string, dueDate: string | null, parentId?: string, categoryIds?: string[], projectId?: string | null): void {
                                                throw new Error('Function not implemented.');
                                            } }                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="no-tasks-message">
                    No tasks in this project
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}