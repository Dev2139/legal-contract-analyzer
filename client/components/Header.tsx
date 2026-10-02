import React from 'react';
import { Scale, PanelLeft, PanelRight, Sun, Moon, FileText } from 'lucide-react';

interface HeaderProps {
  documentCount: number;
  readyCount: number;
  activeDocName?: string | null;
  leftSidebarOpen: boolean;
  setLeftSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  rightSidebarOpen: boolean;
  setRightSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean | ((prev: boolean) => boolean)) => void;
}

export const Header: React.FC<HeaderProps> = ({
  documentCount,
  readyCount,
  activeDocName,
  leftSidebarOpen,
  setLeftSidebarOpen,
  rightSidebarOpen,
  setRightSidebarOpen,
  isDarkMode,
  setIsDarkMode,
}) => {
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 px-4 py-2.5 flex items-center justify-between shadow-xs transition-colors z-20">
      {/* Brand & Active Document Info */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setLeftSidebarOpen((prev) => !prev)}
          className={`p-1.5 rounded-lg border transition-colors ${
            leftSidebarOpen
              ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100'
              : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          title={leftSidebarOpen ? 'Collapse Document Library' : 'Expand Document Library'}
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2.5">
          <div className="bg-slate-900 dark:bg-blue-600 p-1.5 rounded-lg text-white">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                LexiContract
              </h1>
              <span className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                {documentCount} {documentCount === 1 ? 'Contract' : 'Contracts'}
              </span>
            </div>
          </div>
        </div>

        {activeDocName && (
          <div className="hidden md:flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700/50 max-w-xs truncate">
            <FileText className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
            <span className="truncate font-medium text-slate-700 dark:text-slate-300">{activeDocName}</span>
          </div>
        )}
      </div>

      {/* Right Action Bar Controls */}
      <div className="flex items-center space-x-2">
        {/* Toggle Right Panel (Viewer) */}
        <button
          onClick={() => setRightSidebarOpen((prev) => !prev)}
          className={`flex items-center space-x-1.5 text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors ${
            rightSidebarOpen
              ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100'
              : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          title={rightSidebarOpen ? 'Hide Document Viewer' : 'Show Document Viewer'}
        >
          <PanelRight className="w-4 h-4" />
          <span className="hidden sm:inline">Viewer</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={() => setIsDarkMode((prev) => !prev)}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </div>
    </header>
  );
};

