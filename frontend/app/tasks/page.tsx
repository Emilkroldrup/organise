"use client";
/* cSpell:ignore pangea */
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "@/redux/store";
import {
  fetchTasks,
  addTask,
  editTask,
  deleteTask,
  reorderTasks,
  toggleTask,
} from "@/redux/slices/tasksSlice";
import { motion, AnimatePresence } from "framer-motion";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

// Define task interface
interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: string;
  created_at: string; // Changed from createdAt to created_at to match Redux store
  updated_at?: string;
}

// Interface for creating a new task (without id and created_at which are handled by the backend)
interface CreateTaskInput {
  title: string;
  description: string;
  priority: string;
}

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

const getBackgroundColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-900/20";
    case "medium":
      return "bg-yellow-900/20";
    case "low":
    default:
      return "bg-green-900/20";
  }
};

const getColumnTitle = (priority: string) => {
  switch (priority) {
    case "high":
      return "High Priority";
    case "medium":
      return "Medium Priority";
    case "low":
      return "Low Priority";
    default:
      return "Tasks";
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

  // Filter states
  const [showCompleted, setShowCompleted] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  // Filter tasks based on showCompleted and searchTerm
  const filteredTasks = tasks.filter((task) => {
    // Filter by completion status
    if (!showCompleted && task.completed) {
      return false;
    }

    // Filter by search term in title or description
    if (
      searchTerm &&
      !task.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !task.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  const prioritizedTasks = {
    high: filteredTasks.filter((task) => task.priority === "high"),
    medium: filteredTasks.filter((task) => task.priority === "medium"),
    low: filteredTasks.filter((task) => task.priority === "low"),
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;

    // If changing columns (priorities)
    if (source.droppableId !== destination.droppableId) {
      const sourcePriority = source.droppableId;
      const destPriority = destination.droppableId;

      const sourceItems = [
        ...prioritizedTasks[sourcePriority as keyof typeof prioritizedTasks],
      ];

      const [movedItem] = sourceItems.splice(source.index, 1);

      // Update the task priority - preserve all existing properties
      const updatedItem: Task = {
        ...movedItem,
        priority: destPriority,
      };

      // Update store
      dispatch(
        editTask({
          id: movedItem.id,
          newTitle: movedItem.title,
          newPriority: destPriority,
          newDescription: movedItem.description,
        })
      );

      const allTasks = tasks.map((t) =>
        t.id === movedItem.id ? updatedItem : t
      );

      dispatch(reorderTasks(allTasks));
    } else {
      // Reordering within the same column
      const priority = source.droppableId;
      const items = [
        ...prioritizedTasks[priority as keyof typeof prioritizedTasks],
      ];
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);

      const allTasks = [...tasks];

      // Replace tasks of this priority with the reordered items
      const otherTasks = allTasks.filter((t) => t.priority !== priority);
      const newTasks = [...otherTasks, ...items];

      dispatch(reorderTasks(newTasks));
    }
  };

  // Task rendering function to reduce nesting depth
  const renderTask = (task: Task, index: number) => (
    <Draggable key={task.id} draggableId={task.id} index={index}>
      {(provided, snapshot) => {
        // Convert the provided props to compatible format for motion.div
        const dragProps = {
          ...provided.draggableProps,
          ...provided.dragHandleProps,
          ref: provided.innerRef,
        };

        return (
          <div
            {...dragProps}
            className={`mb-4 rounded-md shadow-md border border-gray-700 overflow-hidden
              ${snapshot.isDragging ? "shadow-xl ring-1 ring-blue-500" : ""}
              ${
                task.completed ? "opacity-70 bg-gray-800/40" : "bg-gray-800/60"
              }`}
          >
            {editingTaskId === task.id ? (
              <div className="p-4">
                <input
                  type="text"
                  value={editedTaskTitle}
                  onChange={(e) => setEditedTaskTitle(e.target.value)}
                  className="border border-gray-700 p-2 rounded w-full focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700 text-white mb-3"
                />

                <textarea
                  value={editedTaskDescription}
                  onChange={(e) => setEditedTaskDescription(e.target.value)}
                  className="border border-gray-700 p-2 rounded w-full focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700 text-white mb-3"
                  rows={3}
                />

                <select
                  value={editedTaskPriority}
                  onChange={(e) => setEditedTaskPriority(e.target.value)}
                  className="border border-gray-700 p-2 rounded w-full focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700 text-white mb-3"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>

                <div className="flex justify-end gap-2 mt-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setEditingTaskId(null)}
                    className="px-3 py-1 bg-gray-600 text-gray-300 rounded-md"
                  >
                    Cancel
                  </motion.button>
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
                    }}
                    className="px-4 py-1 bg-blue-600 text-white rounded-md"
                  >
                    Save
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <h4
                    className={`font-medium text-lg ${
                      task.completed
                        ? "line-through text-gray-400"
                        : "text-white"
                    }`}
                  >
                    {task.title}
                  </h4>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => dispatch(deleteTask(task.id))}
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

                {task.description && (
                  <p
                    className={`text-sm mb-4 ${
                      task.completed ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    {task.description}
                  </p>
                )}

                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    {new Date(task.created_at).toLocaleDateString()}
                  </div>

                  <div className="flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setEditingTaskId(task.id);
                        setEditedTaskTitle(task.title);
                        setEditedTaskPriority(task.priority);
                        setEditedTaskDescription(task.description);
                      }}
                      className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => dispatch(toggleTask(task.id))}
                      className={`p-2 rounded-md ${
                        task.completed
                          ? "bg-green-900/30 hover:bg-green-900/50 text-green-400"
                          : "bg-blue-900/30 hover:bg-blue-900/50 text-blue-400"
                      }`}
                    >
                      {task.completed ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }}
    </Draggable>
  );

  return (
    <div className="flex flex-col w-full h-screen bg-gray-900 overflow-y-auto">
      {/* Task Input Panel */}
      <div className="p-6 pb-4">
        <h2 className="text-xl font-bold mb-6 text-white">Create New Task</h2>
        <div className="bg-gray-800 rounded-md p-5 shadow-lg border border-gray-700">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="task-title"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Task Title
              </label>
              <input
                id="task-title"
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="border border-gray-700 p-3 rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700 text-white placeholder-gray-500"
              />
            </div>

            <div>
              <label
                htmlFor="task-description"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Description
              </label>
              <textarea
                id="task-description"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Add details about this task..."
                className="border border-gray-700 p-3 rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700 text-white resize-none placeholder-gray-500"
                rows={3}
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="w-full sm:w-1/2">
                <label
                  htmlFor="task-priority"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Priority
                </label>
                <select
                  id="task-priority"
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value)}
                  className="border border-gray-700 p-3 rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700 text-white appearance-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={async () => {
                  if (taskTitle.trim()) {
                    await dispatch(
                      addTask({
                        title: taskTitle,
                        priority: taskPriority,
                        description: taskDescription,
                      } as CreateTaskInput)
                    );
                    await dispatch(fetchTasks());
                    setTaskTitle("");
                    setTaskPriority("low");
                    setTaskDescription("");
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition-all shadow-lg flex-shrink-0 sm:self-end mt-4 sm:mt-7 w-full sm:w-auto"
              >
                Add Task
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Options */}
      <div className="p-6 pb-4">
        <div className="bg-gray-800 rounded-md p-5 shadow-lg border border-gray-700">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="search-term"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Search Tasks
              </label>
              <input
                id="search-term"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title or description..."
                className="border border-gray-700 p-3 rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700 text-white placeholder-gray-500"
              />
            </div>

            <div className="flex items-center">
              <input
                id="show-completed"
                type="checkbox"
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <label
                htmlFor="show-completed"
                className="ml-2 text-sm font-medium text-gray-300"
              >
                Show Completed Tasks
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Task Columns */}
      <div className="flex-1 p-6 pt-0">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {["high", "medium", "low"].map((priority) => (
              <div
                key={priority}
                className={`bg-gray-800 rounded-md shadow-lg overflow-hidden ${getBorderColor(
                  priority
                )} border-t-2 h-full`}
              >
                <div className={`p-4 ${getBackgroundColor(priority)}`}>
                  <h3 className="text-lg font-bold text-white">
                    {getColumnTitle(priority)}
                  </h3>
                </div>

                <Droppable droppableId={priority}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[200px] p-4 ${
                        snapshot.isDraggingOver ? "bg-gray-700/50" : ""
                      } h-full`}
                    >
                      <AnimatePresence>
                        {prioritizedTasks[
                          priority as keyof typeof prioritizedTasks
                        ].map((task, index) => renderTask(task, index))}
                      </AnimatePresence>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
