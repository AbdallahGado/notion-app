"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg p-8 rounded-3xl glass-card border border-indigo-100 dark:border-indigo-900/30 shadow-2xl text-center relative"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400" />
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />

        <motion.div
          initial={{ rotate: -10, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-24 h-24 mx-auto mb-6 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center shadow-inner relative"
        >
          <FileQuestion className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
          <motion.div
            className="absolute -top-2 -right-2 text-4xl"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            🤔
          </motion.div>
        </motion.div>

        <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white tracking-tight">
          Page Not Found
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/documents">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto py-3 px-6 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Go to Documents
            </motion.button>
          </Link>
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto py-3 px-6 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 font-semibold rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back Home
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
