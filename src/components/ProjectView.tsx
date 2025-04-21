import { Task } from "../types";
import { Project, Category } from '../types';
import TaskList from './TaskList';

type ProjectViewProps = {
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
};

export default function ProjectView({
  projects,
  tasks,
  categories,
  toggleTask,
  deleteTask,
  updateTask,
}: ProjectViewProps) {
  if (projects.length === 0) {
    return (
      <div className="no-projects-message">
        <p>No projects created yet. Create a project to organize related tasks together.</p>
      </div>
    );
  }

  return (
    <div className="project-view">
      {projects.map(project => {
        const projectTasks = tasks.filter(task => task.projectId === project.id);
        
        return (
          <div key={project.id} className="project-section">
            <h2 className="project-title">{project.name}</h2>
            {project.description && <p className="project-description">{project.description}</p>}
            
            {projectTasks.length > 0 ? (
              <TaskList 
                tasks={projectTasks} 
                toggleTask={toggleTask} 
                deleteTask={deleteTask} 
                updateTask={updateTask} 
                categories={categories}
                projects={projects}
              />
            ) : (
              <p className="no-tasks-message">No tasks in this project yet.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}