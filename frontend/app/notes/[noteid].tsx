"use client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "@/redux/store";
import {
  fetchNotes,
  editNote,
  selectNoteById,
} from "@/redux/slices/notesSlice";
import { motion } from "framer-motion";

export default function NotePage() {
  const router = useRouter();
  const { noteid } = router.query;
  const dispatch = useAppDispatch();
  const note = useSelector((state: RootState) =>
    selectNoteById(state, noteid as string)
  );
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");

  useEffect(() => {
    if (noteid) {
      dispatch(fetchNotes());
    }
  }, [dispatch, noteid]);

  useEffect(() => {
    if (note) {
      setNoteTitle(note.title);
      setNoteContent(note.content);
    }
  }, [note]);

  if (!note) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen">
      <div className="flex flex-col flex-grow p-6">
        <input
          type="text"
          value={noteTitle}
          onChange={(e) => setNoteTitle(e.target.value)}
          placeholder="Note Title..."
          className="border p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-black shadow-sm mb-4"
        />
        <textarea
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          placeholder="Note Content..."
          className="border p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-black shadow-sm mb-4 flex-grow"
        />
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            dispatch(
              editNote({
                id: note.id,
                title: noteTitle,
                content: noteContent,
              })
            );
            router.push("/notes");
          }}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-transform shadow-lg"
        >
          Save
        </motion.button>
      </div>
    </div>
  );
}
