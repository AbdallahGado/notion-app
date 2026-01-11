"use client";

import { ArrowLeft, Scale, Gavel, FileText, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const TermsPage = () => {
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
              <Scale className="w-6 h-6 text-indigo-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-slate-900 dark:text-white">
              Terms of Service
            </h1>
          </div>
          <p className="text-slate-500 dark:text-gray-400 font-medium">
            Effective Date: January 11, 2026
          </p>
        </header>

        <article className="prose prose-slate dark:prose-invert max-w-none space-y-10">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">The Agreement</h2>
            <p className="text-slate-600 dark:text-gray-400 leading-relaxed text-base">
              By using Jotion, you agree to these terms. Jotion is a product built for productivity and organization. We expect you to use it responsibly and legally.
            </p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.01] border border-slate-100 dark:border-white/5">
                <Gavel className="w-4 h-4 text-indigo-500 mb-3" />
                <h3 className="m-0 text-sm font-bold text-slate-900 dark:text-white mb-2">Lawful Use</h3>
                <p className="m-0 text-xs text-slate-500 dark:text-gray-400">Do not use Jotion for illegal activities or malicious intent.</p>
            </div>
             <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.01] border border-slate-100 dark:border-white/5">
                <FileText className="w-4 h-4 text-indigo-500 mb-3" />
                <h3 className="m-0 text-sm font-bold text-slate-900 dark:text-white mb-2">Content Ownership</h3>
                <p className="m-0 text-xs text-slate-500 dark:text-gray-400">You retain all rights to the content you create in Jotion.</p>
            </div>
             <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.01] border border-slate-100 dark:border-white/5">
                <Sparkles className="w-4 h-4 text-indigo-500 mb-3" />
                <h3 className="m-0 text-sm font-bold text-slate-900 dark:text-white mb-2">Account Responsibility</h3>
                <p className="m-0 text-xs text-slate-500 dark:text-gray-400">You are responsible for maintaining the security of your account.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">1. Use of Service</h2>
            <p className="text-slate-600 dark:text-gray-400 leading-relaxed text-base">
              You must provide accurate information when creating an account. You are responsible for all activity that occurs under your account. We reserve the right to suspend accounts that violate our community standards.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">2. Intellectual Property</h2>
            <p className="text-slate-600 dark:text-gray-400 leading-relaxed text-base">
              Jotion and its original content (excluding user content), features, and functionality are and will remain the exclusive property of Jotion and its licensors.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">3. Termination</h2>
            <p className="text-slate-600 dark:text-gray-400 leading-relaxed text-base">
              We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
          </section>

        </article>
      </div>
    </div>
  );
};

export default TermsPage;
