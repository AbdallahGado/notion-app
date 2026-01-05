"use client";

export const dynamic = 'force-dynamic';

import {
  ArrowRight,
  Zap,
  Command,
  Hexagon,
  Activity,
  Globe,
  Layout,
  Users,
  Shield,
  ChevronRight,
  Plus,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Hook for scroll animations (fade-in)
 */
function useFadeInOnScroll() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect(); // Trigger once
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, visible] as const;
}

const features = [
  {
    icon: <Users className="w-5 h-5" />,
    title: "Real-time Collaboration",
    description: "Write, edit, and comment together in real time. See changes as they happen.",
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Instant AI",
    description: "Ask AI to write, rewrite, summarize, or translate anything. Built directly into the editor.",
  },
  {
    icon: <Layout className="w-5 h-5" />,
    title: "Infinite Nesting",
    description: "Create pages inside pages. Organize your workspace exactly how you want it.",
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: "Publish to Web",
    description: "Turn any page into a public website with one click. SEO optimized and fast.",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Enterprise Security",
    description: "Bank-grade encryption, SAML SSO, and advanced permission controls.",
  },
  {
    icon: <Command className="w-5 h-5" />,
    title: "Keyboard First",
    description: "Navigate and edit without ever touching your mouse. Speed is our priority.",
  },
];

const testimonials = [
  {
    quote: "It's simply the best tool we've used. Clean, fast, and stays out of your way.",
    name: "Alex J.",
    role: "Product at Linear",
    avatar: "/documents.png",
  },
  {
    quote: "The AI features have completely replaced our other writing tools. Incredible work.",
    name: "Sarah C.",
    role: "Founder",
    avatar: "/reading.png",
  },
  {
    quote: "Finally, a workspace that feels modern. Dark mode is perfect.",
    name: "Mike T.",
    role: "Engineer",
    avatar: "/documents-dark.png",
  },
];

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-200 dark:border-white/10 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center justify-between w-full py-4 text-left group"
      >
         <span className="text-base font-medium text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {question}
         </span>
         <div className={cn("text-slate-400 transition-transform duration-300", isOpen && "rotate-180")}>
            <ChevronRight className="w-5 h-5" />
         </div>
      </button>
      <div className={cn("overflow-hidden transition-all duration-300 ease-in-out", isOpen ? "max-h-96 opacity-100 pb-4" : "max-h-0 opacity-0")}>
         <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
            {answer}
         </p>
      </div>
    </div>
  )
}

