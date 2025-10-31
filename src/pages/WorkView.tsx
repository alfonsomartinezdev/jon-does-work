import {
  Check,
  ChevronDown,
  CircleCheckBig,
  Clock,
  Download,
  Play,
  Plus,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import TaskModal from "../components/TaskModal";
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
  const inProgressTasks = useMemo(
    () =>
      tasks
        .filter((task) => task.status === TASK_STATUS.IN_PROGRESS)
        .sort((a, b) => {
          if (a.isTimerActive && !b.isTimerActive) return -1;
          if (!a.isTimerActive && b.isTimerActive) return 1;
          return 0;
        }),
    [tasks]
  );

  const completedTasks = useMemo(
    () => tasks.filter((task) => task.status === TASK_STATUS.COMPLETED),
    [tasks]
  );
  const [showTaskModal, setShowTaskModal] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

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
        activities: taskData.activities || [],
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

  const handleExportJSON = (): void => {
    const dataToExport = {
      exportDate: new Date().toISOString(),
      tasks: tasks,
      metadata: {
        totalTasks: tasks.length,
        pendingTasks: pendingTasks.length,
        inProgressTasks: inProgressTasks.length,
        completedTasks: completedTasks.length,
      },
    };

    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `jon-does-work-backup-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleExportCSV = (): void => {
    const headers = [
      "Task Name",
      "Description",
      "Status",
      "Assigned Date",
      "Total Time (minutes)",
      "Number of Sessions",
      "Activities",
      "Sessions Details",
    ];

    const rows = tasks.map((task) => {
      const totalMinutes = (task.activeTime / 60).toFixed(2);

      const activitiesText = task.activities
        .map((activity) => activity.text)
        .join("; ");

      const sessionsDetail = task.sessions
        .map((session, idx) => {
          const start = new Date(session.start).toLocaleString();
          const end = new Date(session.end).toLocaleString();
          const durationMinutes = (
            (session.end - session.start) /
            1000 /
            60
          ).toFixed(2);
          return `Session ${
            idx + 1
          }: ${start} to ${end} (${durationMinutes} min)`;
        })
        .join("; ");

      return [
        `"${task.name.replace(/"/g, '""')}"`,
        `"${(task.description || "").replace(/"/g, '""')}"`,
        task.status,
        task.assignedDate,
        totalMinutes,
        task.sessions.length,
        `"${activitiesText}"`,
        `"${sessionsDetail}"`,
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `jon-does-work-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        exportMenuRef.current &&
        !exportMenuRef.current.contains(event.target as Node)
      ) {
        setShowExportMenu(false);
      }
    };

    if (showExportMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showExportMenu]);

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
          <div className="flex items-center space-x-3">
            <div className="relative" ref={exportMenuRef}>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className={
                  theme(
                    "bg-gray-200 text-gray-700 hover:bg-gray-300",
                    "bg-gray-700 text-gray-200 hover:bg-gray-600"
                  ) +
                  " px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                }
              >
                <Download size={20} />
                <span>Export Data</span>
                <ChevronDown size={16} />
              </button>

              {showExportMenu && (
                <div
                  className={theme(
                    "absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10",
                    "absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10"
                  )}
                >
                  <button
                    onClick={handleExportCSV}
                    className={theme(
                      "w-full text-left px-4 py-3 hover:bg-gray-100 rounded-t-lg flex items-center space-x-2 text-gray-700",
                      "w-full text-left px-4 py-3 hover:bg-gray-700 rounded-t-lg flex items-center space-x-2 text-gray-200"
                    )}
                  >
                    <Download size={16} />
                    <div>
                      <div className="font-medium">Export as CSV</div>
                      <div
                        className={theme(
                          "text-xs text-gray-500",
                          "text-xs text-gray-400"
                        )}
                      >
                        Open in Excel/Sheets
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={handleExportJSON}
                    className={theme(
                      "w-full text-left px-4 py-3 hover:bg-gray-100 rounded-b-lg flex items-center space-x-2 text-gray-700 border-t border-gray-200",
                      "w-full text-left px-4 py-3 hover:bg-gray-700 rounded-b-lg flex items-center space-x-2 text-gray-200 border-t border-gray-700"
                    )}
                  >
                    <Download size={16} />
                    <div>
                      <div className="font-medium">Export as JSON</div>
                      <div
                        className={theme(
                          "text-xs text-gray-500",
                          "text-xs text-gray-400"
                        )}
                      >
                        Full backup with metadata
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={openAddTaskModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Add Task</span>
            </button>
          </div>
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
