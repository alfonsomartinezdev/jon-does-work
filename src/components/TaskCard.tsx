import { Check, Pause, Play } from "lucide-react";
import { TASK_STATUS, type Session, type Task } from "../global";

interface TaskCardProps {
  task: Task;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);

  const minutes = Math.floor((seconds % 3600) / 60);

  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return `${secs}s`;
  }
};

const TaskCard: React.FC<TaskCardProps> = ({ task, setTasks }) => {
  const toggleTimer = (taskId: string): void => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          if (task.isTimerActive) {
            if (task.timerStartTime !== null) {
              const now = Date.now();
              const sessionTime = Math.floor(
                (now - task.timerStartTime) / 1000
              );
              const newSession: Session = {
                start: task.timerStartTime,
                end: now,
              };

              return {
                ...task,
                isTimerActive: false,
                timerStartTime: null,
                activeTime: task.baseActiveTime + sessionTime,
                baseActiveTime: task.baseActiveTime + sessionTime,
                currentSessionTime: 0,
                sessions: [...task.sessions, newSession],
              };
            }

            return {
              ...task,
              isTimerActive: false,
              timerStartTime: null,
              currentSessionTime: 0,
            };
          } else {
            return {
              ...task,
              isTimerActive: true,
              timerStartTime: Date.now(),
              baseActiveTime: task.activeTime || 0,
              currentSessionTime: 0,
              status: TASK_STATUS.IN_PROGRESS,
            };
          }
        }

        if (task.isTimerActive && task.timerStartTime !== null) {
          const now = Date.now();
          const sessionTime = Math.floor((now - task.timerStartTime) / 1000);
          const newSession: Session = {
            start: task.timerStartTime,
            end: now,
          };

          return {
            ...task,
            isTimerActive: false,
            timerStartTime: null,
            activeTime: task.baseActiveTime + sessionTime,
            baseActiveTime: task.baseActiveTime + sessionTime,
            currentSessionTime: 0,
            sessions: [...task.sessions, newSession],
          };
        }

        return task;
      })
    );
  };

  const handleDone = (taskId: string): void => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          if (task.isTimerActive && task.timerStartTime !== null) {
            const now = Date.now();
            const sessionTime = Math.floor((now - task.timerStartTime) / 1000);
            const newSession: Session = {
              start: task.timerStartTime,
              end: now,
            };

            return {
              ...task,
              status: TASK_STATUS.COMPLETED,
              isTimerActive: false,
              timerStartTime: null,
              activeTime: task.baseActiveTime + sessionTime,
              baseActiveTime: task.baseActiveTime + sessionTime,
              currentSessionTime: 0,
              sessions: [...task.sessions, newSession],
            };
          }

          return {
            ...task,
            status: TASK_STATUS.COMPLETED,
            isTimerActive: false,
            timerStartTime: null,
            currentSessionTime: 0,
          };
        }

        return task;
      })
    );
  };

  const handleUnDone = (taskId: string): void => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          if (task.isTimerActive && task.timerStartTime !== null) {
            const now = Date.now();
            const sessionTime = Math.floor((now - task.timerStartTime) / 1000);
            const newSession: Session = {
              start: task.timerStartTime,
              end: now,
            };

            return {
              ...task,
              status: TASK_STATUS.IN_PROGRESS,
              isTimerActive: false,
              timerStartTime: null,
              activeTime: task.baseActiveTime + sessionTime,
              baseActiveTime: task.baseActiveTime + sessionTime,
              currentSessionTime: 0,
              sessions: [...task.sessions, newSession],
            };
          }

          return {
            ...task,
            status: TASK_STATUS.IN_PROGRESS,
            isTimerActive: false,
            timerStartTime: null,
            currentSessionTime: 0,
          };
        }

        return task;
      })
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 mb-1 shadow-smm flex items-center justify-between">
      <div className="flex items-center space-x-6">
        <div>
          <h5 className="text-xl font-semibold text-gray-900 mb-2">
            {task.name}
          </h5>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <span>Assigned {task.assignedDate}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-8">
        {task.isTimerActive && task.timerStartTime && (
          <div className="text-center">
            <div className="text-2xl font-mono font-bold text-green-700 mb-1">
              {formatTime(task.currentSessionTime || 0)}
            </div>
            <div className="text-xs text-green-700 uppercase tracking-wide">
              Current Session Time
            </div>
          </div>
        )}

        <div className="text-center">
          <div className="text-2xl font-mono font-bold text-gray-600 mb-1">
            {formatTime(task.activeTime)}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">
            Total Active Time
          </div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-gray-600 mb-1">
            {task.sessions.length}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">
            Sessions
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {!(task.status == TASK_STATUS.COMPLETED) ? (
            <>
              <button
                onClick={() => toggleTimer(task.id)}
                className={`inline-flex items-center px-6 py-2 rounded-lg font-medium transition-colors ${
                  task.isTimerActive
                    ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {}
                {task.isTimerActive ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    <span>Start</span>
                  </>
                )}
              </button>
              <button
                onClick={() => handleDone(task.id)}
                className="inline-flex items-center px-6 py-2 rounded-lg font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <Check className="h-4 w-4 mr-2" />
                Mark Complete
              </button>
            </>
          ) : (
            <button
              onClick={() => handleUnDone(task.id)}
              className="inline-flex items-center px-6 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Mark In Progress
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
