
import React from 'react';
import { SubmitIcon } from './icons/SubmitIcon';
import { LinkIcon } from './icons/LinkIcon';
import { TextIcon } from './icons/TextIcon';

type InputMode = 'url' | 'text';

interface ContentInputFormProps {
  mode: InputMode;
  setMode: (mode: InputMode) => void;
  url: string;
  setUrl: (url: string) => void;
  text: string;
  setText: (text: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const ContentInputForm: React.FC<ContentInputFormProps> = ({ mode, setMode, url, setUrl, text, setText, onSubmit, isLoading }) => {
  
  const isSubmitDisabled = isLoading || (mode === 'url' ? !url.trim() : !text.trim());

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Submit on Enter for URL input, but require Ctrl+Enter or Cmd+Enter for textarea
    if (e.key === 'Enter') {
      if (mode === 'url' && !(e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onSubmit();
      } else if (mode === 'text' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onSubmit();
      }
    }
  };
    
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
            <label className="block text-lg font-semibold text-slate-800 dark:text-slate-100">
                {mode === 'url' ? 'Enter Article URL' : 'Paste Article Text'}
            </label>
        </div>
        <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
          <button
            onClick={() => setMode('url')}
            disabled={isLoading}
            className={`px-3 py-1 text-sm font-semibold rounded-md flex items-center gap-2 transition-all duration-150 ${mode === 'url' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 hover:scale-105'}`}
            aria-pressed={mode === 'url'}
          >
            <LinkIcon className="w-4 h-4" />
            URL
          </button>
          <button
            onClick={() => setMode('text')}
            disabled={isLoading}
            className={`px-3 py-1 text-sm font-semibold rounded-md flex items-center gap-2 transition-all duration-150 ${mode === 'text' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 hover:scale-105'}`}
            aria-pressed={mode === 'text'}
          >
            <TextIcon className="w-4 h-4" />
            Paste Text
          </button>
        </div>
      </div>

       <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        {mode === 'url'
          ? 'Paste the URL of the hog price article and the AI will fetch and analyze its content.'
          : 'Paste the raw text content of an article directly into the text area below.'}
      </p>

      <div className="relative">
        {mode === 'url' ? (
          <input
            id="article-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://vietnambiz.vn/gia-heo-hoi-hom-nay..."
            className="w-full p-4 pr-40 rounded-lg bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-slate-700 dark:text-slate-300"
            disabled={isLoading}
          />
        ) : (
          <textarea
            id="article-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste the full article content here..."
            className="w-full p-4 pr-40 rounded-lg bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-slate-700 dark:text-slate-300 min-h-[150px] resize-y"
            disabled={isLoading}
            rows={6}
          />
        )}
        <button
          onClick={onSubmit}
          disabled={isSubmitDisabled}
          className="absolute top-4 right-2 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 hover:-translate-y-px disabled:bg-indigo-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900 transition-all duration-200"
          style={{ transform: mode === 'url' ? 'translateY(0)' : undefined }}
        >
          {isLoading ? (
            'Processing...'
          ) : (
            <>
              <SubmitIcon className="w-5 h-5" />
              <span>Extract Data</span>
            </>
          )}
        </button>
      </div>
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 text-right">
            Pro tip: Press {mode === 'url' ? 'Enter' : 'Ctrl+Enter'} to submit.
        </p>
    </div>
  );
};

export default ContentInputForm;