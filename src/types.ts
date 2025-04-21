// src/types.ts
export type Task = {
    id: string;
    title: string;
    dueDate?: string | null;
    status: 'pending' | 'completed';
    parentId?: string;
    category?: 
      | 'Now-ish'
      | 'Next Wave'
      | 'Back Burner'
      | 'Ritual/Repeat'
      | 'Blocked'
      | 'Active Projects'
      | 'Been Meaning To Do';
  };