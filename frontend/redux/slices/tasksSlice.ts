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

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:8080/api';

// Async thunk to fetch tasks from the backend
export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async () => {
  const response = await axios.get(`${API_BASE_URL}/todos`);
  const tasks = (response.data as Array<{ _id: { $oid: string }; title: string; description: string; completed: boolean; priority: string; created_at: string }>).map((task) => ({
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
export const addTask = createAsyncThunk('tasks/addTask', async (task: { title: string; priority: string; description: string }) => {
  const newTask = {
    title: task.title,
    description: task.description,
    completed: false,
    priority: task.priority,
    created_at: new Date().toISOString(),
  };
  const response = await axios.post(`${API_BASE_URL}/todos`, newTask);
  return response.data;
});

// Async thunk to toggle the completion status of a task
export const toggleTask = createAsyncThunk('tasks/toggleTask', async (id: string) => {
  if (!id) throw new Error('Task ID is required');
  const response = await axios.patch(`${API_BASE_URL}/todos/${id}/toggle`);
  return response.data;
});

// Async thunk to set the completion status of a task to true
export const setTaskCompletion = createAsyncThunk('tasks/setTaskCompletion', async (id: string) => {
  if (!id) throw new Error('Task ID is required');
  const response = await axios.patch(`${API_BASE_URL}/todos/${id}/complete`);
  return response.data;
});

// Async thunk to edit an existing task
export const editTask = createAsyncThunk('tasks/editTask', async (task: { id: string; newTitle: string; newPriority: string; newDescription: string }) => {
  if (!task.id) throw new Error('Task ID is required');
  const updatedTask = {
    title: task.newTitle,
    description: task.newDescription,
    completed: false,
    priority: task.newPriority,
    created_at: new Date().toISOString()
  };
  await axios.put(`${API_BASE_URL}/todos/${task.id}`, updatedTask);
  return { id: task.id, ...updatedTask };
});

// Async thunk to delete a task from the backend
export const deleteTask = createAsyncThunk('tasks/deleteTask', async (id: string) => {
  if (!id) throw new Error('Task ID is required');
  await axios.delete(`${API_BASE_URL}/todos/${id}`);
  return id;
});

// Create the tasks slice
export const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.fulfilled, (state: TasksState, action) => {
        state.tasks = action.payload as Task[];
      })
      .addCase(addTask.fulfilled, (state: TasksState, action) => {
        const newTask = action.payload as Task;
        state.tasks.push(newTask);
      })
      .addCase(toggleTask.fulfilled, (state: TasksState, action) => {
        const payload = action.payload as { id: string; completed: boolean };
        const task = state.tasks.find((t: Task) => t.id === payload.id);
        if (task) {
          task.completed = payload.completed;
        }
      })
      .addCase(setTaskCompletion.fulfilled, (state: TasksState, action) => {
        const payload = action.payload as { id: string; completed: boolean };
        const task = state.tasks.find((t: Task) => t.id === payload.id);
        if (task) {
          task.completed = payload.completed;
        }
      })
      .addCase(editTask.fulfilled, (state: TasksState, action) => {
        const payload = {
          id: action.payload.id,
          title: action.payload.title,
          description: action.payload.description,
          completed: action.payload.completed,
          priority: action.payload.priority,
          createdAt: action.payload.created_at,
        };
        const task = state.tasks.find((t: Task) => t.id === payload.id);
        if (task) {
          task.title = payload.title;
          task.priority = payload.priority;
          task.description = payload.description;
        }
      })
      .addCase(deleteTask.fulfilled, (state: TasksState, action) => {
        const id = action.payload as string;
        state.tasks = state.tasks.filter((t: Task) => t.id !== id);
      });
  },
});

export default tasksSlice.reducer;
