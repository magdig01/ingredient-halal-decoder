import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, AlertTriangle, XOctagon, Info, RefreshCw, CheckCircle, HelpCircle, XCircle, Share2 } from 'lucide-react';
import type { AnalysisResult, Ingredient } from '../lib/gemini';
import { translations, type Language } from '../translations';

interface ResultsDashboardProps {
  result: AnalysisResult;
  onReset: () => void;
  lang: Language;
}

export function ResultsDashboard({ result, onReset, lang }: ResultsDashboardProps) {
  const t = translations[lang];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 50) return 'text-amber-500';
    return 'text-rose-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-50 border-emerald-200';
    if (score >= 50) return 'bg-amber-50 border-amber-200';
    return 'bg-rose-50 border-rose-200';
  };

  const getHalalColor = (status: string) => {
    if (status === 'halal') return 'text-emerald-600';
    if (status === 'doubtful') return 'text-amber-500';
    return 'text-rose-600';
  };

  const getHalalBg = (status: string) => {
    if (status === 'halal') return 'bg-emerald-50 border-emerald-200';
    if (status === 'doubtful') return 'bg-amber-50 border-amber-200';
    return 'bg-rose-50 border-rose-200';
  };

  const getHalalText = (status: string) => {
    if (status === 'halal') return t.halal;
    if (status === 'doubtful') return t.doubtful;
    return t.haram;
  };

  const safeIngredients = result.ingredients.filter(i => i.category === 'safe');
  const cautionIngredients = result.ingredients.filter(i => i.category === 'caution');
  const avoidIngredients = result.ingredients.filter(i => i.category === 'avoid');

  const handleShare = async () => {
    const shareText = t.shareText
      .replace('{safetyScore}', result.safetyScore.toString())
      .replace('{halalStatus}', getHalalText(result.halalStatus))
      .replace('{recommendation}', result.recommendation);

    const shareData = {
      title: t.title,
      text: shareText,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareText}\n\n${window.location.href}`);
        alert(t.copied);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto space-y-6"
    >
      {/* Top Section: Score & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Scores Column */}
        <div className="col-span-1 flex flex-col gap-6">
          {/* Safety Score Card */}
          <div className={`rounded-3xl border p-6 flex flex-col items-center justify-center text-center flex-1 ${getScoreBg(result.safetyScore)}`}>
            <p className="text-sm font-semibold uppercase tracking-wider opacity-70 mb-2">{t.safetyScore}</p>
            <div className={`text-5xl font-bold mb-2 ${getScoreColor(result.safetyScore)}`}>
              {result.safetyScore}
              <span className="text-xl opacity-50">/100</span>
            </div>
            <p className="text-sm opacity-80 font-medium">
              {result.safetyScore >= 80 ? t.safe : result.safetyScore >= 50 ? t.caution : t.avoid}
            </p>
          </div>

          {/* Halal Score Card */}
          <div className={`rounded-3xl border p-6 flex flex-col items-center justify-center text-center flex-1 ${getHalalBg(result.halalStatus)}`}>
            <p className="text-sm font-semibold uppercase tracking-wider opacity-70 mb-2">{t.halalScore}</p>
            <div className={`text-5xl font-bold mb-3 ${getHalalColor(result.halalStatus)}`}>
              {result.halalScore}
              <span className="text-xl opacity-50">/100</span>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold uppercase tracking-wide text-sm shadow-sm ${
              result.halalStatus === 'halal' ? 'bg-emerald-200 text-emerald-900' :
              result.halalStatus === 'doubtful' ? 'bg-amber-200 text-amber-900' :
              'bg-rose-200 text-rose-900'
            }`}>
              {result.halalStatus === 'halal' && (
                <div className="bg-emerald-700 text-white text-[10px] px-1.5 py-0.5 rounded leading-none">حلال</div>
              )}
              {result.halalStatus === 'doubtful' && <HelpCircle className="w-4 h-4" />}
              {result.halalStatus === 'haram' && <XCircle className="w-4 h-4" />}
              {getHalalText(result.halalStatus)}
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="col-span-1 md:col-span-2 bg-white rounded-3xl border border-blue-100 p-8 shadow-sm shadow-blue-900/5">
          <h3 className="text-xl font-semibold text-blue-950 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-500" />
            {t.whatIsThis}
          </h3>
          <p className="text-blue-900/80 leading-relaxed mb-6">
            {result.summary}
          </p>
          
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-blue-800 mb-2">{t.recommendation}</h4>
            <p className="text-blue-950 font-medium">
              {result.recommendation}
            </p>
          </div>
        </div>
      </div>

      {/* Ingredients Breakdown */}
      <div className="bg-white rounded-3xl border border-blue-100 p-8 shadow-sm shadow-blue-900/5">
        <h3 className="text-2xl font-semibold text-blue-950 mb-8">{t.breakdown}</h3>
        
        <div className="space-y-8">
          {/* Avoid */}
          {avoidIngredients.length > 0 && (
            <div>
              <h4 className="flex items-center gap-2 text-rose-700 font-semibold mb-4 text-lg border-b border-rose-100 pb-2">
                <XOctagon className="w-5 h-5" />
                {t.toAvoid} ({avoidIngredients.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {avoidIngredients.map((ing, idx) => (
                  <IngredientCard key={idx} ingredient={ing} />
                ))}
              </div>
            </div>
          )}

          {/* Caution */}
          {cautionIngredients.length > 0 && (
            <div>
              <h4 className="flex items-center gap-2 text-amber-700 font-semibold mb-4 text-lg border-b border-amber-100 pb-2">
                <AlertTriangle className="w-5 h-5" />
                {t.withCaution} ({cautionIngredients.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {cautionIngredients.map((ing, idx) => (
                  <IngredientCard key={idx} ingredient={ing} />
                ))}
              </div>
            </div>
          )}

          {/* Safe */}
          {safeIngredients.length > 0 && (
            <div>
              <h4 className="flex items-center gap-2 text-emerald-700 font-semibold mb-4 text-lg border-b border-emerald-100 pb-2">
                <ShieldCheck className="w-5 h-5" />
                {t.safeIngredients} ({safeIngredients.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {safeIngredients.map((ing, idx) => (
                  <IngredientCard key={idx} ingredient={ing} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 pb-12">
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-800 px-6 py-3 rounded-xl font-medium transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
          {t.analyzeAnother}
        </button>
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm shadow-blue-600/20"
        >
          <Share2 className="w-5 h-5" />
          {t.shareResults}
        </button>
      </div>
    </motion.div>
  );
}

const IngredientCard: React.FC<{ ingredient: Ingredient }> = ({ ingredient }) => {
  const getColors = (category: string) => {
    switch (category) {
      case 'avoid': return 'bg-rose-50 border-rose-100 text-rose-950';
      case 'caution': return 'bg-amber-50 border-amber-100 text-amber-950';
      case 'safe': return 'bg-emerald-50 border-emerald-100 text-emerald-950';
      default: return 'bg-gray-50 border-gray-100 text-gray-950';
    }
  };

  const getHalalIcon = (status: string) => {
    switch (status) {
      case 'halal': 
        return (
          <div className="flex items-center justify-center bg-emerald-600 text-white text-[8px] font-bold px-1 rounded-sm h-4 min-w-[28px] leading-none" title="Halal">
            حلال
          </div>
        );
      case 'doubtful': return <HelpCircle className="w-4 h-4 text-amber-500" />;
      case 'haram': return <XCircle className="w-4 h-4 text-rose-600" />;
      default: return null;
    }
  };

  return (
    <div className={`p-4 rounded-2xl border ${getColors(ingredient.category)}`}>
      <div className="flex items-center gap-2 mb-1">
        <h5 className="font-semibold capitalize">{ingredient.name}</h5>
        {getHalalIcon(ingredient.halalStatus)}
      </div>
      <p className="text-sm opacity-80 leading-relaxed">{ingredient.explanation}</p>
    </div>
  );
};
