import { useState, useEffect, useCallback } from "react";
import type { Activity, Task } from "../global";
import { calculateSessionDuration, formatSessionTime } from "../App.utils";
import { Delete, Trash2, Edit2, Save, X, Plus } from "lucide-react";

interface TaskModalProps {
  editingTask: Task | null;
  onSave: (taskData: {
    name: string;
    description: string;
    activities: Activity[];
  }) => void;
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
  const [activities, setActivities] = useState<Activity[]>([]);
  const [newActivity, setNewActivity] = useState("");
  const [editingActivityId, setEditingActivityId] = useState<string | null>(
    null
  );
  const [editingActivityText, setEditingActivityText] = useState("");
  const [editingActivityTimestamp, setEditingActivityTimestamp] = useState("");

  useEffect(() => {
    if (editingTask) {
      setName(editingTask.name);
      setDescription(editingTask.description);
      setActivities(editingTask.activities || []);
    } else {
      setName("");
      setDescription("");
      setActivities([]);
    }
  }, [editingTask]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCancel();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [handleCancel]);

  const formatActivityTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const addActivity = () => {
    if (!newActivity.trim()) return;

    const activity: Activity = {
      id: Date.now().toString(),
      text: newActivity.trim(),
      timestamp: new Date().toISOString(),
    };

    setActivities((prev) => [activity, ...prev]);
    setNewActivity("");
  };

  const startEditingActivity = (activity: Activity) => {
    setEditingActivityId(activity.id);
    setEditingActivityText(activity.text);

    const date = new Date(activity.timestamp);
    const localDateTime = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    )
      .toISOString()
      .slice(0, 16);
    setEditingActivityTimestamp(localDateTime);
  };

  const saveActivityEdit = () => {
    if (!editingActivityText.trim()) return;

    setActivities((prev) =>
      prev.map((activity) =>
        activity.id === editingActivityId
          ? {
              ...activity,
              text: editingActivityText.trim(),
              timestamp: new Date(editingActivityTimestamp).toISOString(),
            }
          : activity
      )
    );

    setEditingActivityId(null);
    setEditingActivityText("");
    setEditingActivityTimestamp("");
  };

  const cancelActivityEdit = () => {
    setEditingActivityId(null);
    setEditingActivityText("");
    setEditingActivityTimestamp("");
  };

  const deleteActivity = (activityId: string) => {
    setActivities((prev) =>
      prev.filter((activity) => activity.id !== activityId)
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") {
      e.preventDefault();
      action();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingActivityId) {
      return;
    }
    if (name.trim()) {
      let finalActivities = activities;

      if (newActivity.trim()) {
        const activity: Activity = {
          id: Date.now().toString(),
          text: newActivity.trim(),
          timestamp: new Date().toISOString(),
        };
        finalActivities = [activity, ...activities];
      }

      onSave({
        name: name.trim(),
        description: description.trim(),
        activities: finalActivities,
      });
    }
  };

  const handleCancel = useCallback(() => {
    setName("");
    setDescription("");
    setActivities([]);
    setNewActivity("");
    setEditingActivityId(null);
    setEditingActivityText("");
    setEditingActivityTimestamp("");
    onCancel();
  }, [onCancel]);

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
          " rounded-lg p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
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

          {editingTask && (
            <Trash2
              className="cursor-pointer text-red-500 hover:text-red-400"
              onClick={() => handleDeleteTask(editingTask.id)}
            />
          )}
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
            <>
              <div>
                <label
                  className={
                    theme("text-gray-700", "text-gray-200") +
                    " block text-sm font-medium mb-1"
                  }
                >
                  Activity Log
                </label>

                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newActivity}
                    onChange={(e) => setNewActivity(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, addActivity)}
                    className={
                      theme(
                        "border-gray-300 text-gray-900 bg-white",
                        "border-gray-600 text-white bg-gray-700"
                      ) +
                      " flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    }
                    placeholder="Add activity update..."
                  />
                  <button
                    type="button"
                    onClick={addActivity}
                    disabled={!newActivity.trim()}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <Plus size={16} />
                    Add
                  </button>
                </div>

                {activities.length > 0 && (
                  <div
                    className={
                      theme("bg-gray-50", "bg-gray-700") +
                      " rounded-lg p-3 max-h-48 overflow-y-auto"
                    }
                  >
                    <ul className="space-y-2">
                      {activities.map((activity) => (
                        <li
                          key={activity.id}
                          className="flex items-start gap-2 group"
                        >
                          <div className="flex-1 min-w-0">
                            {editingActivityId === activity.id ? (
                              <div className="flex flex-col gap-2">
                                <input
                                  type="text"
                                  value={editingActivityText}
                                  onChange={(e) =>
                                    setEditingActivityText(e.target.value)
                                  }
                                  className={
                                    theme(
                                      "border-gray-300 text-gray-900 bg-white",
                                      "border-gray-600 text-white bg-gray-600"
                                    ) +
                                    " w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  }
                                  placeholder="Activity text"
                                  autoFocus
                                />
                                <input
                                  type="datetime-local"
                                  value={editingActivityTimestamp}
                                  onChange={(e) =>
                                    setEditingActivityTimestamp(e.target.value)
                                  }
                                  className={
                                    theme(
                                      "border-gray-300 text-gray-900 bg-white",
                                      "border-gray-600 text-white bg-gray-600"
                                    ) +
                                    " w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  }
                                />
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={saveActivityEdit}
                                    className="text-green-600 hover:text-green-500"
                                  >
                                    <Save size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={cancelActivityEdit}
                                    className="text-gray-500 hover:text-gray-400"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <p
                                  className={
                                    theme("text-gray-900", "text-gray-100") +
                                    " text-sm break-words"
                                  }
                                >
                                  {activity.text}
                                </p>
                                <p
                                  className={
                                    theme("text-gray-500", "text-gray-400") +
                                    " text-xs"
                                  }
                                >
                                  {formatActivityTime(activity.timestamp)}
                                </p>
                              </div>
                            )}
                          </div>

                          {editingActivityId !== activity.id && (
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => startEditingActivity(activity)}
                                className="text-gray-500 hover:text-blue-500"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteActivity(activity.id)}
                                className="text-gray-500 hover:text-red-500"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
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
                            {calculateSessionDuration(
                              session.start,
                              session.end
                            )}
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
            </>
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
