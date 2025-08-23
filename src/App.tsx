import { ChartColumn, ListChecks, Moon, Sun } from "lucide-react";
import React, { useState } from "react";
import WorkView from "./pages/WorkView";
import SummaryView from "./pages/SummaryView";
import { tabClass } from "./App.utils";
import { useDarkMode } from "./hooks/useDarkMode";

type ViewType = "work" | "summary";

const TaskTracker: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>("work");
  const { darkMode, setDarkMode, theme } = useDarkMode(); // Use hook's darkMode

  return (
    <div className={theme("min-h-screen bg-gray-50", "min-h-screen bg-gray-900")}>
      <div className={theme("bg-white border-b border-gray-200", "bg-gray-800 border-b border-gray-700")}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-8">
              <button
                onClick={() => setCurrentView("work")}
                className={tabClass(currentView === "work")}
              >
                <ListChecks size={16} />
                <span>Do Work</span>
              </button>
              <button
                onClick={() => setCurrentView("summary")}
                className={tabClass(currentView === "summary")}
              >
                <ChartColumn size={16} />
                <span>View Summary</span>
              </button>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={theme(
                "p-2 rounded-lg bg-gray-200 text-gray-500 hover:bg-gray-300",
                "p-2 rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600"
              )}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
  {currentView === "work" ? <WorkView theme={theme} /> : <SummaryView />}
</div>
    </div>
  );
};

export default TaskTracker;