"use client";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "@/redux/store";
import {
  fetchNotes,
  editNote,
  selectNoteById,
  archiveNote,
} from "@/redux/slices/notesSlice";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";

export default function NotePage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const noteId = params.noteid as string;

  const note = useSelector((state: RootState) => selectNoteById(state, noteId));

  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteTags, setNoteTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  useEffect(() => {
    dispatch(fetchNotes());
  }, [dispatch]);

  useEffect(() => {
    if (note) {
      setNoteTitle(note.title);
      setNoteContent(note.content);
      setNoteTags(note.tags || []);
    }
  }, [note]);

  const handleSave = async () => {
    setIsSaving(true);
    await dispatch(
      editNote({
        id: noteId,
        title: noteTitle,
        content: noteContent,
        tags: noteTags,
      })
    );
    setIsSaving(false);
    router.push("/notes");
  };

  const handleArchive = async () => {
    setIsArchiving(true);
    await dispatch(archiveNote(noteId));
    setIsArchiving(false);
    router.push("/notes");
  };

  const handleAddTag = () => {
    if (newTag.trim() && !noteTags.includes(newTag.trim())) {
      setNoteTags([...noteTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setNoteTags(noteTags.filter((t) => t !== tag));
  };

  if (!note) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-gray-900">
        <div className="text-white text-xl">Loading note...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-screen bg-gray-900">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Edit Note</h2>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/notes")}
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
          >
            Back to Notes
          </motion.button>
        </div>

        <div className="bg-gray-800 rounded-md p-6 shadow-lg border border-gray-700">
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
                rows={16}
              />
            </div>

            <div>
              <label
                htmlFor="note-tags"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Tags
              </label>
              <div className="flex items-center space-x-2">
                <input
                  id="note-tags"
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                  className="border border-gray-700 p-3 rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700 text-white placeholder-gray-500"
                />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add
                </motion.button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {noteTags.map((tag) => (
                  <div
                    key={tag}
                    className="px-3 py-1 bg-gray-700 text-white rounded-md flex items-center space-x-2"
                  >
                    <span>{tag}</span>
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="text-red-500 hover:text-red-700"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleArchive}
                disabled={isArchiving}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-md transition-all shadow-lg"
              >
                {isArchiving ? "Archiving..." : "Archive Note"}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition-all shadow-lg"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </motion.button>
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          Created:{" "}
          {note.created_at
            ? new Date(note.created_at).toLocaleString()
            : "Unknown"}
        </div>
        <div className="mt-1 text-sm text-gray-500">
          Updated:{" "}
          {note.updated_at
            ? new Date(note.updated_at).toLocaleString()
            : "Unknown"}
        </div>
      </div>
    </div>
  );
}