const MarketingPage = () => {
  const router = useRouter();
  const [heroRef, heroVisible] = useFadeInOnScroll();
  const [featuresRef, featuresVisible] = useFadeInOnScroll();
  const [ctaRef, ctaVisible] = useFadeInOnScroll();

  return (
    <div className="flex flex-col min-h-full bg-white dark:bg-[#111] transition-colors duration-300 font-sans selection:bg-indigo-500/30">
      
      {/* 1. HERO SECTION (Centered, Clean, CSS App Mockup) */}
      <section 
        ref={heroRef}
        className={cn(
            "relative pt-32 pb-20 px-6 max-w-[1200px] mx-auto w-full flex flex-col items-center text-center transition-all duration-1000",
            heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        )}
      >
        {/* Subtle Background Grid */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-[#111] bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
            <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-indigo-500 opacity-20 blur-[100px]" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-400 mb-8 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer group">
            <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500 group-hover:animate-pulse"></span>
            Jotion 2.0 is here
            <ArrowRight className="w-3 h-3 ml-1 opacity-50 group-hover:translate-x-1 transition-transform" />
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-slate-900 dark:text-white mb-6 max-w-4xl leading-[1.1]">
          Your ideas, <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent animate-gradient bg-300%">unified.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-500 dark:text-gray-400 mb-10 max-w-2xl leading-relaxed">
          The connected workspace where better, faster work happens. <br className="hidden md:block"/> No clutter, just you and your thoughts.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-24">
            <Button 
                onClick={() => router.push("/documents")}
                size="lg"
                className="relative overflow-hidden rounded-full px-8 h-12 text-base font-semibold bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 group"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                Get Started Free
            </Button>
            <Button 
                variant="ghost"
                size="lg"
                className="rounded-full px-8 h-12 text-base font-medium text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-transparent group"
            >
                Read the manifest <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
        </div>

        {/* CSS-ONLY APP MOCKUP (No Images, Low Latency, High Fidelity) */}
        <div className="relative w-full max-w-5xl aspect-[16/9] rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#18181b] shadow-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#111] via-transparent to-transparent z-20 pointer-events-none opacity-20" />
            
            {/* Glow Effect behind mockup */}
             <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 -z-10"></div>
            
            {/* Window Controls */}
            <div className="h-10 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-[#18181b] flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-white/10" />
                    <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-white/10" />
                    <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-white/10" />
                </div>
                <div className="mx-auto w-32 h-4 rounded-md bg-slate-100 dark:bg-white/5" />
            </div>

            <div className="flex h-full">
                {/* Mock Sidebar */}
                <div className="w-60 border-r border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#151518] p-4 flex flex-col gap-4 hidden md:flex">
                    <div className="flex items-center gap-2 px-2 opacity-50">
                        <div className="w-5 h-5 rounded bg-slate-300 dark:bg-white/20" />
                        <div className="w-24 h-3 rounded bg-slate-200 dark:bg-white/10" />
                    </div>
                    <div className="space-y-1 mt-4">
                        {[1,2,3,4].map(i => (
                            <div key={i} className="flex items-center gap-3 px-2 py-1.5 rounded-md text-xs">
                                <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-white/10 opacity-60" />
                                <div className={cn("h-2 rounded bg-slate-200 dark:bg-white/10", i===1 ? "w-20 bg-indigo-200 dark:bg-indigo-500/20" : "w-16")} />
                            </div>
                        ))}
                    </div>
                    <div className="mt-auto px-2">
                         <div className="w-full h-8 rounded-md bg-slate-200 dark:bg-white/5" />
                    </div>
                </div>

                {/* Mock Editor */}
                <div className="flex-1 bg-white dark:bg-[#1c1c1f] p-8 md:p-12 relative">
                     <div className="w-16 h-16 mb-8 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                        <Zap className="w-8 h-8 text-indigo-500" />
                     </div>
                     <div className="h-8 w-3/4 bg-slate-900/5 dark:bg-white/10 rounded-lg mb-6" /> 
                     <div className="space-y-3">
                        <div className="h-4 w-full bg-slate-100 dark:bg-white/5 rounded" />
                        <div className="h-4 w-11/12 bg-slate-100 dark:bg-white/5 rounded" />
                        <div className="h-4 w-5/6 bg-slate-100 dark:bg-white/5 rounded" />
                     </div>

                     {/* Floating Action Menu Mock */}
                     <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-[#252529] shadow-lg">
                        <div className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center transition-colors"><Plus className="w-4 h-4 text-slate-500" /></div>
                        <div className="w-px h-4 bg-slate-200 dark:bg-white/10 mx-1" />
                        <div className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center transition-colors"><Zap className="w-4 h-4 text-amber-500" /></div>
                        <div className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center transition-colors"><Image src="/documents.png" alt="" width={16} height={16} className="rounded-full" /></div>
                     </div>
                </div>
            </div>
        </div>
      </section>


      {/* 2. SOCIAL PROOF (Monochrome, Clean, Marquee) */}
      <section className="py-12 border-y border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#121212] overflow-hidden">
         <style dangerouslySetInnerHTML={{__html: `
            @keyframes marquee {
                0% { transform: translateX(0); }
                100% { transform: translateX(-100%); }
            }
            .animate-marquee {
                animation: marquee 30s linear infinite;
            }
         `}} />
         
         <div className="max-w-[1200px] mx-auto px-6 mb-8 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-gray-600">Powering next-gen teams</p>
         </div>
         
         <div className="relative flex overflow-hidden group">
            <div className="flex animate-marquee min-w-full shrink-0 items-center justify-around gap-24 pr-24 whitespace-nowrap opacity-40 group-hover:opacity-100 transition-opacity duration-500 grayscale group-hover:grayscale-0">
                {[1,2,3,4,5].map((i) => (
                    <div key={i} className="flex items-center gap-12 text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2"><Command className="w-6 h-6"/> <span className="font-bold text-xl">Acme Corp</span></div>
                        <div className="flex items-center gap-2"><Hexagon className="w-6 h-6"/> <span className="font-bold text-xl">Quantum</span></div>
                        <div className="flex items-center gap-2"><Activity className="w-6 h-6"/> <span className="font-bold text-xl">Pulse</span></div>
                        <div className="flex items-center gap-2"><Globe className="w-6 h-6"/> <span className="font-bold text-xl">Global</span></div>
                        <div className="flex items-center gap-2"><Zap className="w-6 h-6"/> <span className="font-bold text-xl">Bolt</span></div>
                    </div>
                ))}
            </div>
             <div className="flex animate-marquee min-w-full shrink-0 items-center justify-around gap-24 pr-24 whitespace-nowrap opacity-40 group-hover:opacity-100 transition-opacity duration-500 grayscale group-hover:grayscale-0">
                {[1,2,3,4,5].map((i) => (
                    <div key={i} className="flex items-center gap-12 text-slate-900 dark:text-white">
                         <div className="flex items-center gap-2"><Command className="w-6 h-6"/> <span className="font-bold text-xl">Acme Corp</span></div>
                        <div className="flex items-center gap-2"><Hexagon className="w-6 h-6"/> <span className="font-bold text-xl">Quantum</span></div>
                        <div className="flex items-center gap-2"><Activity className="w-6 h-6"/> <span className="font-bold text-xl">Pulse</span></div>
                        <div className="flex items-center gap-2"><Globe className="w-6 h-6"/> <span className="font-bold text-xl">Global</span></div>
                        <div className="flex items-center gap-2"><Zap className="w-6 h-6"/> <span className="font-bold text-xl">Bolt</span></div>
                    </div>
                ))}
            </div>
            
            {/* Fade Edges */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-50 dark:from-[#121212] to-transparent z-10"></div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-50 dark:from-[#121212] to-transparent z-10"></div>
         </div>
      </section>

      {/* 3. FEATURES (Spotlight Cards) */}
      <section ref={featuresRef} className={cn("py-32 px-6 max-w-[1200px] mx-auto transition-all duration-1000", featuresVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10")}>
         <div className="mb-20">
             <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">Everything you need.<br/>Nothing you don&apos;t.</h2>
             <p className="text-lg text-slate-600 dark:text-gray-400 max-w-xl">
                 A robust set of tools designed for focus. Crafted with care to help you flow.
             </p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
                <div 
                    key={i} 
                    className="group relative p-8 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#151515] hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all duration-500 hover:shadow-2xl overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-900 dark:text-white mb-6 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                            {f.icon}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{f.title}</h3>
                        <p className="text-slate-500 dark:text-gray-400 leading-relaxed font-medium">{f.description}</p>
                    </div>
                </div>
            ))}
         </div>
      </section>

      {/* 4. TESTIMONIALS (Glass Cards) */}
      <section className="py-24 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#0F0F0F]">
         <div className="max-w-[1200px] mx-auto px-6">
            <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-16">Loved by builders across the world.</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((t, i) => (
                    <div key={i} className="flex flex-col gap-6 p-8 rounded-3xl bg-white dark:bg-[#18181b] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                        <div className="flex items-center gap-1 text-amber-500">
                            {[1,2,3,4,5].map(s => <Zap key={s} className="w-4 h-4 fill-current" />)}
                        </div>
                        <p className="text-lg font-medium text-slate-800 dark:text-gray-200 leading-relaxed">&quot;{t.quote}&quot;</p>
                        <div className="flex items-center gap-4 mt-auto pt-6 border-t border-slate-100 dark:border-white/5">
                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden relative ring-2 ring-white dark:ring-transparent">
                                <Image src={t.avatar} alt={t.name} fill className="object-cover" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-slate-900 dark:text-white">{t.name}</div>
                                <div className="text-xs text-slate-500 dark:text-gray-500 font-medium">{t.role}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
         </div>
      </section>

      {/* 5. CTA SECTION */}
      <section ref={ctaRef} className={cn("py-32 px-6 text-center transition-all duration-1000", ctaVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10")}>
         <h2 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-8 tracking-tighter">Ready to work properly?</h2>
         <Button 
            onClick={() => router.push("/documents")}
            size="lg" 
            className="rounded-full px-10 h-14 text-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
         >
            Get Started &mdash; It&apos;s free
         </Button>
      </section>

      {/* 6. FAQ (Minimal) */}
      <section className="py-20 px-6 max-w-3xl mx-auto w-full">
         <h3 className="text-sm font-bold uppercase text-slate-400 dark:text-gray-600 tracking-widest mb-8">Common Questions</h3>
         <div className="space-y-0">
            <FAQItem question="Is it really free?" answer="Yes. The personal plan is entirely free effectively forever. We make money from enterprise teams who need advanced controls." />
            <FAQItem question="Can I work offline?" answer="Jotion caches your recently accessed pages so you can view them offline, but you need a connection to save changes." />
            <FAQItem question="How do I migrate?" answer="You can import from Notion, Markdown, or HTML in the settings menu. It takes about 10 seconds." />
         </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="py-12 px-6 border-t border-slate-100 dark:border-white/5">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-indigo-500 flex items-center justify-center text-white">
                    <Zap className="w-3 h-3 fill-current" />
                </div>
                <span className="font-bold text-slate-900 dark:text-white">Jotion</span>
            </div>
            <div className="flex gap-8 text-sm text-slate-500 dark:text-gray-500">
                <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer">Privacy</span>
                <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer">Terms</span>
                <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer">Twitter</span>
                <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer">GitHub</span>
            </div>
            <div className="text-xs text-slate-400">
                &copy; 2025 Jotion Inc.
            </div>
        </div>
      </footer>
    </div>
  );
};

export default MarketingPage;
