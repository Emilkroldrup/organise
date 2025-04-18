import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import tasksReducer from "./slices/tasksSlice";
import notesReducer from "./slices/notesSlice";
import calendarReducer from "./slices/calendarSlice";

export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    notes: notesReducer,
    calendar: calendarReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
