"use client";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "@/redux/store";
import { fetchNotes, addNote, deleteNote } from "@/redux/slices/notesSlice";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function NotesPage() {
  const dispatch = useAppDispatch();
  const notes = useSelector((state: RootState) => state.notes.notes);
  const status = useSelector((state: RootState) => state.notes.status);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [filter, setFilter] = useState("all"); // all, active, archived
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

  useEffect(() => {
    dispatch(fetchNotes());
  }, [dispatch]);

  const filteredNotes = notes.filter((note) => {
    // First filter by archive status
    if (filter === "active" && note.is_archived) return false;
    if (filter === "archived" && !note.is_archived) return false;

    // Then filter by search term
    const matchesSearch =
      searchTerm === "" ||
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase());

    // Finally filter by tag if one is selected
    const matchesTag =
      selectedTag === "" || (note.tags && note.tags.includes(selectedTag));

    return matchesSearch && matchesTag;
  });

  // Extract all tags from notes for the filter dropdown
  const allTags = Array.from(
    new Set(notes.flatMap((note) => note.tags || []))
  ).sort();

  return (
    <div className="flex flex-col w-full h-screen bg-gray-900 overflow-y-auto">
      {/* Note Input Panel */}
      <div className="p-6 pb-4">
        <h2 className="text-xl font-bold mb-6 text-white">Create New Note</h2>
        <div className="bg-gray-800 rounded-md p-5 shadow-lg border border-gray-700">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="note-title"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Note Title
              </label>
              <input
                id="note-title"
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Enter note title..."
                className="border border-gray-700 p-3 rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700 text-white placeholder-gray-500"
              />
            </div>

            <div>
              <label
                htmlFor="note-content"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Content
              </label>
              <textarea
                id="note-content"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write your note here..."
                className="border border-gray-700 p-3 rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700 text-white resize-none placeholder-gray-500"
                rows={4}
              />
            </div>

            <div className="flex justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={async () => {
                  if (noteTitle.trim()) {
                    await dispatch(
                      addNote({
                        title: noteTitle,
                        content: noteContent,
                        tags: [],
                        is_archived: false,
                      })
                    );
                    setNoteTitle("");
                    setNoteContent("");
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition-all shadow-lg"
              >
                Add Note
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-2">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <label htmlFor="status-filter" className="text-sm text-gray-300">
              Status:
            </label>
            <select
              id="status-filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Notes</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label htmlFor="tag-filter" className="text-sm text-gray-300">
              Tag:
            </label>
            <select
              id="tag-filter"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Tags</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-2 text-gray-400 text-sm">
          {filteredNotes.length} {filteredNotes.length === 1 ? "note" : "notes"}{" "}
          found
        </div>
      </div>

      {/* Notes Grid */}
      <div className="flex-1 p-6 pt-0">
        {status === "loading" && (
          <div className="flex justify-center items-center h-40">
            <div className="text-white">Loading notes...</div>
          </div>
        )}

        {status === "failed" && (
          <div className="flex justify-center items-center h-40">
            <div className="text-red-400">
              Failed to load notes. Please try again.
            </div>
          </div>
        )}

        {status === "succeeded" && filteredNotes.length === 0 && (
          <div className="flex justify-center items-center h-40">
            <div className="text-gray-400">
              No notes found matching your filters.
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {filteredNotes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`bg-gray-800 rounded-md shadow-lg border ${
                  note.is_archived ? "border-yellow-700" : "border-gray-700"
                } overflow-hidden h-full`}
              >
                <Link href={`/notes/${note.id}`} className="block h-full">
                  <div className="cursor-pointer p-5 h-full flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-lg text-white">
                        {note.title}
                        {note.is_archived && (
                          <span className="ml-2 text-xs bg-yellow-700 text-yellow-200 px-2 py-0.5 rounded">
                            Archived
                          </span>
                        )}
                      </h4>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          dispatch(deleteNote(note.id));
                        }}
                        className="text-gray-400 hover:text-red-400 transition-colors ml-2"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </motion.button>
                    </div>

                    <p className="text-sm text-gray-400 flex-grow mb-4 line-clamp-3">
                      {note.content}
                    </p>

                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {note.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-auto">
                      <div className="text-xs text-gray-500">
                        {note.updated_at
                          ? new Date(note.updated_at).toLocaleDateString()
                          : note.created_at
                          ? new Date(note.created_at).toLocaleDateString()
                          : "No date"}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
