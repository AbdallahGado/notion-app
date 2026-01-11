"use client";

import { ArrowLeft, ShieldCheck, Lock, Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const PrivacyPage = () => {
  return (
    <div className="min-h-full bg-white dark:bg-[#111] transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-8 group text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Home
          </Button>
        </Link>
        
        <header className="mb-16 border-b border-slate-100 dark:border-white/5 pb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-indigo-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-slate-900 dark:text-white">
              Privacy Policy
            </h1>
          </div>
          <p className="text-slate-500 dark:text-gray-400 font-medium">
            Last updated: January 11, 2026
          </p>
        </header>

        <article className="prose prose-slate dark:prose-invert max-w-none space-y-10">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Introduction</h2>
            <p className="text-slate-600 dark:text-gray-400 leading-relaxed text-base">
              At Jotion, your privacy is our priority. This policy explains how we collect, use, and protect your personal information when you use our services. We believe in total transparency and data sovereignty—your data belongs to you.
            </p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-white/[0.01]">
              <div className="flex items-center gap-3 mb-3">
                <Lock className="w-4 h-4 text-indigo-500" />
                <h3 className="m-0 text-base font-bold text-slate-900 dark:text-white">Data Security</h3>
              </div>
              <p className="m-0 text-sm text-slate-500 dark:text-gray-400">All data is encrypted in transit and at rest using bank-grade protocols.</p>
            </div>
            <div className="p-6 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-white/[0.01]">
               <div className="flex items-center gap-3 mb-3">
                <Eye className="w-4 h-4 text-indigo-500" />
                <h3 className="m-0 text-base font-bold text-slate-900 dark:text-white">Transparency</h3>
              </div>
              <p className="m-0 text-sm text-slate-500 dark:text-gray-400">We never sell your data to third parties. Your content is private by default.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Information We Collect</h2>
            <p className="text-slate-600 dark:text-gray-400 leading-relaxed text-base">
              When you create an account, we collect basic profile information (name, email) via our authentication provider, Clerk. We also store the content you create within the app to sync it across your devices via Convex.
            </p>
            <ul className="text-slate-600 dark:text-gray-400 space-y-2 mt-4 text-base">
              <li>• Account credentials and profile information</li>
              <li>• Documents, notes, and uploaded files</li>
              <li>• Usage metadata for performance optimization</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">How We Use Your Data</h2>
            <p className="text-slate-600 dark:text-gray-400 leading-relaxed text-base">
              We primarily use your data to provide, maintain, and improve the Jotion experience. Specifically:
            </p>
            <ul className="text-slate-600 dark:text-gray-400 space-y-2 mt-4 text-base">
              <li>• To synchronize your content in real-time</li>
              <li>• To provide search and organization features</li>
              <li>• To respond to support requests and fix bugs</li>
            </ul>
          </section>

        </article>
      </div>
    </div>
  );
};

export default PrivacyPage;
