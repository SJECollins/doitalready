import * as SQLite from "expo-sqlite";

// Task Interface
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  deleteOnComplete: boolean;
  resetOnComplete: boolean;
  resetInterval: "hour" | "day" | "week" | "month" | "year" | null;
  resetAt: string;
  list_id?: string;
}

// List Interface
export interface TaskList {
  id: string;
  title: string;
}

export interface NewList {
  title: string;
  deleteOnComplete: boolean;
  resetOnComplete: boolean;
  resetInterval: "hour" | "day" | "week" | "month" | "year" | null;
  resetAt?: string;
  completed?: boolean;
}

// List interface but for index
export interface ListDisplay {
  id: string;
  title: string;
  totalTasks: number;
  completedTasks: number;
  resetOnComplete?: boolean;
  resetInterval?: "hour" | "day" | "week" | "month" | "year" | null;
  resetAt?: string;
  deleteOnComplete?: boolean;
  completed: boolean;
  tasks?: Task[];
}

const db = SQLite.openDatabaseSync("tasks.db");

// Setup database
export const setupDatabase = () => {
  db.execSync(
    `CREATE TABLE IF NOT EXISTS lists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        completed BOOLEAN NOT NULL,
        deleteOnComplete BOOLEAN NOT NULL,
        resetOnComplete BOOLEAN NOT NULL,
        resetInterval TEXT,
        resetAt DATETIME
    );
    
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        completed BOOLEAN NOT NULL,
        deleteOnComplete BOOLEAN NOT NULL,
        resetOnComplete BOOLEAN NOT NULL,
        resetInterval TEXT,
        resetAt DATETIME,
        list_id INTEGER,
        FOREIGN KEY(list_id) REFERENCES lists(id)
    );`
  );
};

// Retrieve all tasks (probably won't use)
export const getAllTasks = () => {
  const results = db.getAllSync(`SELECT * FROM tasks;`);
  return results.map(
    (result: any): Task => ({
      id: result.id.toString(),
      title: result.title,
      completed: result.completed,
      list_id: result.list_id?.toString(),
      deleteOnComplete: result.deleteOnComplete,
      resetOnComplete: result.resetOnComplete,
      resetAt: result.resetAt,
      resetInterval: result.resetInterval,
    })
  );
};

// Get tasks not assigned to any list
export const getUnassignedTasks = () => {
  const results = db.getAllSync(`SELECT * FROM tasks WHERE list_id IS NULL;`);
  return results.map(
    (result: any): Task => ({
      id: result.id.toString(),
      title: result.title,
      completed: result.completed,
      list_id: result.list_id?.toString(),
      deleteOnComplete: result.deleteOnComplete,
      resetOnComplete: result.resetOnComplete,
      resetAt: result.resetAt,
      resetInterval: result.resetInterval,
    })
  );
};

// Retrieve task by id
export const getTaskById = (id: string): Task | null => {
  const result = db.getFirstSync<Task>(`SELECT * FROM tasks WHERE id = ?;`, [
    id,
  ]);
  if (result) {
    return {
      id: result.id.toString(),
      title: result.title,
      completed: result.completed,
      list_id: result.list_id?.toString(),
      deleteOnComplete: result.deleteOnComplete,
      resetOnComplete: result.resetOnComplete,
      resetAt: result.resetAt,
      resetInterval: result.resetInterval,
    };
  }
  return null;
};

// Add Task
export const addTask = (
  title: string,
  list_id?: string,
  deleteOnComplete?: boolean,
  resetOnComplete?: boolean,
  resetInterval?: "hour" | "day" | "week" | "month" | "year" | null
) => {
  if (list_id) {
    deleteOnComplete = false;
    resetOnComplete = false;
  }
  db.runSync(
    `INSERT INTO tasks (title, completed, list_id, deleteOnComplete, resetOnComplete, resetInterval) VALUES (?, ?, ?, ?, ?, ?);`,
    [
      title,
      false,
      list_id ?? null,
      deleteOnComplete ?? false,
      resetOnComplete ?? false,
      resetInterval ?? null,
    ]
  );
};

