"use client";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "@/redux/store";
import {
  fetchNotes,
  addNote,
  editNote,
  deleteNote,
} from "@/redux/slices/notesSlice";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function NotesPage() {
  const dispatch = useAppDispatch();
  const notes = useSelector((state: RootState) => state.notes.notes);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editedNoteTitle, setEditedNoteTitle] = useState("");
  const [editedNoteContent, setEditedNoteContent] = useState("");

  useEffect(() => {
    dispatch(fetchNotes());
  }, [dispatch]);

  return (
    <div className="flex h-screen">
      <div className="flex flex-col flex-grow p-6">
        {/* Note Input */}
        <div className="mb-6 flex justify-between items-center">
          <input
            type="text"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            placeholder="New Note Title..."
            className="border p-2 rounded-lg w-3/4 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black shadow-sm"
          />
          <motion.button
            onClick={async () => {
              if (noteTitle.trim()) {
                await dispatch(
                  addNote({
                    title: noteTitle,
                    content: noteContent,
                  })
                );
                await dispatch(fetchNotes());
                setNoteTitle("");
                setNoteContent("");
              }
            }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-transform shadow-lg"
          >
            Add Note
          </motion.button>
        </div>
        <textarea
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          placeholder="Note Content..."
          className="border p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-black shadow-sm mb-2"
        />

        {/* Notes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <AnimatePresence>
            {notes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: -100, scale: 0.5 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 border-2"
              >
                <Link href={`/notes/${note.id}`}>
                  <div className="cursor-pointer">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {note.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      {note.content}
                    </p>
                  </div>
                </Link>
                <div className="flex justify-between items-center">
                  {editingNoteId === note.id ? (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        dispatch(
                          editNote({
                            id: note.id,
                            title: editedNoteTitle,
                            content: editedNoteContent,
                          })
                        );
                        setEditingNoteId(null);
                        setEditedNoteContent("");
                      }}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                    >
                      Save
                    </motion.button>
                  ) : (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setEditingNoteId(note.id);
                        setEditedNoteTitle(note.title);
                        setEditedNoteContent(note.content);
                      }}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors shadow-sm"
                    >
                      Edit
                    </motion.button>
                  )}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => dispatch(deleteNote(note.id))}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    ✕
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
