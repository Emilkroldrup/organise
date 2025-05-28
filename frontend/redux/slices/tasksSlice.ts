import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from 'axios';
import { RootState } from "../store";

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: string;
  created_at: string;
  updated_at?: string;
}

interface TasksState {
  tasks: Task[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: TasksState = {
  tasks: [],
  status: "idle",
  error: null
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
    created_at: task.created_at,
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
  reducers: {
    reorderTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })
      .addCase(addTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload);
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

export const { reorderTasks } = tasksSlice.actions;

// Selector functions
export const selectAllTasks = (state: RootState) => state.tasks.tasks;
export const selectTasksStatus = (state: RootState) => state.tasks.status;
export const selectTasksError = (state: RootState) => state.tasks.error;
export const selectTaskById = (state: RootState, taskId: string) => 
  state.tasks.tasks.find(task => task.id === taskId);
export const selectTasksByPriority = (state: RootState, priority: string) =>
  state.tasks.tasks.filter(task => task.priority === priority);
export const selectCompletedTasks = (state: RootState) =>
  state.tasks.tasks.filter(task => task.completed);
export const selectIncompleteTasks = (state: RootState) =>
  state.tasks.tasks.filter(task => !task.completed);

export default tasksSlice.reducer;
