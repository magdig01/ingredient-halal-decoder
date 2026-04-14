import React, { useState } from 'react';
import { ScanSearch, Loader2, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageUploader } from './components/ImageUploader';
import { ResultsDashboard } from './components/ResultsDashboard';
import { analyzeLabel, type AnalysisResult } from './lib/gemini';
import { translations, type Language } from './translations';

type AppState = 'upload' | 'analyzing' | 'results' | 'error';

export default function App() {
  const [appState, setAppState] = useState<AppState>('upload');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [lang, setLang] = useState<Language>('en');

  const t = translations[lang];

  const handleImageSelected = async (base64: string, mimeType: string) => {
    setAppState('analyzing');
    setErrorMsg('');
    
    try {
      const analysis = await analyzeLabel(base64, mimeType, lang);
      setResult(analysis);
      setAppState('results');
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
      setAppState('error');
    }
  };

  const resetApp = () => {
    setAppState('upload');
    setResult(null);
    setErrorMsg('');
  };

  const toggleLanguage = () => {
    setLang(prev => prev === 'en' ? 'id' : 'en');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-200">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <ScanSearch className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">{t.title}</h1>
          </div>
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors font-medium text-sm"
          >
            <Globe className="w-4 h-4" />
            {lang === 'en' ? 'EN' : 'ID'}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {appState === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center"
            >
              <div className="text-center max-w-2xl mx-auto mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6">
                  {t.heroTitle}
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  {t.heroSubtitle}
                </p>
              </div>
              
              <ImageUploader onImageSelected={handleImageSelected} lang={lang} />
            </motion.div>
          )}

          {appState === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-blue-400 blur-xl opacity-20 rounded-full animate-pulse"></div>
                <div className="bg-white p-6 rounded-full shadow-lg shadow-blue-900/5 relative">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-slate-800 mt-8 mb-2">{t.analyzing}</h3>
              <p className="text-slate-500">{t.analyzingSub}</p>
            </motion.div>
          )}

          {appState === 'results' && result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ResultsDashboard result={result} onReset={resetApp} lang={lang} />
            </motion.div>
          )}

          {appState === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto"
            >
              <div className="bg-rose-100 p-4 rounded-full mb-6">
                <ScanSearch className="w-8 h-8 text-rose-600" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-800 mb-4">{t.errorTitle}</h3>
              <p className="text-slate-600 mb-8">{errorMsg}</p>
              <button
                onClick={resetApp}
                className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                {t.tryAnother}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
