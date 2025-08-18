import { Clock, Plus } from "lucide-react";
import { useState } from "react";
import TaskModal from "../components/TaskModal";

export interface Task {
  id: number;
  name: string;
  description: string;
  status: TaskStatus;
  assignedDate: string;
  activeTime: number;
  sessions: Session[];
  isTimerActive: boolean;
  timerStartTime: number | null;
}

export interface TaskFormData {
  name: string;
  description: string;
}

export type TaskStatus = "pending" | "in-progress" | "completed";

// from when you start the timer on a task to when you stop it
interface Session {
  start: number;
  end: number;
}

const WorkView: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      name: "Some random task",
      description: "some description here",
      status: "pending",
      assignedDate: "01/01/2001",
      activeTime: 0,
      sessions: [],
      isTimerActive: false,
      timerStartTime: null,
    },
  ]);
  const pendingTasks = tasks.filter((task) => task.status === "pending");

  const [showTaskModal, setShowTaskModal] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const openAddTaskModal = (): void => {
    setEditingTask(null);
    setShowTaskModal(true);
  };

  const handleSaveTask = (taskData: TaskFormData): void => {
    if (editingTask) {
      // Edit existing task
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === editingTask.id ? { ...task, ...taskData } : task
        )
      );
    } else {
      const newTask: Task = {
        id: Date.now(),
        ...taskData,
        status: "pending" as TaskStatus,
        assignedDate: new Date().toISOString().split("T")[0],
        activeTime: 0,
        sessions: [],
        isTimerActive: false,
        timerStartTime: null,
      };
      setTasks((prev) => [...prev, newTask]);
    }

    setShowTaskModal(false);
    setEditingTask(null);
  };

  const handleCancelModal = (): void => {
    setShowTaskModal(false);
    setEditingTask(null);
  };

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Task Tracker</h1>
            <p className="text-gray-600 mt-1">
              Track your active time and work sessions
            </p>
          </div>
          <button
            onClick={openAddTaskModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Add Task</span>
          </button>
        </div>

        <div className="space-y-6">
          {/* Pending Section */}

          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Clock size={20} className="text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Pending</h2>
              <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm">
                {pendingTasks.length}
              </span>
            </div>
            {pendingTasks.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Clock size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg mb-2">Add your first task</p>
                <button
                  onClick={openAddTaskModal}
                  className="text-blue-600 hover:text-blue-700 flex items-center space-x-1 mx-auto"
                >
                  <Plus size={16} />
                  <span>Add your first task</span>
                </button>
              </div>
            ) : (
              pendingTasks.map((task) => <div>{task.id}</div>)
            )}
          </div>
        </div>
      </div>
      {showTaskModal && (
        <TaskModal
          editingTask={editingTask}
          onSave={handleSaveTask}
          onCancel={handleCancelModal}
        />
      )}
    </>
  );
};

export default WorkView;
