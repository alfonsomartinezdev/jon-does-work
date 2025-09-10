import React, { useState } from "react";
import TaskCard from "./TaskCard";
import type { Task } from "../global";
import { ChevronDown } from "lucide-react";

interface TaskSectionProps {
  title: string;
  icon: React.ReactNode;
  tasks: Task[];
  emptyStateIcon: React.ReactNode;
  emptyStateMessage: string;
  badgeColors: string;
  iconColor?: string;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  onEdit: (task: Task) => void;
  theme: (lightClass: string, darkClass: string) => string;
}

const TaskSection: React.FC<TaskSectionProps> = ({
  title,
  icon,
  tasks,
  emptyStateIcon,
  emptyStateMessage,
  badgeColors,
  setTasks,
  onEdit,
  theme,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <div>
      <div
        className="flex items-center space-x-2 mb-4 cursor-pointer"
        onClick={toggleCollapse}
      >
        {icon}
        <h2
          className={
            theme("text-gray-900", "text-white") + " text-lg font-semibold"
          }
        >
          {title}
        </h2>
        <span className={`${badgeColors} px-2 py-1 rounded-full text-sm`}>
          {tasks.length}
        </span>
        <ChevronDown
          size={16}
          className={` text-gray-600 transition-transform ${
            isCollapsed ? "-rotate-90" : ""
          }`}
        />
      </div>
      {!isCollapsed &&
        (tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {emptyStateIcon}
            <p
              className={
                theme("text-gray-500", "text-gray-400") +
                (title === "Pending" ? " text-lg mb-2" : "")
              }
            >
              {emptyStateMessage}
            </p>
          </div>
        ) : (
          tasks.map((task, index) => (
            <TaskCard
              key={`${task.id}-${index}`} // add index to prevent reconciliation issue
              task={task}
              setTasks={setTasks}
              onEdit={onEdit}
              theme={theme}
            />
          ))
        ))}
    </div>
  );
};

export default TaskSection;
