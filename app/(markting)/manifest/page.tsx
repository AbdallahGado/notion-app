"use client";

import { ArrowLeft, Zap, Target, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const ManifestPage = () => {
  return (
    <div className="min-h-full bg-white dark:bg-[#111] transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-8 group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to home
          </Button>
        </Link>
        
        <header className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-3 h-3" />
            The Jotion Manifest
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-slate-900 dark:text-white mb-6">
            A workspace for <span className="text-indigo-500">thought.</span>
          </h1>
          <p className="text-xl text-slate-500 dark:text-gray-400 leading-relaxed font-medium">
            Electronic tools should stay out of your way. They should be invisible, yet powerful. They should help you think, not distract you from it.
          </p>
        </header>

        <article className="prose prose-slate dark:prose-invert max-w-none space-y-12">
          <section>
            <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-indigo-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white m-0">The Problem with Clutter</h2>
            </div>
            <p className="text-slate-600 dark:text-gray-400 text-lg leading-relaxed">
              Most productivity tools today are built to maximize engagement. They want you to stay in the app, clicking buttons, and checking notifications. We believe the best tools are built to maximize <strong>output</strong>. Jotion is designed to be opened, used to capture a thought or organize a project, and then closed so you can get back to what matters.
            </p>
          </section>

          <section>
             <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                    <Target className="w-5 h-5 text-indigo-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white m-0">Our Core Principles</h2>
            </div>
            <ul className="space-y-4 list-none p-0">
               <li className="flex gap-4 p-6 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                  <div className="font-bold text-indigo-500">01.</div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Speed is a Feature</h3>
                    <p className="text-slate-500 dark:text-gray-400 m-0">If it&apos;s not instant, it&apos;s broken. We obsess over milliseconds so your brain never has to wait for the screen.</p>
                  </div>
               </li>
               <li className="flex gap-4 p-6 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                  <div className="font-bold text-indigo-500">02.</div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Frictionless Capture</h3>
                    <p className="text-slate-500 dark:text-gray-400 m-0">Ideas are fleeting. Capturing them should be the easiest thing you do all day.</p>
                  </div>
               </li>
               <li className="flex gap-4 p-6 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                  <div className="font-bold text-indigo-500">03.</div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Depth over Breadth</h3>
                    <p className="text-slate-500 dark:text-gray-400 m-0">We won&apos;t build every requested feature. We will build the right ones, and we will build them perfectly.</p>
                  </div>
               </li>
            </ul>
          </section>

          <section className="pt-8 border-t border-slate-100 dark:border-white/5">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">The Future is Connected</h2>
            <p className="text-slate-600 dark:text-gray-400 text-lg leading-relaxed">
              Jotion is not just a note-taking app. It is a second brain. A place where your tasks, documents, and research live in a unified, networked structure. We are building the operating system for your ideas.
            </p>
            <p className="text-slate-600 dark:text-gray-400 text-lg leading-relaxed mt-6 italic">
              Join us in redefining how work happens.
            </p>
            <div className="mt-12 flex flex-col items-center">
              <Link href="/documents">
                <Button size="lg" className="rounded-full px-8 h-12 bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-200">
                  Try Jotion Today
                </Button>
              </Link>
              <p className="text-xs text-slate-400 mt-4 font-medium uppercase tracking-[0.2em]">Published by the Jotion Team</p>
            </div>
          </section>
        </article>
      </div>
    </div>
  );
};

export default ManifestPage;
