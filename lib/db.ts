import * as SQLite from "expo-sqlite";

// Task Interface
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  list_id?: string;
}

// List Interface
export interface TaskList {
  id: string;
  title: string;
  completed?: boolean;
  tasks?: Task[];
}

// List interface but for index
export interface ListDisplay {
  id: string;
  title: string;
  totalTasks: number;
  completedTasks: number;
}

const db = SQLite.openDatabaseSync("tasks.db");

// Setup database
export const setupDatabase = () => {
  db.execSync(
    `CREATE TABLE IF NOT EXISTS lists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        completed BOOLEAN NOT NULL,
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
    };
  }
  return null;
};

// Add Task
export const addTask = (title: string, list_id?: string) => {
  db.runSync(
    `INSERT INTO tasks (title, completed, list_id) VALUES (?, ?, ?);`,
    [title, false, list_id ?? null]
  );
};

// Update Task
export const updateTask = (id: string, updates: Partial<Task>) => {
  db.runSync(
    `UPDATE tasks SET title = ?, completed = ?, list_id = ? WHERE id = ?;`,
    [
      updates.title ?? "",
      updates.completed ?? false,
      updates.list_id ?? null,
      id,
    ]
  );
};

// Delete Task
export const deleteTask = (id: string) => {
  db.runSync(`DELETE FROM tasks WHERE id = ?;`, [id]);
};

// Get all lists
export const getAllLists = () => {
  const results = db.getAllSync(`SELECT * FROM lists;`);
  return results.map(
    (result: any): TaskList => ({
      id: result.id.toString(),
      title: result.title,
      tasks: [],
    })
  );
};

export const getListById = (id: string): TaskList | null => {
  const result = db.getFirstSync<TaskList>(
    `SELECT * FROM lists WHERE id = ?;`,
    [id]
  );
  if (result) {
    return {
      id: result.id.toString(),
      title: result.title,
      tasks: [],
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
    })
  );
};

// Add List
export const addList = (title: string) => {
  db.runSync(`INSERT INTO lists (title) VALUES (?);`, [title]);
};

// Update List
export const updateList = (id: string, title: string) => {
  db.runSync(`UPDATE lists SET title = ? WHERE id = ?;`, [title, id]);
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
