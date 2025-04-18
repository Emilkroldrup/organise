import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../store";

interface Note {
  id: string;
  title: string;
  content: string;
  created_at?: string;
  updated_at?: string;
  tags?: string[];
  is_archived?: boolean;
  user_id?: string;
}

interface NotesState {
  notes: Note[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: NotesState = {
  notes: [],
  status: "idle",
  error: null,
};

export const fetchNotes = createAsyncThunk("notes/fetchNotes", async () => {
  const response = await fetch("/api/notes");
  return (await response.json()) as Note[];
});

export const addNote = createAsyncThunk(
  "notes/addNote",
  async (newNote: Omit<Note, "id">) => {
    const response = await fetch("/api/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newNote),
    });
    return (await response.json()) as Note;
  }
);

export const editNote = createAsyncThunk(
  "notes/editNote",
  async (updatedNote: Note) => {
    const response = await fetch(`/api/notes/${updatedNote.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedNote),
    });
    return (await response.json()) as Note;
  }
);

export const deleteNote = createAsyncThunk(
  "notes/deleteNote",
  async (noteId: string) => {
    await fetch(`/api/notes/${noteId}`, {
      method: "DELETE",
    });
    return noteId;
  }
);

export const archiveNote = createAsyncThunk(
  "notes/archiveNote",
  async (noteId: string) => {
    const response = await fetch(`/api/notes/${noteId}/archive`, {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to archive note");
    }
    return noteId;
  }
);

const notesSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotes.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchNotes.fulfilled, (state, action: PayloadAction<Note[]>) => {
        state.status = "succeeded";
        state.notes = action.payload;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch notes";
      })
      .addCase(addNote.fulfilled, (state, action: PayloadAction<Note>) => {
        state.notes.push(action.payload);
      })
      .addCase(editNote.fulfilled, (state, action: PayloadAction<Note>) => {
        const index = state.notes.findIndex((note) => note.id === action.payload.id);
        if (index !== -1) {
          state.notes[index] = action.payload;
        }
      })
      .addCase(deleteNote.fulfilled, (state, action: PayloadAction<string>) => {
        state.notes = state.notes.filter((note) => note.id !== action.payload);
      })
      .addCase(archiveNote.fulfilled, (state, action: PayloadAction<string>) => {
        const index = state.notes.findIndex((note) => note.id === action.payload);
        if (index !== -1) {
          state.notes[index].is_archived = true;
        }
      });
  },
});

export default notesSlice.reducer;
export const selectAllNotes = (state: RootState) => state.notes.notes;
export const selectNotesStatus = (state: RootState) => state.notes.status;
export const selectNotesError = (state: RootState) => state.notes.error;
export const selectNoteById = (state: RootState, noteId: string) =>
  state.notes.notes.find((note) => note.id === noteId);
export const selectActiveNotes = (state: RootState) =>
  state.notes.notes.filter((note) => !note.is_archived);
export const selectArchivedNotes = (state: RootState) =>
  state.notes.notes.filter((note) => note.is_archived);
export const selectNotesByTag = (state: RootState, tag: string) =>
  state.notes.notes.filter((note) => note.tags && note.tags.includes(tag));
