
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-lg font-semibold text-slate-600 dark:text-slate-300">AI is analyzing the article...</p>
    </div>
  );
};

export default LoadingSpinner;
