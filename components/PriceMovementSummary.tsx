
import React from 'react';
import { TrendingUpIcon } from './icons/TrendingUpIcon';

interface PriceMovementSummaryProps {
  summary: string;
}

const PriceMovementSummary: React.FC<PriceMovementSummaryProps> = ({ summary }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
      <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
        <TrendingUpIcon className="w-6 h-6 text-indigo-500"/>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">AI Market Analysis</h3>
      </div>
      <div className="p-4 sm:p-6">
        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          {summary}
        </p>
      </div>
    </div>
  );
};

export default PriceMovementSummary;