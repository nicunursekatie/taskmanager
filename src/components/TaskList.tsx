// src/App.tsx
import TaskList from './components/TaskList';

// ... other imports

export default function App() {
  // ... other code

  // Today's ISO date string
  const todayStr = new Date().toISOString().split('T')[0];

  const overdueTasks = sortedTasks.filter(
    t => t.dueDate && t.dueDate < todayStr
  );
  const todayTasks = sortedTasks.filter(
    t => t.dueDate === todayStr
  );
  const upcomingTasks = sortedTasks.filter(
    t => t.dueDate && t.dueDate > todayStr
  );
  const noDateTasks = sortedTasks.filter(
    t => !t.dueDate
  );

  const updateTask = (
    id: string,
    title: string,
    dueDate: string | null
  ) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === id ? { ...t, title, dueDate } : t
      )
    );
  };

  return (
    <div>
      {/* Other components */}

      {overdueTasks.length > 0 && (
        <>
          <h2 className="section-header">Overdue</h2>
          <TaskList
            tasks={overdueTasks}
            toggleTask={toggleTask}
            deleteTask={deleteTask}
            updateTask={updateTask}
          />
        </>
      )}

      {todayTasks.length > 0 && (
        <>
          <h2 className="section-header">Due Today</h2>
          <TaskList
            tasks={todayTasks}
            toggleTask={toggleTask}
            deleteTask={deleteTask}
            updateTask={updateTask}
          />
        </>
      )}

      {upcomingTasks.length > 0 && (
        <>
          <h2 className="section-header">Upcoming</h2>
          <TaskList
            tasks={upcomingTasks}
            toggleTask={toggleTask}
            deleteTask={deleteTask}
            updateTask={updateTask}
          />
        </>
      )}

      {noDateTasks.length > 0 && (
        <>
          <h2 className="section-header">No Date</h2>
          <TaskList
            tasks={noDateTasks}
            toggleTask={toggleTask}
            deleteTask={deleteTask}
            updateTask={updateTask}
          />
        </>
      )}
    </div>
  );
}