// Update Task
export const updateTask = (id: string, updates: Partial<Task>) => {
  const taskToUpdate = getTaskById(id);
  console.log("Current task:", taskToUpdate?.list_id);
  console.log("Updating task:", id, updates);
  if (!taskToUpdate) {
    return;
  }
  if (taskToUpdate.list_id) {
    updates.deleteOnComplete = false;
    updates.resetOnComplete = false;
    updates.resetAt = undefined;
    updates.resetInterval = null;
  }
  db.runSync(
    `UPDATE tasks SET title = ?, completed = ?, list_id = ?, deleteOnComplete = ?, resetOnComplete = ?, resetAt = ?, resetInterval = ? WHERE id = ?;`,
    [
      updates.title ?? taskToUpdate.title,
      updates.completed ?? taskToUpdate.completed,
      updates.list_id !== undefined
        ? updates.list_id
        : taskToUpdate.list_id ?? null,
      updates.deleteOnComplete ?? taskToUpdate.deleteOnComplete,
      updates.resetOnComplete ?? taskToUpdate.resetOnComplete,
      updates.resetAt ?? taskToUpdate.resetAt,
      updates.resetInterval ?? taskToUpdate.resetInterval,
      id,
    ]
  );
  console.log("Task updated:", id, updates);
  // If task is marked completed and deleteOnComplete is true, delete the task
  const updatedTask = getTaskById(id);
  if (!updatedTask) return;
  if (updatedTask.completed && updatedTask.deleteOnComplete) {
    deleteTask(id);
  }
  // If task is marked completed and resetOnComplete is true, set resetAt depending on selected interval
  if (updatedTask.completed && updatedTask.resetOnComplete) {
    switch (updatedTask.resetInterval) {
      case "hour":
        updates.resetAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
        break;
      case "day":
        updates.resetAt = new Date(
          Date.now() + 24 * 60 * 60 * 1000
        ).toISOString();
        break;
      case "week":
        updates.resetAt = new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString();
        break;
      case "month":
        updates.resetAt = new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString();
        break;
      case "year":
        updates.resetAt = new Date(
          Date.now() + 365 * 24 * 60 * 60 * 1000
        ).toISOString();
        break;
      default:
        updates.resetAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    }
    db.runSync(`UPDATE tasks SET resetAt = ? WHERE id = ?;`, [
      updates.resetAt,
      id,
    ]);
  }
};

// Delete Task
export const deleteTask = (id: string) => {
  db.runSync(`DELETE FROM tasks WHERE id = ?;`, [id]);
};

// Get all lists
export const getAllLists = () => {
  const results = db.getAllSync(`SELECT * FROM lists;`) as ListDisplay[];
  results.forEach((list) => {
    const tasks = getTasksForList(list.id);
    list.tasks = tasks;
    list.completedTasks = tasks.filter((t) => t.completed).length;
    list.totalTasks = tasks.length;
    list.completed =
      list.totalTasks > 0 && list.totalTasks === list.completedTasks;
  });
  return results.map(
    (result: any): ListDisplay => ({
      id: result.id.toString(),
      title: result.title,
      totalTasks: result.totalTasks,
      completedTasks: result.completedTasks,
      tasks: result.tasks,
      deleteOnComplete: result.deleteOnComplete,
      resetOnComplete: result.resetOnComplete,
      resetAt: result.resetAt,
      resetInterval: result.resetInterval,
      completed: result.completed,
    })
  );
};

export const getLists = () => {
  const results = db.getAllSync(`SELECT * FROM lists;`) as ListDisplay[];
  return results.map((result) => ({
    id: result.id.toString(),
    title: result.title,
  }));
};

export const getListById = (id: string): ListDisplay | null => {
  const result = db.getFirstSync<ListDisplay>(
    `SELECT * FROM lists WHERE id = ?;`,
    [id]
  );
  const tasks = getTasksForList(id);
  if (result) {
    result.tasks = tasks;
    result.completedTasks = tasks.filter((t) => t.completed).length;
    result.totalTasks = tasks.length;
    result.completed =
      result.totalTasks > 0 && result.totalTasks === result.completedTasks;
  }
  if (result) {
    return {
      id: result.id.toString(),
      title: result.title,
      tasks: result.tasks,
      deleteOnComplete: result.deleteOnComplete,
      resetOnComplete: result.resetOnComplete,
      resetAt: result.resetAt,
      totalTasks: result.totalTasks,
      completedTasks: result.completedTasks,
      resetInterval: result.resetInterval,
      completed: result.completed,
    };
  }
  return null;
};

