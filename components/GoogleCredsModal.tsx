
import React, { useState } from 'react';
import { GoogleCreds } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { SettingsIcon } from './icons/SettingsIcon';

interface GoogleCredsModalProps {
  initialCreds: GoogleCreds | null;
  onSave: (creds: GoogleCreds) => void;
  onClose: () => void;
}

const GoogleCredsModal: React.FC<GoogleCredsModalProps> = ({ initialCreds, onSave, onClose }) => {
  const [clientId, setClientId] = useState(initialCreds?.clientId || '');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!clientId.trim()) {
      setError('Google Client ID is required.');
      return;
    }
    setError('');
    onSave({ clientId });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <SettingsIcon className="w-6 h-6 text-indigo-500" />
            Configure Google Sheets
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 p-3 rounded-md text-sm">
            <p>To save data, you need to provide your own Google Cloud Client ID. It's stored securely in your browser's local storage and is never sent to our servers.</p>
            <a href="https://developers.google.com/workspace/guides/create-credentials#oauth-client-id" target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:text-blue-500">
              Learn how to get your Client ID here.
            </a>
          </div>

          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="client-id" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Google Client ID
            </label>
            <input
              id="client-id"
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="e.g., 12345-abcde.apps.googleusercontent.com"
              className="w-full p-3 rounded-lg bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
        
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300"
            disabled={!clientId.trim()}
          >
            Save Credential
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoogleCredsModal;
