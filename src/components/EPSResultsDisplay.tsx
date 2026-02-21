'use client';

import { motion } from 'framer-motion';
import type { EPSResult } from '@/lib/eps/types';

interface EPSResultsDisplayProps {
  result: EPSResult;
  onReset: () => void;
}

function confidenceClass(confidence: EPSResult['confidence']) {
  if (confidence === 'clear') return 'text-emerald-400';
  if (confidence === 'mixed') return 'text-amber-400';
  return 'text-gray-400';
}

export default function EPSResultsDisplay({ result, onReset }: EPSResultsDisplayProps) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 px-4 py-8">
      <div className="mx-auto w-full max-w-2xl space-y-5">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
        >
          <p className="text-sm text-gray-400">Emotional Possibility Score</p>
          <div className="mt-2 flex items-end gap-3">
            <h1 className="text-6xl font-black text-white">{result.EPS}</h1>
            <p className="pb-1 text-sm text-gray-400">/ 100</p>
          </div>
          <p className="mt-2 text-lg font-semibold text-pink-400">{result.band}</p>
          <p className={`mt-1 text-sm capitalize ${confidenceClass(result.confidence)}`}>
            Confidence: {result.confidence}
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
        >
          <h2 className="text-lg font-semibold text-white">Anchor Insight</h2>
          <p className="mt-2 text-gray-300">{result.anchorInsight}</p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
        >
          <h2 className="text-lg font-semibold text-white">Directional Insights</h2>
          <div className="mt-3 space-y-3">
            <InsightCard
              title="Investment Balance"
              chip={result.supportingInsights.investmentBalance.direction}
              text={result.supportingInsights.investmentBalance.explanation}
            />
            <InsightCard
              title="Connection Direction"
              chip={result.supportingInsights.connectionDirection.trend}
              text={result.supportingInsights.connectionDirection.explanation}
            />
            <InsightCard
              title="Reliability Signal"
              chip={result.supportingInsights.reliability.level}
              text={result.supportingInsights.reliability.explanation}
            />
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
        >
          <h2 className="text-lg font-semibold text-white">Guardrails Applied</h2>
          {result.capsTriggered.length === 0 ? (
            <p className="mt-2 text-gray-300">No score caps were triggered.</p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {result.capsTriggered.map((cap) => (
                <span
                  key={cap}
                  className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-300"
                >
                  {cap}
                </span>
              ))}
            </div>
          )}
        </motion.section>

        <button
          onClick={onReset}
          className="w-full rounded-xl bg-white/10 px-4 py-3 font-semibold text-white transition-colors hover:bg-white/20"
        >
          Analyze Another Chat
        </button>
      </div>
    </main>
  );
}

function InsightCard({ title, chip, text }: { title: string; chip: string; text: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="font-medium text-white">{title}</p>
        <span className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-xs capitalize text-gray-300">
          {chip}
        </span>
      </div>
      <p className="mt-1 text-sm text-gray-400">{text}</p>
    </div>
  );
}
