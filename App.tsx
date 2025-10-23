
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { extractHogPriceData } from './services/geminiService';
import { fetchArticleHtml } from './services/articleService';
import type { HogPriceData, ExtractedDataResponse, GoogleCreds } from './types';
import ContentInputForm from './components/ContentInputForm';
import DataTable from './components/DataTable';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import PriceMovementSummary from './components/PriceMovementSummary';
import SaveToSheetsModal from './components/SaveToSheetsModal';
import GoogleCredsModal from './components/GoogleCredsModal';
import { PigIcon } from './components/icons/PigIcon';
import { initGoogleClient, handleAuthClick, areGoogleKeysAvailable } from './services/googleSheetsService';

type InputMode = 'url' | 'text';

const App: React.FC = () => {
  const [inputMode, setInputMode] = useState<InputMode>('url');
  const [articleUrl, setArticleUrl] = useState<string>('');
  const [textContent, setTextContent] = useState<string>('');
  
  const [extractedData, setExtractedData] = useState<HogPriceData[]>([]);
  const [priceMovementSummary, setPriceMovementSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSwitchingMode, setIsSwitchingMode] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [googleCreds, setGoogleCreds] = useState<GoogleCreds | null>(null);
  const [isCredsModalOpen, setIsCredsModalOpen] = useState(false);
  const isSheetsConfigured = useMemo(() => areGoogleKeysAvailable(googleCreds), [googleCreds]);

  const [isGapiReady, setIsGapiReady] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isAuthPendingSave, setIsAuthPendingSave] = useState(false);

  useEffect(() => {
    try {
        const storedCreds = localStorage.getItem('googleCreds');
        if (storedCreds) {
            setGoogleCreds(JSON.parse(storedCreds));
        }
    } catch (e) {
        console.error("Could not load Google credentials from localStorage", e);
    }
  }, []);

  useEffect(() => {
    if (!isSheetsConfigured || !googleCreds) {
      console.warn("Google Sheets integration is disabled until credentials are provided.");
      return;
    }

    setIsGapiReady(false);
    const checkAndInit = () => {
        if ((window as any).gapi && (window as any).google) {
            initGoogleClient(googleCreds, (signedIn) => {
                setIsSignedIn(signedIn);
                setIsGapiReady(true);
            }).catch(err => {
                console.error("Failed to initialize Google Client:", err);
                setError("Could not connect to Google services. Please check your credentials.");
            });
        } else {
            setTimeout(checkAndInit, 100);
        }
    };
    checkAndInit();
  }, [googleCreds, isSheetsConfigured]);

  useEffect(() => {
    // Effect to automatically open the save modal after a successful sign-in
    if (isSignedIn && isAuthPendingSave) {
      setIsAuthPendingSave(false);
      if (extractedData.length > 0) {
        setIsSaveModalOpen(true);
      }
    }
  }, [isSignedIn, isAuthPendingSave, extractedData]);
  
  const handleModeChange = (mode: InputMode) => {
    if (inputMode !== mode) {
        setIsSwitchingMode(true);
        // Artificial delay to make the transition and spinner visible
        setTimeout(() => {
            setInputMode(mode);
            setIsSwitchingMode(false);
        }, 150);
    }
  };

  const handleSaveCreds = (creds: GoogleCreds) => {
    setGoogleCreds(creds);
    localStorage.setItem('googleCreds', JSON.stringify(creds));
    setIsCredsModalOpen(false);
  };

  const handleSubmit = useCallback(async () => {
    setError(null);
    setExtractedData([]);
    setPriceMovementSummary(null);
    
    let contentToProcess = '';
    let contentType: 'html' | 'text' = 'url' === inputMode ? 'html' : 'text';

    if (inputMode === 'url') {
      if (!articleUrl.trim()) {
        setError('Please enter an article URL before submitting.');
        return;
      }
      try {
        new URL(articleUrl);
      } catch (_) {
        setError('The entered text is not a valid URL. Please check and try again.');
        return;
      }
    } else { 
      if (!textContent.trim()) {
        setError('Please paste some article content before submitting.');
        return;
      }
      contentToProcess = textContent;
    }

    setIsLoading(true);

    try {
      if (inputMode === 'url') {
        contentToProcess = await fetchArticleHtml(articleUrl);
      }
      
      const result: ExtractedDataResponse | null = await extractHogPriceData(contentToProcess, contentType);

      if (result) {
        if (result.extractedData && result.extractedData.length > 0) {
            const dataWithIds = result.extractedData.map((item, index) => ({...item, id: Date.now() + index }));
            setExtractedData(dataWithIds);
        } else {
            setError('The AI could not extract structured data. The article might not contain the expected price information.');
        }
        if (result.priceMovementSummary) {
            setPriceMovementSummary(result.priceMovementSummary);
        }
      } else {
        setError('The AI could not extract any information from the provided content.');
      }
    } catch (err) {
      console.error(err);
      let message = err instanceof Error ? err.message : 'An unknown error occurred.';
       if (message.includes('Failed to fetch') || message.includes('public proxy')) {
          message = 'Could not fetch the article. The public proxy service may be unavailable or blocked. You can try switching to "Paste Text" mode and pasting the content directly.';
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [articleUrl, textContent, inputMode]);

  const handleDataChange = (updatedData: HogPriceData[]) => {
    setExtractedData(updatedData);
  };
  
  const handleOpenSaveModal = () => {
    if (!isSheetsConfigured) {
        setIsCredsModalOpen(true);
        return;
    }
    if (!isGapiReady) {
      setError("Google integration is not ready. Please wait a moment or check your credentials.");
      return;
    }
    if (extractedData.length === 0) {
      setError("There is no data to save to Google Sheets.");
      return;
    }
    if (!isSignedIn) {
      // Set a flag and trigger sign-in. The useEffect will handle opening the modal on success.
      setIsAuthPendingSave(true);
      handleAuthClick();
      return;
    }
    // If already signed in, open the modal directly.
    setIsSaveModalOpen(true);
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-2">
            <PigIcon className="w-12 h-12 text-indigo-500" />
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Hog Price Data Extractor
            </h1>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Use AI to instantly extract and standardize hog prices from an article URL or pasted text.
          </p>
        </header>

        <main className="space-y-8">
          <ContentInputForm
            mode={inputMode}
            setMode={handleModeChange}
            url={articleUrl}
            setUrl={setArticleUrl}
            text={textContent}
            setText={setTextContent}
            onSubmit={handleSubmit}
            isLoading={isLoading || isSwitchingMode}
          />

          {(isLoading || isSwitchingMode) && <LoadingSpinner />}
          {error && <ErrorMessage message={error} />}

          {(extractedData.length > 0 || priceMovementSummary) && (
            <div className="mt-8 space-y-8">
                {priceMovementSummary && <PriceMovementSummary summary={priceMovementSummary} />}
                {extractedData.length > 0 && (
                   <DataTable 
                     data={extractedData} 
                     onDataChange={handleDataChange} 
                     onSaveToSheets={handleOpenSaveModal}
                     onConfigureSheets={() => setIsCredsModalOpen(true)}
                   />
                )}
            </div>
          )}
        </main>
         <footer className="text-center mt-12 text-sm text-slate-500 dark:text-slate-400">
            <p>Powered by React, Tailwind CSS, and Google Gemini</p>
        </footer>
      </div>
      {isSaveModalOpen && googleCreds && (
        <SaveToSheetsModal 
            data={extractedData}
            creds={googleCreds}
            onClose={() => setIsSaveModalOpen(false)}
        />
      )}
      {isCredsModalOpen && (
        <GoogleCredsModal
          initialCreds={googleCreds}
          onSave={handleSaveCreds}
          onClose={() => setIsCredsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
