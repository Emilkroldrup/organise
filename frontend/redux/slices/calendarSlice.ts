import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { RootState } from "../store";

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  is_all_day: boolean;
  recurrence_rule?: string;
  attendees: string[];
  color?: string;
  created_at: string;
  updated_at: string;
}

interface CalendarState {
  events: CalendarEvent[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  selectedDate: string;
  view: "day" | "week" | "month";
}

interface ApiErrorResponse {
  message?: string;
}

const initialState: CalendarState = {
  events: [],
  status: "idle",
  error: null,
  selectedDate: new Date().toISOString(),
  view: "month"
};

// Async thunks for calendar operations
export const fetchEvents = createAsyncThunk(
  "calendar/fetchEvents",
  async ({ start, end }: { start: string; end: string }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/calendar?start=${start}&end=${end}`);
      return response.data;
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      const errorMessage = err.response?.data?.message ?? "Failed to fetch events";
      return rejectWithValue(errorMessage);
    }
  }
);

export const addEvent = createAsyncThunk(
  "calendar/addEvent",
  async (event: Omit<CalendarEvent, "id" | "created_at" | "updated_at">, { rejectWithValue }) => {
    try {
      const response = await axios.post("http://localhost:8080/api/calendar", event);
      return response.data;
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      const errorMessage = err.response?.data?.message ?? "Failed to add event";
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateEvent = createAsyncThunk(
  "calendar/updateEvent",
  async (event: Partial<CalendarEvent> & { id: string }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`http://localhost:8080/api/calendar/${event.id}`, event);
      return response.data;
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      const errorMessage = err.response?.data?.message ?? "Failed to update event";
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteEvent = createAsyncThunk(
  "calendar/deleteEvent",
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`http://localhost:8080/api/calendar/${id}`);
      return id;
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      const errorMessage = err.response?.data?.message ?? "Failed to delete event";
      return rejectWithValue(errorMessage);
    }
  }
);

const calendarSlice = createSlice({
  name: "calendar",
  initialState,
  reducers: {
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
    },
    setView: (state, action: PayloadAction<"day" | "week" | "month">) => {
      state.view = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch events
      .addCase(fetchEvents.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchEvents.fulfilled, (state, action: PayloadAction<CalendarEvent[]>) => {
        state.status = "succeeded";
        state.events = action.payload;
        state.error = null;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string ?? "Failed to fetch events";
      })
      
      // Add event
      .addCase(addEvent.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addEvent.fulfilled, (state, action: PayloadAction<CalendarEvent>) => {
        state.status = "succeeded";
        state.events.push(action.payload);
        state.error = null;
      })
      .addCase(addEvent.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string ?? "Failed to add event";
      })
      
      // Update event
      .addCase(updateEvent.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateEvent.fulfilled, (state, action: PayloadAction<CalendarEvent>) => {
        state.status = "succeeded";
        const index = state.events.findIndex(event => event.id === action.payload.id);
        if (index !== -1) {
          state.events[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string ?? "Failed to update event";
      })
      
      // Delete event
      .addCase(deleteEvent.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteEvent.fulfilled, (state, action: PayloadAction<string>) => {
        state.status = "succeeded";
        state.events = state.events.filter(event => event.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string ?? "Failed to delete event";
      });
  }
});

export const { setSelectedDate, setView, clearError } = calendarSlice.actions;

// Selectors
export const selectAllEvents = (state: RootState) => state.calendar.events;
export const selectCalendarStatus = (state: RootState) => state.calendar.status;
export const selectCalendarError = (state: RootState) => state.calendar.error;
export const selectSelectedDate = (state: RootState) => state.calendar.selectedDate;
export const selectView = (state: RootState) => state.calendar.view;

export default calendarSlice.reducer;