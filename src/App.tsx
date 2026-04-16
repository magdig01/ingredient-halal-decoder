import React, { useState, useEffect } from 'react';
import { Loader2, Globe, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageUploader } from './components/ImageUploader';
import { ResultsDashboard } from './components/ResultsDashboard';
import { HalalLogo } from './components/HalalLogo';
import { LanguageToggle } from './components/LanguageToggle';
import { analyzeLabel, type AnalysisResult } from './lib/gemini';
import { translations, type Language } from './translations';
import { History, Trash2, Clock, ChevronRight } from 'lucide-react';

type AppState = 'upload' | 'analyzing' | 'results' | 'error';

interface ImageData {
  base64: string;
  mimeType: string;
}

interface HistoryItem {
  id: string;
  timestamp: number;
  result: AnalysisResult;
  image?: ImageData;
}

export default function App() {
  const [appState, setAppState] = useState<AppState>('upload');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [lang, setLang] = useState<Language>('en');
  const [lastImage, setLastImage] = useState<ImageData | null>(null);
  const [activeTab, setActiveTab] = useState<'analyze' | 'guide' | 'history'>('analyze');
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('halal_scan_history');
    return saved ? JSON.parse(saved) : [];
  });

  const t = translations[lang];

  useEffect(() => {
    localStorage.setItem('halal_scan_history', JSON.stringify(history));
  }, [history]);

  const handleImageSelected = async (base64: string, mimeType: string, targetLang?: Language) => {
    const activeLang = targetLang || lang;
    setAppState('analyzing');
    setErrorMsg('');
    setLastImage({ base64, mimeType });
    
    try {
      const analysis = await analyzeLabel(base64, mimeType, activeLang);
      setResult(analysis);
      setAppState('results');
      
      // Add to history
      const newItem: HistoryItem = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        result: analysis,
        image: { base64, mimeType }
      };
      
      setHistory(prev => [newItem, ...prev].slice(0, 10));
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
      setAppState('error');
    }
  };

  const resetApp = () => {
    setAppState('upload');
    setResult(null);
    setErrorMsg('');
    setLastImage(null);
  };

  const handleLanguageChange = (newLang: Language) => {
    if (newLang === lang) return;
    setLang(newLang);
    
    // If we have results or are analyzing, re-run with new language for consistency
    if (lastImage && (appState === 'results' || appState === 'analyzing')) {
      handleImageSelected(lastImage.base64, lastImage.mimeType, newLang);
    }
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const viewHistoryItem = (item: HistoryItem) => {
    setResult(item.result);
    if (item.image) {
      setLastImage(item.image);
    }
    setAppState('results');
  };

  return (
    <div className="min-h-screen bg-white font-sans text-black selection:bg-emerald-200">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-600 p-1.5 rounded-lg shadow-sm shadow-emerald-600/20">
              <HalalLogo className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h1 className="text-lg md:text-xl font-display font-bold text-black tracking-tight leading-none">{t.title}</h1>
          </div>
          <LanguageToggle currentLang={lang} onToggle={handleLanguageChange} />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <AnimatePresence mode="wait">
          {appState === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center"
            >
              {/* Tabs */}
              <div className="flex bg-gray-100/80 p-1 rounded-xl mb-8 md:mb-12 w-full max-w-[320px] md:max-w-sm">
                <button
                  onClick={() => setActiveTab('analyze')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs md:text-sm font-bold transition-all duration-200 ${
                    activeTab === 'analyze' 
                      ? 'bg-white text-emerald-700 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t.analyzeTab}
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs md:text-sm font-bold transition-all duration-200 ${
                    activeTab === 'history' 
                      ? 'bg-white text-emerald-700 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t.historyTab}
                </button>
                <button
                  onClick={() => setActiveTab('guide')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs md:text-sm font-bold transition-all duration-200 ${
                    activeTab === 'guide' 
                      ? 'bg-white text-emerald-700 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t.guideTab}
                </button>
              </div>

              <AnimatePresence mode="wait">
                {activeTab === 'analyze' ? (
                  <motion.div
                    key="analyze-tab"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="w-full flex flex-col items-center"
                  >
                    <div className="text-center max-w-2xl mx-auto mb-8 md:mb-12">
                      <h2 className="text-3xl md:text-5xl font-display font-bold text-black tracking-tight mb-4 md:mb-6">
                        {t.heroTitle}
                      </h2>
                      <p className="text-base md:text-lg text-gray-800 leading-relaxed px-2">
                        {t.heroSubtitle}
                      </p>
                    </div>
                    
                    <ImageUploader onImageSelected={handleImageSelected} lang={lang} />
                  </motion.div>
                ) : activeTab === 'history' ? (
                  <motion.div
                    key="history-tab"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    className="w-full max-w-2xl"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl md:text-2xl font-display font-bold text-black flex items-center gap-2">
                        <Clock className="w-6 h-6 text-emerald-600" />
                        {t.historyTab}
                      </h3>
                      {history.length > 0 && (
                        <button
                          onClick={clearHistory}
                          className="text-rose-600 hover:text-rose-700 text-sm font-medium flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          {t.clearHistory}
                        </button>
                      )}
                    </div>

                    {history.length === 0 ? (
                      <div className="bg-gray-50 border border-dashed border-gray-200 rounded-3xl p-12 text-center">
                        <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">{t.noHistory}</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {history.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => viewHistoryItem(item)}
                            className="w-full flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-emerald-200 hover:shadow-sm transition-all text-left group"
                          >
                            <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                              {item.image ? (
                                <img 
                                  src={item.image.base64} 
                                  alt="Scan" 
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Clock className="w-6 h-6 text-gray-300" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-black truncate mb-1">{item.result.summary}</h4>
                              <div className="flex items-center gap-3 text-xs">
                                <span className={`font-bold uppercase ${
                                  item.result.halalStatus === 'halal' ? 'text-emerald-600' :
                                  item.result.halalStatus === 'doubtful' ? 'text-amber-500' :
                                  'text-rose-600'
                                }`}>
                                  {item.result.halalStatus}
                                </span>
                                <span className="text-gray-400">•</span>
                                <span className="text-gray-500">
                                  {new Date(item.timestamp).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 transition-colors" />
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="guide-tab"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="w-full max-w-4xl"
                  >
                    <div className="text-center mb-8 md:mb-10">
                      <h3 className="text-xl md:text-2xl font-display font-bold text-black mb-2">{t.howToUse}</h3>
                      <div className="w-10 h-1 bg-emerald-500 mx-auto rounded-full"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
                      <div className="flex items-center md:flex-col md:text-center p-4 md:p-6 rounded-2xl md:rounded-3xl bg-gray-50 border border-gray-100 transition-all hover:shadow-sm">
                        <div className="flex-shrink-0 bg-emerald-600 text-white w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold shadow-md mr-4 md:mr-0 md:mb-6 text-sm md:text-xl">1</div>
                        <div>
                          <h4 className="font-display font-bold text-base md:text-lg mb-1 md:mb-2">{t.step1Title}</h4>
                          <p className="text-gray-600 text-xs md:text-sm leading-relaxed">{t.step1Desc}</p>
                        </div>
                      </div>

                      <div className="flex items-center md:flex-col md:text-center p-4 md:p-6 rounded-2xl md:rounded-3xl bg-gray-50 border border-gray-100 transition-all hover:shadow-sm">
                        <div className="flex-shrink-0 bg-emerald-600 text-white w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold shadow-md mr-4 md:mr-0 md:mb-6 text-sm md:text-xl">2</div>
                        <div>
                          <h4 className="font-display font-bold text-base md:text-lg mb-1 md:mb-2">{t.step2Title}</h4>
                          <p className="text-gray-600 text-xs md:text-sm leading-relaxed">{t.step2Desc}</p>
                        </div>
                      </div>

                      <div className="flex items-center md:flex-col md:text-center p-4 md:p-6 rounded-2xl md:rounded-3xl bg-gray-50 border border-gray-100 transition-all hover:shadow-sm">
                        <div className="flex-shrink-0 bg-emerald-600 text-white w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold shadow-md mr-4 md:mr-0 md:mb-6 text-sm md:text-xl">3</div>
                        <div>
                          <h4 className="font-display font-bold text-base md:text-lg mb-1 md:mb-2">{t.step3Title}</h4>
                          <p className="text-gray-600 text-xs md:text-sm leading-relaxed">{t.step3Desc}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
                <div className="absolute inset-0 bg-emerald-400 blur-xl opacity-20 rounded-full animate-pulse"></div>
                <div className="bg-white p-6 rounded-full shadow-lg shadow-emerald-900/5 relative border border-gray-100">
                  <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
                </div>
              </div>
              <h3 className="text-2xl font-display font-semibold text-black mt-8 mb-2">{t.analyzing}</h3>
              <p className="text-gray-600">{t.analyzingSub}</p>
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
                <AlertCircle className="w-8 h-8 text-rose-600" />
              </div>
              <h3 className="text-2xl font-display font-semibold text-black mb-4">{t.errorTitle}</h3>
              <p className="text-gray-800 mb-8">{errorMsg}</p>
              <button
                onClick={resetApp}
                className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-medium transition-colors"
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
