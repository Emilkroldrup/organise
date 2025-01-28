"use client";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "@/redux/store";
import {
  addTask,
  toggleTask,
  editTask,
  deleteTask,
} from "@/redux/slices/tasksSlice";
import { motion, AnimatePresence } from "framer-motion";

export default function TasksPage() {
  const dispatch = useAppDispatch();
  const tasks = useSelector((state: RootState) => state.tasks.tasks);
  const [taskTitle, setTaskTitle] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editedTaskTitle, setEditedTaskTitle] = useState("");

  useEffect(() => {
    const storedTasks = localStorage.getItem("tasks");
    if (storedTasks) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      JSON.parse(storedTasks).forEach((task: any) =>
        dispatch(addTask({ title: task.title }))
      );
    }
  }, [dispatch]);

  return (
    <div className="flex h-screen">
      <div className="flex flex-col flex-grow p-6">
        {/* Task Input */}
        <div className="mb-6 flex justify-between items-center">
          <input
            type="text"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="New Task..."
            className="border p-2 rounded-lg w-3/4 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <motion.button
            onClick={() => {
              if (taskTitle.trim()) {
                dispatch(addTask({ title: taskTitle }));
                setTaskTitle("");
              }
            }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-transform"
          >
            Add Task
          </motion.button>
        </div>

        {/* Task Grid */}
        <div className="grid grid-cols-3 gap-6">
          <AnimatePresence>
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: -100, scale: 0.5 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
                className="bg-white p-4 rounded-lg shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1"
              >
                <div className="flex justify-between items-center">
                  {editingTaskId === task.id ? (
                    <input
                      type="text"
                      value={editedTaskTitle}
                      onChange={(e) => setEditedTaskTitle(e.target.value)}
                      className="border p-2 rounded w-full"
                    />
                  ) : (
                    <h3 className="text-lg font-semibold">{task.title}</h3>
                  )}
                </div>

                {/* Task Metadata */}
                <p className="text-sm text-gray-500">
                  Added: {new Date(task.createdAt).toLocaleString()}
                </p>

                {/* Actions */}
                <div className="flex justify-between mt-4">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => dispatch(toggleTask(task.id))}
                    className={`px-4 py-2 rounded ${
                      task.completed
                        ? "bg-green-500 text-white"
                        : "bg-gray-300 text-black"
                    }`}
                  >
                    {task.completed ? "Done" : "Complete"}
                  </motion.button>

                  {editingTaskId === task.id ? (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        dispatch(
                          editTask({ id: task.id, newTitle: editedTaskTitle })
                        );
                        setEditingTaskId(null);
                      }}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Save
                    </motion.button>
                  ) : (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setEditingTaskId(task.id);
                        setEditedTaskTitle(task.title);
                      }}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
                    >
                      Edit
                    </motion.button>
                  )}

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => dispatch(deleteTask(task.id))}
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
