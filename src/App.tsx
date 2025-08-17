import { ChartColumn, ListChecks } from 'lucide-react';
import React, { useState } from 'react';
import WorkView from './pages/WorkView';
import SummaryView from './pages/SummaryView';
import { tabClass } from './App.utils';

type ViewType = 'work' | 'summary';

const TaskTracker: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('work');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setCurrentView('work')}
              className={tabClass(currentView === 'work')}
            >
              <ListChecks size={16} />
              <span>Do Work</span>
            </button>
            <button
              onClick={() => setCurrentView('summary')}
              className={tabClass(currentView === 'summary')}
            >
              <ChartColumn size={16} />
              <span>View Summary</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {currentView === 'work' ? <WorkView /> : <SummaryView />}
      </div>
    </div>
  );
};

export default TaskTracker;