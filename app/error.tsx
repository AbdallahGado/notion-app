"use client";

import { useEffect, useState } from "react";
import { RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 rounded-3xl glass-card border border-red-100 dark:border-red-900/30 shadow-2xl text-center relative overflow-hidden"
      >
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 via-orange-400 to-red-400" />
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl" />

        <motion.button
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => reset()}
          className="w-full py-3 px-6 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-red-500/25 transition-all duration-300 flex items-center justify-center gap-2 mb-6 group"
        >
          <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
          Reload Page
        </motion.button>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center justify-center gap-1 mx-auto transition-colors"
        >
          {showDetails ? (
            <>
              Hide Error Details <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Show Error Details <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-100 dark:border-red-900/50 text-left">
                <p className="text-xs font-mono text-red-800 dark:text-red-200 break-words">
                  {error.message}
                </p>
                {error.stack && (
                  <pre className="mt-2 text-[10px] text-gray-500 dark:text-gray-400 overflow-x-auto whitespace-pre-wrap">
                    {error.stack}
                  </pre>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

