
import React from 'react';
import { SchemaIcon } from './icons/SchemaIcon';

interface SchemaDisplayProps {
  schema: string;
}

const SchemaDisplay: React.FC<SchemaDisplayProps> = ({ schema }) => {
  let formattedSchema = '';
  try {
    const parsed = JSON.parse(schema);
    formattedSchema = JSON.stringify(parsed, null, 2);
  } catch {
    formattedSchema = schema;
  }
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 h-full">
      <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
        <SchemaIcon className="w-6 h-6 text-indigo-500"/>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Suggested Data Template</h3>
      </div>
      <div className="p-4 sm:p-6">
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          The AI suggests this JSON schema for long-term storage and analysis of the price data.
        </p>
        <pre className="bg-slate-100 dark:bg-slate-900 rounded-lg p-4 text-sm text-slate-800 dark:text-slate-200 overflow-x-auto">
          <code>{formattedSchema}</code>
        </pre>
      </div>
    </div>
  );
};

export default SchemaDisplay;