// Get all tasks for a specific list
export const getTasksForList = (list_id: string) => {
  const results = db.getAllSync(`SELECT * FROM tasks WHERE list_id = ?;`, [
    list_id,
  ]);
  return results.map(
    (result: any): Task => ({
      id: result.id.toString(),
      title: result.title,
      completed: result.completed,
      list_id: result.list_id?.toString(),
      deleteOnComplete: result.deleteOnComplete,
      resetOnComplete: result.resetOnComplete,
      resetAt: result.resetAt,
      resetInterval: result.resetInterval,
    })
  );
};

// Add List
export const addList = (
  title: string,
  deleteOnComplete: boolean,
  resetOnComplete: boolean,
  resetInterval: string | null
) => {
  db.runSync(
    `INSERT INTO lists (title, completed, deleteOnComplete, resetOnComplete, resetInterval) VALUES (?, ?, ?, ?, ?);`,
    [title, false, deleteOnComplete, resetOnComplete, resetInterval]
  );
};

const listComplete = (id: string) => {
  const tasks = getTasksForList(id);
  const list = getListById(id);
  if (tasks.length > 0 && tasks.every((task) => task.completed)) {
    return true;
  } else if (list && list.completed) {
    return true;
  }
  return false;
};

export const resetListTasks = (id: string) => {
  const tasks = getTasksForList(id);
  tasks.forEach((task) => {
    if (task.completed) {
      task.completed = false;
      updateTask(task.id, { completed: false });
    }
  });
};

export const checkIfListComplete = (id: string) => {
  const tasks = getTasksForList(id);
  if (tasks.length === 0) return false;
  if (tasks.every((task) => task.completed)) {
    return true;
  }
  return false;
};

// Update List
export const updateList = (id: string, updates: Partial<ListDisplay>) => {
  const currentList = getListById(id);
  if (!currentList) return;
  if (currentList.deleteOnComplete) {
    updates.resetOnComplete = false;
    updates.resetAt = undefined;
    updates.resetInterval = null;
  }

  db.runSync(
    `UPDATE lists SET title = ?, deleteOnComplete = ?, resetOnComplete = ?, resetAt = ?, resetInterval = ?, completed = ? WHERE id = ?;`,
    [
      updates.title ?? currentList.title,
      updates.deleteOnComplete ?? currentList.deleteOnComplete ?? false,
      updates.resetOnComplete ?? currentList.resetOnComplete ?? false,
      updates.resetAt ?? currentList.resetAt ?? null,
      updates.resetInterval ?? currentList.resetInterval ?? null,
      updates.completed ?? currentList.completed ?? false,
      id,
    ]
  );
  // If list is marked completed and deleteOnComplete is true, delete the list
  const list = getListById(id);
  if (!list) return;
  if (listComplete(id) && list.deleteOnComplete) {
    deleteList(id);
  }
  // If list is marked completed and resetOnComplete is true, set resetAt depending on selected interval
  if (listComplete(id) && list.resetOnComplete) {
    switch (list.resetInterval) {
      case "hour":
        updates.resetAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
        break;
      case "day":
        updates.resetAt = new Date(
          Date.now() + 24 * 60 * 60 * 1000
        ).toISOString();
        break;
      case "week":
        updates.resetAt = new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString();
        break;
      case "month":
        updates.resetAt = new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString();
        break;
      case "year":
        updates.resetAt = new Date(
          Date.now() + 365 * 24 * 60 * 60 * 1000
        ).toISOString();
        break;
      default:
        updates.resetAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    }
    db.runSync(`UPDATE lists SET resetAt = ? WHERE id = ?;`, [
      updates.resetAt,
      id,
    ]);
  }
};

// Delete List and its Tasks
export const deleteList = (id: string) => {
  db.runSync(`DELETE FROM lists WHERE id = ?;`, [id]);
  db.runSync(`DELETE FROM tasks WHERE list_id = ?;`, [id]);
};

// Reset the database
export const resetDatabase = () => {
  db.runSync(`DROP TABLE IF EXISTS tasks;`);
  db.runSync(`DROP TABLE IF EXISTS lists;`);
  setupDatabase();
};
