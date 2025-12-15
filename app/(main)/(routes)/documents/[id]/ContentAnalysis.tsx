"use client";

import React, { useMemo, memo } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Lightbulb,
} from "lucide-react";

interface ContentInsight {
  type: "warning" | "suggestion" | "success" | "info";
  title: string;
  description: string;
  severity: "low" | "medium" | "high";
  action?: string;
}

interface ContentAnalysisResult {
  readability: number; // 0-100
  clarity: number; // 0-100
  engagement: number; // 0-100
  insights: ContentInsight[];
  suggestions: string[];
}

const analyzeContent = (text: string): ContentAnalysisResult => {
  const insights: ContentInsight[] = [];
  const suggestions: string[] = [];

  // Word count analysis
  const words = text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);
  const avgWordLength = words.reduce((a, w) => a + w.length, 0) / words.length;

  // Readability score (Flesch-Kincaid simplified)
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const avgSentenceLength = words.length / Math.max(sentences.length, 1);

  let readability = 100;
  if (avgSentenceLength > 20) readability -= 15;
  if (avgWordLength > 5.5) readability -= 10;
  readability = Math.max(0, Math.min(100, readability));

  // Clarity analysis
  let clarity = 100;
  const hasShortParagraphs = text
    .split("\n\n")
    .some((p) => p.split(/\s+/).length < 5);
  const hasVariedSentenceLength = sentences.length > 3;

  if (!hasShortParagraphs) clarity -= 20;
  if (!hasVariedSentenceLength) clarity -= 15;

  // Engagement analysis
  let engagement = 60;
  const hasQuestions = /\?/.test(text);
  const hasEmphasis = /[*_~-]/g.test(text);
  const hasNumbers = /\d+/.test(text);
  const hasHeadings = /^#+\s/m.test(text);

  if (hasQuestions) engagement += 10;
  if (hasEmphasis) engagement += 8;
  if (hasNumbers) engagement += 7;
  if (hasHeadings) engagement += 15;

  engagement = Math.min(100, engagement);

  // Generate insights
  if (avgSentenceLength > 25) {
    insights.push({
      type: "warning",
      title: "Long Sentences",
      description: "Some sentences are quite long. Consider breaking them up.",
      severity: "medium",
    });
    suggestions.push(
      "Break long sentences into shorter ones for better readability"
    );
  }

  if (avgWordLength > 6) {
    insights.push({
      type: "suggestion",
      title: "Complex Words",
      description: "Consider using simpler vocabulary.",
      severity: "low",
    });
    suggestions.push(
      "Replace complex words with simpler alternatives where possible"
    );
  }

  if (!hasHeadings && words.length > 100) {
    insights.push({
      type: "suggestion",
      title: "Missing Structure",
      description: "Add headings to improve organization.",
      severity: "medium",
    });
    suggestions.push("Use headings to structure your content");
  }

  if (!hasQuestions && words.length > 200) {
    insights.push({
      type: "info",
      title: "Engagement Tip",
      description: "Try adding questions to engage readers.",
      severity: "low",
    });
    suggestions.push("Consider adding questions to make content more engaging");
  }

  if (readability > 75) {
    insights.push({
      type: "success",
      title: "Excellent Readability",
      description: "Your content is easy to read and understand.",
      severity: "low",
    });
  }

  return {
    readability,
    clarity,
    engagement,
    insights,
    suggestions,
  };
};

const InsightItem = memo(function InsightItem({
  insight,
  delay,
}: {
  insight: ContentInsight;
  delay: number;
}) {
  const icons = {
    warning: AlertCircle,
    suggestion: Lightbulb,
    success: CheckCircle,
    info: AlertCircle,
  };

  const colors = {
    warning:
      "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
    suggestion:
      "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    success:
      "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
    info: "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800",
  };

  const textColors = {
    warning: "text-yellow-800 dark:text-yellow-200",
    suggestion: "text-blue-800 dark:text-blue-200",
    success: "text-green-800 dark:text-green-200",
    info: "text-indigo-800 dark:text-indigo-200",
  };

  const Icon = icons[insight.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className={`p-3 rounded-lg border ${colors[insight.type]}`}
    >
      <div className="flex items-start gap-3">
        <Icon
          className={`h-4 w-4 mt-0.5 flex-shrink-0 ${textColors[insight.type]}`}
        />
        <div className="flex-1">
          <div className={`text-sm font-semibold ${textColors[insight.type]}`}>
            {insight.title}
          </div>
          <div
            className={`text-xs mt-1 ${textColors[insight.type]} opacity-80`}
          >
            {insight.description}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

InsightItem.displayName = "InsightItem";

interface ContentAnalysisProps {
  text: string;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export const ContentAnalysis = memo(function ContentAnalysis({
  text,
  isExpanded = false,
  onToggle,
}: ContentAnalysisProps) {
  const analysis = useMemo(() => analyzeContent(text), [text]);

  if (!text || text.length < 20) {
    return null;
  }

  return (
    <motion.div
      className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-200 dark:border-gray-700"
      >
        <BarChart3 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex-1 text-left">
          Content Analysis
        </span>

        {/* Score Badges */}
        <div className="flex gap-2">
          <motion.div
            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
            whileHover={{ scale: 1.05 }}
          >
            <TrendingUp className="h-3 w-3" />
            {analysis.readability}
          </motion.div>
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="p-4 space-y-4"
        >
          {/* Score Gauges */}
          <div className="grid grid-cols-3 gap-3">
            <ScoreGauge label="Readability" value={analysis.readability} />
            <ScoreGauge label="Clarity" value={analysis.clarity} />
            <ScoreGauge label="Engagement" value={analysis.engagement} />
          </div>

          {/* Insights */}
          {analysis.insights.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Insights
              </h3>
              <div className="space-y-2">
                {analysis.insights.map((insight, index) => (
                  <InsightItem
                    key={`insight-${index}-${insight.title}-${insight.type}`}
                    insight={insight}
                    delay={0}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {analysis.suggestions.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Suggestions
              </h3>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                {analysis.suggestions.map((suggestion, idx) => (
                  <motion.li
                    key={`suggestion-${idx}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: (analysis.insights.length + idx) * 0.05,
                    }}
                    className="flex items-start gap-2"
                  >
                    <span className="text-indigo-500 mt-0.5">•</span>
                    <span>{suggestion}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
});

ContentAnalysis.displayName = "ContentAnalysis";

/**
 * Score gauge visualization
 */
const ScoreGauge = memo(function ScoreGauge({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const getGaugeColor = (val: number) => {
    if (val >= 80) return "from-green-500 to-emerald-500";
    if (val >= 60) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-pink-500";
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center">
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${getGaugeColor(value)}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 0.5 }}
        />
        <motion.div
          className="text-sm font-bold text-gray-900 dark:text-gray-100"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          {value}
        </motion.div>
      </div>
      <span className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center">
        {label}
      </span>
    </div>
  );
});

ScoreGauge.displayName = "ScoreGauge";
