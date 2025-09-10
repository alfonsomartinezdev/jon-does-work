import { Check, CircleCheckBig, Clock, Play, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import TaskModal from "../components/TaskModal";
import TaskCard from "../components/TaskCard";
import { TASK_STATUS, type Task, type TaskFormData } from "../global";
import TaskSection from "../components/TaskSection";

interface WorkViewProps {
  theme: (lightClass: string, darkClass: string) => string;
}

const WorkView: React.FC<WorkViewProps> = ({ theme }) => {
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

  const openEditTaskModal = (task: Task): void => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleSaveTask = (taskData: TaskFormData): void => {
    if (editingTask) {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === editingTask.id ? { ...task, ...taskData } : task
        )
      );
    } else {
      const newTask: Task = {
        id: Date.now().toString(),
        ...taskData,
        status: TASK_STATUS.PENDING,
        priority: "",
        assignedDate: new Date().toISOString().split("T")[0],
        activeTime: 0,
        baseActiveTime: 0,
        currentSessionTime: 0,
        sessions: [],
        isTimerActive: false,
        timerStartTime: null,
      };
      setTasks((prev) => [...prev, newTask]);
    }

    setShowTaskModal(false);
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId: string): void => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));

    // If we're currently editing the task that's being deleted, close the modal
    if (editingTask && editingTask.id === taskId) {
      setShowTaskModal(false);
      setEditingTask(null);
    }
  };

  const handleDeleteSession = (taskId: string, sessionIndex: number): void => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          const sessionToDelete = task.sessions[sessionIndex];
          const sessionDuration = Math.floor(
            (sessionToDelete.end - sessionToDelete.start) / 1000
          );

          const updatedTask = {
            ...task,
            sessions: task.sessions.filter(
              (_, index) => index !== sessionIndex
            ),
            activeTime: task.activeTime - sessionDuration,
            baseActiveTime: task.baseActiveTime - sessionDuration,
          };

          // Update editingTask if this is the task being edited
          if (editingTask && editingTask.id === taskId) {
            setEditingTask(updatedTask);
          }

          return updatedTask;
        }
        return task;
      })
    );
  };

  const handleCancelModal = (): void => {
    setShowTaskModal(false);
    setEditingTask(null);
  };

  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
        setTasks(parsedTasks);
      } catch (error) {
        console.error("Failed to parse saved tasks:", error);
      }
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTasks((prevTasks) => {
        const hasActiveTimer = prevTasks.some((task) => task.isTimerActive);

        if (!hasActiveTimer) return prevTasks;

        return prevTasks.map((task) => {
          if (task.isTimerActive && task.timerStartTime !== null) {
            const now = Date.now();
            const currentSessionSeconds = Math.floor(
              (now - task.timerStartTime) / 1000
            );

            return {
              ...task,
              currentSessionTime: currentSessionSeconds,
            };
          }
          return task;
        });
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }
  }, [tasks]);

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1
              className={
                theme("text-gray-900", "text-white") + " text-3xl font-bold"
              }
            >
              Jon Does Work
            </h1>
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
          <TaskSection
            title="Pending"
            icon={<Clock size={20} className="text-gray-600" />}
            tasks={pendingTasks}
            emptyStateIcon={
              <Clock size={48} className="mx-auto mb-4 text-gray-300" />
            }
            emptyStateMessage="Is this work/life balance?"
            badgeColors="bg-gray-200 text-gray-700"
            setTasks={setTasks}
            onEdit={openEditTaskModal}
            theme={theme}
          />
          {/* InProgress Section */}
          <TaskSection
            title={"In Progress"}
            icon={<Play size={20} className="text-blue-600" />}
            tasks={inProgressTasks}
            emptyStateIcon={
              <Play size={48} className="mx-auto mb-4 text-gray-300" />
            }
            emptyStateMessage={"No tasks in progress."}
            badgeColors={"bg-blue-100 text-blue-700"}
            setTasks={setTasks}
            onEdit={openEditTaskModal}
            theme={theme}
          />
          {/* Completed Section */}
          <TaskSection
            title="Completed"
            icon={<CircleCheckBig size={20} className="text-green-600" />}
            tasks={completedTasks}
            emptyStateIcon={
              <Check size={48} className="mx-auto mb-4 text-gray-300" />
            }
            emptyStateMessage="Completed tasks will appear here."
            badgeColors="bg-green-100 text-green-700"
            setTasks={setTasks}
            onEdit={openEditTaskModal}
            theme={theme}
          />
        </div>
      </div>

      {showTaskModal && (
        <TaskModal
          editingTask={editingTask}
          onSave={handleSaveTask}
          onCancel={handleCancelModal}
          handleDeleteSession={handleDeleteSession}
          handleDeleteTask={handleDeleteTask}
          theme={theme}
        />
      )}
    </>
  );
};

export default WorkView;
