// Extend the existing Task interface
import { BaseTask } from './types';

declare module './types' {
  interface Task extends BaseTask {
    parentId?: string;
  }
}