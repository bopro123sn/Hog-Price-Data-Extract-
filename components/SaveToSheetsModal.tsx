
import React, { useState } from 'react';
import type { HogPriceData, GoogleCreds } from '../types';
import { createSpreadsheet } from '../services/googleSheetsService';
import { CloseIcon } from './icons/CloseIcon';
import { GoogleSheetsIcon } from './icons/GoogleSheetsIcon';

interface SaveToSheetsModalProps {
  data: HogPriceData[];
  creds: GoogleCreds;
  onClose: () => void;
}

const SaveToSheetsModal: React.FC<SaveToSheetsModalProps> = ({ data, creds, onClose }) => {
  const [title, setTitle] = useState(`Hog Price Data - ${new Date().toISOString().split('T')[0]}`);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string | null>(null);

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Spreadsheet title cannot be empty.");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const url = await createSpreadsheet(creds, data, title);
      setSpreadsheetUrl(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to save: ${message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <GoogleSheetsIcon className="w-6 h-6 text-green-600" />
            Save to Google Sheets
          </h3>
          <button onClick={onClose} disabled={isSaving} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 p-3 rounded-md text-sm">
                {error}
            </div>
          )}
          {spreadsheetUrl ? (
            <div className="text-center space-y-4 py-4">
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">Success!</p>
                <p className="text-slate-600 dark:text-slate-300">Your data has been saved.</p>
                <a 
                    href={spreadsheetUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 hover:-translate-y-px transition-transform"
                >
                    Open Google Sheet
                </a>
            </div>
          ) : (
            <>
                <div>
                    <label htmlFor="sheet-title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Spreadsheet Title
                    </label>
                    <input
                        id="sheet-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-3 rounded-lg bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-slate-700 dark:text-slate-300"
                        disabled={isSaving}
                    />
                </div>
            </>
          )}
        </div>
        
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
          <button 
            onClick={onClose} 
            disabled={isSaving}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
          >
            {spreadsheetUrl ? 'Close' : 'Cancel'}
          </button>
          {!spreadsheetUrl && (
             <button 
                onClick={handleSave}
                disabled={isSaving || !title.trim()}
                className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-300 dark:disabled:bg-slate-600"
              >
               {isSaving ? 'Saving...' : 'Save'}
             </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SaveToSheetsModal;
