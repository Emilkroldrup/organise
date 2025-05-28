"use client";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "@/redux/store";
import {
  fetchTasks,
  addTask,
  editTask,
  deleteTask,
  setTaskCompletion,
} from "@/redux/slices/tasksSlice";
import { motion, AnimatePresence } from "framer-motion";

const getBorderColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "border-red-500";
    case "medium":
      return "border-yellow-500";
    case "low":
    default:
      return "border-green-500";
  }
};

export default function TasksPage() {
  const dispatch = useAppDispatch();
  const tasks = useSelector((state: RootState) => state.tasks.tasks);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskPriority, setTaskPriority] = useState("low");
  const [taskDescription, setTaskDescription] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editedTaskTitle, setEditedTaskTitle] = useState("");
  const [editedTaskPriority, setEditedTaskPriority] = useState("low");
  const [editedTaskDescription, setEditedTaskDescription] = useState("");

  useEffect(() => {
    dispatch(fetchTasks());
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
            className="border p-2 rounded-lg w-3/4 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black shadow-sm"
          />
          <select
            value={taskPriority}
            onChange={(e) => setTaskPriority(e.target.value)}
            className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-black shadow-sm"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <motion.button
            onClick={async () => {
              if (taskTitle.trim()) {
                await dispatch(
                  addTask({
                    title: taskTitle,
                    priority: taskPriority,
                    description: taskDescription,
                  })
                );
                await dispatch(fetchTasks());
                setTaskTitle("");
                setTaskPriority("low");
                setTaskDescription("");
              }
            }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-transform shadow-lg"
          >
            Add Task
          </motion.button>
        </div>
        <textarea
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          placeholder="Task Description..."
          className="border p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-black shadow-sm mb-2"
        />

        {/* Task Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <AnimatePresence>
            {tasks.map(
              (task) =>
                task.id && (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: -100, scale: 0.5 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
                    className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 ${getBorderColor(
                      task.priority
                    )} border-2`}
                  >
                    <div className="flex justify-between items-center mb-4">
                      {editingTaskId === task.id ? (
                        <div className="w-full">
                          <input
                            type="text"
                            value={editedTaskTitle}
                            onChange={(e) => setEditedTaskTitle(e.target.value)}
                            className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-black dark:text-white bg-white dark:bg-gray-800 mb-2 shadow-sm"
                          />
                          <select
                            value={editedTaskPriority}
                            onChange={(e) =>
                              setEditedTaskPriority(e.target.value)
                            }
                            className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-black dark:text-white bg-white dark:bg-gray-800 mb-2 shadow-sm"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                          <textarea
                            value={editedTaskDescription}
                            onChange={(e) =>
                              setEditedTaskDescription(e.target.value)
                            }
                            className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-black dark:text-white bg-white dark:bg-gray-800 mb-2 shadow-sm"
                          />
                        </div>
                      ) : (
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {task.title}
                        </h3>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Added: {new Date(task.createdAt).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      {task.description}
                    </p>
                    <div className="flex justify-between items-center">
                      {task.id && (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => dispatch(setTaskCompletion(task.id))}
                          className={`px-4 py-2 rounded-lg transition-colors shadow-sm ${
                            task.completed
                              ? "bg-green-500 text-white hover:bg-green-600"
                              : "bg-gray-300 text-black hover:bg-gray-400 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                          }`}
                        >
                          {task.completed ? "Done" : "Complete"}
                        </motion.button>
                      )}
                      {editingTaskId === task.id ? (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            dispatch(
                              editTask({
                                id: task.id,
                                newTitle: editedTaskTitle,
                                newPriority: editedTaskPriority,
                                newDescription: editedTaskDescription,
                              })
                            );
                            setEditingTaskId(null);
                            setEditedTaskDescription("");
                          }}
                          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                        >
                          Save
                        </motion.button>
                      ) : (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setEditingTaskId(task.id);
                            setEditedTaskTitle(task.title);
                            setEditedTaskPriority(task.priority);
                            setEditedTaskDescription(task.description);
                          }}
                          className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors shadow-sm"
                        >
                          Edit
                        </motion.button>
                      )}
                      {task.id && (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => dispatch(deleteTask(task.id))}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          ✕
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                )
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
