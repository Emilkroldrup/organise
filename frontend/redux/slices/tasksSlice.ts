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

// Async thunk to fetch tasks from the backend
export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async () => {
  const response = await axios.get('http://localhost:8080/api/todos');
  const tasks = response.data.map((task: { _id: { $oid: string }; title: string; description: string; completed: boolean; priority: string; created_at: string }) => ({
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
  const response = await axios.post('http://localhost:8080/api/todos', newTask);
  return response.data;
});

// Async thunk to toggle the completion status of a task
export const toggleTask = createAsyncThunk('tasks/toggleTask', async (id: string) => {
  if (!id) throw new Error('Task ID is required');
  const response = await axios.patch(`http://localhost:8080/api/todos/${id}/toggle`);
  return response.data;
});

// Async thunk to set the completion status of a task to true
export const setTaskCompletion = createAsyncThunk('tasks/setTaskCompletion', async (id: string) => {
  if (!id) throw new Error('Task ID is required');
  const response = await axios.patch(`http://localhost:8080/api/todos/${id}/complete`);
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
      .addCase(toggleTask.fulfilled, (state, action) => {
        const task = state.tasks.find((t) => t.id === action.payload.id);
        if (task) {
          task.completed = action.payload.completed;
        }
      })
      .addCase(setTaskCompletion.fulfilled, (state, action) => {
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
