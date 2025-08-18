import { Check, CircleCheckBig, Clock, Play, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import TaskModal from "../components/TaskModal";
import TaskCard from "../components/TaskCard";
import { TASK_STATUS, type Task, type TaskFormData } from "../global";

const WorkView: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const pendingTasks = useMemo(
    () => tasks.filter((task) => task.status === TASK_STATUS.PENDING),
    [tasks]
  );
  const inProgressTasks = tasks.filter(
    (task) => task.status === TASK_STATUS.IN_PROGRESS
  );

  const completedTasks = useMemo(
    () => tasks.filter((task) => task.status === TASK_STATUS.COMPLETED),
    [tasks]
  );
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
        id: crypto.randomUUID(),
        ...taskData,
        status: TASK_STATUS.PENDING,
        priority: "",
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

  useEffect(() => {
    const activeTask = tasks.filter((task) => task.isTimerActive);
    const interval = setInterval(() => {
      if (activeTask.length === 0) return;

      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task.isTimerActive && task.timerStartTime !== null) {
            return {
              ...task,

              activeTime: task.activeTime + 1,
            };
          }

          return task;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [tasks]);

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Jon Does Work</h1>
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
              <div className="text-center py-8 text-gray-500">
                <Clock size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg mb-2">Is this work/life balance?</p>
              </div>
            ) : (
              pendingTasks.map((task) => (
                <TaskCard
                  task={task}
                  setTasks={setTasks}
                />
              ))
            )}
          </div>
          {/* InProgress Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Play size={20} className="text-blue-600" />

              <h2 className="text-lg font-semibold text-gray-900">
                In Progress
              </h2>

              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm">
                {inProgressTasks.length}
              </span>
            </div>

            {inProgressTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Play size={48} className="mx-auto mb-4 text-gray-300" />

                <p>No tasks in progress.</p>
              </div>
            ) : (
              inProgressTasks.map((task) => (
                <TaskCard task={task} setTasks={setTasks} />
              ))
            )}
          </div>
          {/* Compelted Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <CircleCheckBig size={20} className="text-green-600" />

              <h2 className="text-lg font-semibold text-gray-900">Completed</h2>

              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm">
                {completedTasks.length}
              </span>
            </div>

            {completedTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Check size={48} className="mx-auto mb-4 text-gray-300" />

                <p>Completed tasks will appear here.</p>
              </div>
            ) : (
              completedTasks.map((task) => (
                <TaskCard task={task} setTasks={setTasks} />
              ))
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
