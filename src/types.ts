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
  projectId?: string | null;
  categories?: string[];  // Add this field back
};

export type FilterPanelProps = {
  categories: Category[];
  projects: Project[];
  activeCategories: string[];
  activeProject: string | null;
  toggleCategoryFilter: (categoryId: string) => void;
  setProjectFilter: (projectId: string | null) => void;
  clearFilters: () => void;
};

export type CaptureBarProps = {
  addTask: (
    title: string,
    dueDate: string | null,
    parentId?: string,
    categoryIds?: string[],      // now supports your array of categories
    projectId?: string | null    // now supports the project you pick
  ) => void;
     newParent: string;
     setNewParent: (id: string) => void;
     parentOptions: { id: string; title: string }[];
     categories: Category[];
     projects: Project[];
   };
  
   export type TaskListProps = {
    tasks: Task[];
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
    categories: Category[];
    projects: Project[];
  };

export type ContextWizardProps = {
  tasks: Task[];
  onClose: () => void;
  generalTasks: string[];
};