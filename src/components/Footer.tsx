import * as React from 'react';

export function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            DJ Event Booking System • Built with React, Convex, and TypeScript
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            🤖 Enhanced with Claude Code
          </div>
        </div>
      </div>
    </footer>
  );
}