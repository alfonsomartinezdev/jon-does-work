import { useState, useEffect } from "react";
import type { Task } from "../global";
import { calculateSessionDuration, formatSessionTime } from "../App.utils";
import { Delete, Trash2 } from "lucide-react";

interface TaskModalProps {
  editingTask: Task | null;
  onSave: (taskData: { name: string; description: string }) => void;
  onCancel: () => void;
  handleDeleteSession: (taskId: string, sessionIndex: number) => void;
  handleDeleteTask: (taskId: string) => void;
  theme: (lightClass: string, darkClass: string) => string;
}

const TaskModal: React.FC<TaskModalProps> = ({
  editingTask,
  onSave,
  onCancel,
  handleDeleteSession,
  handleDeleteTask,
  theme,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (editingTask) {
      setName(editingTask.name);
      setDescription(editingTask.description);
    } else {
      setName("");
      setDescription("");
    }
  }, [editingTask]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave({
        name: name.trim(),
        description: description.trim(),
      });
    }
  };

  const handleCancel = () => {
    setName("");
    setDescription("");
    onCancel();
  };

  return (
    <div
      onMouseDown={handleCancel}
      className={
        theme("fixed inset-0 bg-white/50", "fixed inset-0 bg-black/50") +
        " flex items-center justify-center p-4 z-50"
      }
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className={
          theme("bg-white", "bg-gray-800") +
          " rounded-lg p-6 w-full max-w-md shadow-2xl"
        }
      >
        <div className="flex justify-between">
          <h2
            className={
              theme("text-gray-900", "text-white") +
              " text-xl font-semibold mb-4"
            }
          >
            {editingTask ? "Edit Task" : "Add New Task"}
          </h2>

          {editingTask && <Trash2 className="cursor-pointer text-red-500 hover:text-red-400" onClick={() => handleDeleteTask(editingTask.id)} />}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className={
                theme("text-gray-700", "text-gray-200") +
                " block text-sm font-medium mb-1"
              }
            >
              Task Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={
                theme(
                  "border-gray-300 text-gray-900 bg-white",
                  "border-gray-600 text-white bg-gray-700"
                ) +
                " w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              }
              placeholder="Enter task name"
              autoFocus
              required
            />
          </div>

          <div>
            <label
              className={
                theme("text-gray-700", "text-gray-200") +
                " block text-sm font-medium mb-1"
              }
            >
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={
                theme(
                  "border-gray-300 text-gray-900 bg-white",
                  "border-gray-600 text-white bg-gray-700"
                ) +
                " w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              }
              placeholder="Enter task description"
              rows={3}
            />
          </div>
          {editingTask && (
            <div>
              <label
                className={
                  theme("text-gray-900", "text-white") +
                  " block text-lg font-medium mb-1"
                }
              >
                Sessions
              </label>
              {
                <ul className="text-md">
                  {editingTask.sessions.map((session, index) => {
                    return (
                      <li key={index} className="flex items-center pb-2">
                        <span
                          className={theme("text-gray-900", "text-gray-200")}
                        >
                          {formatSessionTime(session.start)} -{" "}
                          {formatSessionTime(session.end)} (
                          {calculateSessionDuration(session.start, session.end)}
                          )
                        </span>
                        <Delete
                          className="ml-2 cursor-pointer text-gray-500 hover:text-red-500"
                          onClick={() =>
                            handleDeleteSession(editingTask.id, index)
                          }
                        />
                      </li>
                    );
                  })}
                </ul>
              }
            </div>
          )}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={handleCancel}
              className={
                theme(
                  "text-gray-600 hover:text-gray-800",
                  "text-gray-300 hover:text-gray-100"
                ) + " px-4 py-2 transition-colors"
              }
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingTask ? "Save Changes" : "Add Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
