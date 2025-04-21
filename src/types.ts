// src/types.ts
// Complete type definitions for the TaskManager app

export type Project = {
  id: string;
  name: string;
  description?: string;
};

export type Category = {
  id: string;
  name: string;
  color: string;
};

export type Task = {
  id: string;
  title: string;
  dueDate?: string | null;
  status: 'pending' | 'completed';
  parentId?: string;
  categoryId?: string;
  projectId?: string;
};

export type FilterPanelProps = {
  categories: Category[];
  projects: Project[];
  activeCategory: string | null;
  activeProject: string | null;
  toggleCategoryFilter: (categoryId: string) => void;
  setProjectFilter: (projectId: string | null) => void;
  clearFilters: () => void;
};

export type CaptureBarProps = {
  addTask: (title: string, dueDate: string | null, parentId?: string) => void;
  newParent: string;
  setNewParent: (id: string) => void;
  parentOptions: { id: string; title: string }[];
};

export type TaskListProps = {
  tasks: Task[];
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, title: string, dueDate: string | null) => void;
};

export type ContextWizardProps = {
  tasks: Task[];
  onClose: () => void;
  generalTasks: string[];
};