import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: string;
  createdAt: string;
}

interface TasksState {
  tasks: Task[];
}

const initialState: TasksState = {
  tasks: [],
};

// Async thunk to fetch tasks from the backend
export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async () => {
  const response = await axios.get('http://localhost:8080/api/todos');
  const tasks = response.data.map((task: { _id: { $oid: string }; title: string; description: string; completed: boolean; priority: string; created_at: string }) => ({
    id: task._id.$oid,
    title: task.title,
    description: task.description,
    completed: task.completed,
    priority: task.priority,
    createdAt: task.created_at,
  }));
  return tasks;
});

// Async thunk to add a new task to the backend
export const addTask = createAsyncThunk('tasks/addTask', async (task: { title: string; priority: string }) => {
  const newTask = {
    title: task.title,
    description: "",
    completed: false,
    priority: task.priority,
    created_at: new Date().toISOString(), // Add created_at field
  };
  const response = await axios.post('http://localhost:8080/api/todos', newTask);
  return response.data;
});

// Async thunk to toggle the completion status of a task
export const toggleTask = createAsyncThunk('tasks/toggleTask', async (id: string) => {
  if (!id) throw new Error('Task ID is required');
  const response = await axios.patch(`http://localhost:8080/api/todos/${id}/toggle`);
  return response.data;
});

// Async thunk to edit an existing task
export const editTask = createAsyncThunk('tasks/editTask', async (task: { id: string; newTitle: string; newPriority: string; newDescription: string }) => {
  if (!task.id) throw new Error('Task ID is required');
  const updatedTask = {
    title: task.newTitle,
    description: task.newDescription || "",
    completed: false,
    priority: task.newPriority,
    created_at: new Date().toISOString()
  };
  await axios.put(`http://localhost:8080/api/todos/${task.id}`, updatedTask);
  return { id: task.id, ...updatedTask };
});

// Async thunk to delete a task from the backend
export const deleteTask = createAsyncThunk('tasks/deleteTask', async (id: string) => {
  if (!id) throw new Error('Task ID is required');
  await axios.delete(`http://localhost:8080/api/todos/${id}`);
  return id;
});

// Create the tasks slice
export const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.tasks = action.payload;
      })
      .addCase(addTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload);
      })
      .addCase(toggleTask.fulfilled, (state, action) => {
        const task = state.tasks.find((t) => t.id === action.payload.id);
        if (task) {
          task.completed = action.payload.completed;
        }
      })
      .addCase(editTask.fulfilled, (state, action) => {
        const task = state.tasks.find((t) => t.id === action.payload.id);
        if (task) {
          task.title = action.payload.title;
          task.priority = action.payload.priority;
          task.description = action.payload.description;
        }
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((t) => t.id !== action.payload);
      });
  },
});

export default tasksSlice.reducer;
