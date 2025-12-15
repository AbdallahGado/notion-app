"use client";
import { Navbar } from "./_components/navbar";
import { CheckCircle, Users, Shield, Star, ArrowUp } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Lottie from "lottie-react";
import heroLottie from "./_components/hero-lottie.json";
import Footer from "./_components/footer";

const features = [
  // {
  //   icon: <Sparkles className="h-8 w-8 text-indigo-500" />,
  //   title: "AI-Powered Notes",
  //   description:
  //     "Generate, summarize, and organize your notes with built-in AI tools.",
  // },
  {
    icon: <Users className="h-8 w-8 text-green-500" />,
    title: "Real-time Collaboration",
    description:
      "Work together with your team in real time, anywhere in the world.",
  },
  {
    icon: <CheckCircle className="h-8 w-8 text-blue-500" />,
    title: "Task Management",
    description: "Track your tasks, set reminders, and stay productive.",
  },
  {
    icon: <Shield className="h-8 w-8 text-yellow-500" />,
    title: "Secure & Private",
    description:
      "Your data is encrypted and protected with industry best practices.",
  },
];

const testimonials = [
  {
    name: "Alex Johnson",
    quote:
      "Jotion has completely changed the way my team collaborates. The AI features are a game changer!",
    avatar: "/documents.png",
    rating: 5,
  },
  {
    name: "Maria Lee",
    quote:
      "I love the clean design and how easy it is to organize my projects. Highly recommended!",
    avatar: "/reading.png",
    rating: 5,
  },
  {
    name: "Chris Patel",
    quote:
      "The real-time editing and task management keep my workflow smooth and efficient.",
    avatar: "/documents-dark.png",
    rating: 4,
  },
];

// Typewriter effect for headline
const typewriterPhrases = [
  "Your Ideas, Documents, & Plans. Unified.",
  "AI-Powered Notes & Collaboration.",
  "Organize. Create. Achieve. Together.",
];

function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return visible ? (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-center group">
      <button
        aria-label="Scroll to top"
        tabIndex={0}
        className="p-4 rounded-full bg-indigo-600 text-white shadow-xl hover:bg-indigo-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-400 transition-all duration-200 text-2xl"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <ArrowUp className="h-7 w-7" aria-hidden="true" />
      </button>
      <span className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 mt-2 px-3 py-1 rounded bg-gray-900 text-white text-xs shadow transition-opacity duration-200 select-none pointer-events-none">
        Back to top
      </span>
    </div>
  ) : null;
}

// Simple fade-in on scroll hook
function useFadeInOnScroll() {
  const ref = useRef(null);

  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new window.IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, visible] as const;
}

const MarketingPage = () => {
  // Typewriter state
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [typing, setTyping] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (typing) {
      if (displayedText.length < typewriterPhrases[headlineIndex].length) {
        timeout = setTimeout(() => {
          setDisplayedText(
            typewriterPhrases[headlineIndex].slice(0, displayedText.length + 1)
          );
        }, 40);
      } else {
        setTyping(false);
        timeout = setTimeout(() => setTyping(true), 1500);
      }
    } else {
      timeout = setTimeout(() => {
        setDisplayedText("");
        setHeadlineIndex((headlineIndex + 1) % typewriterPhrases.length);
      }, 500);
    }
    return () => clearTimeout(timeout);
  }, [displayedText, typing, headlineIndex]);

  const [heroRef, heroVisible] = useFadeInOnScroll();
  const [featuresRef, featuresVisible] = useFadeInOnScroll();
  const [testimonialsRef, testimonialsVisible] = useFadeInOnScroll();
  const [faqRef, faqVisible] = useFadeInOnScroll();

  return (
    <div className="flex flex-col min-h-full bg-gradient-to-br from-white to-indigo-50 dark:from-[#18181B] dark:to-[#23233a] relative modern-bg-pattern">
      {/* Animated SVG background shapes for hero section */}
      <div className="absolute top-0 left-0 w-full h-[500px] pointer-events-none z-0 overflow-hidden">
        <svg
          className="absolute left-[-100px] top-[-80px] animate-spin-slow opacity-30"
          width="400"
          height="400"
          viewBox="0 0 400 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="200" cy="200" r="180" fill="url(#paint0_radial)" />
          <defs>
            <radialGradient
              id="paint0_radial"
              cx="0"
              cy="0"
              r="1"
              gradientTransform="translate(200 200) rotate(90) scale(180)"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#6366F1" />
              <stop offset="1" stopColor="#A5B4FC" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
        <svg
          className="absolute right-[-120px] top-[100px] animate-pulse opacity-20"
          width="300"
          height="300"
          viewBox="0 0 300 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <ellipse
            cx="150"
            cy="150"
            rx="140"
            ry="100"
            fill="url(#paint1_radial)"
          />
          <defs>
            <radialGradient
              id="paint1_radial"
              cx="0"
              cy="0"
              r="1"
              gradientTransform="translate(150 150) rotate(90) scale(100 140)"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#A5B4FC" />
              <stop offset="1" stopColor="#6366F1" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </div>
      <Navbar />
      {/* Skip to Content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only absolute top-2 left-2 z-50 bg-indigo-600 text-white px-4 py-2 rounded shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      >
        Skip to Content
      </a>
      {/* Hero Section with fade-in */}
      <section
        id="main-content"
        ref={heroRef}
        className={`relative w-full flex flex-col items-center justify-center gap-10 px-6 pt-24 pb-16 max-w-7xl mx-auto transition-all duration-1000 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        {/* Subtle SVG background pattern */}
        <svg
          aria-hidden="true"
          className="absolute inset-0 w-full h-full z-0 pointer-events-none"
          viewBox="0 0 800 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ mixBlendMode: "multiply", opacity: 0.08 }}
        >
          <defs>
            <pattern
              id="dots"
              x="0"
              y="0"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="2" fill="#6366F1" />
            </pattern>
          </defs>
          <rect width="800" height="400" fill="url(#dots)" />
        </svg>
        {/* Hero Text */}
        <div className="flex flex-col items-center justify-center text-center z-10">
          <h1 className="text-4xl sm:text-6xl font-extrabold mb-6 leading-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-400 bg-clip-text text-transparent"></h1>
          <h1 className="text-4xl sm:text-6xl font-extrabold mb-6 leading-tight text-gradient-modern">
            Unify Your Work.
          </h1>
          <p className="text-lg sm:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-xl">
            Jotion brings your notes, docs, and tasks together in one beautiful,
            collaborative workspace.
          </p>
          <button
            className="mb-8 px-10 py-4 rounded-2xl font-bold text-lg focus-modern relative overflow-hidden group bg-gradient-to-r from-modern-primary-500 via-modern-primary-600 to-modern-accent-500 hover:from-modern-primary-600 hover:via-modern-primary-700 hover:to-modern-accent-600 text-white shadow-modern-glow hover:shadow-modern-glow-strong hover:scale-105 active:scale-95 transition-all duration-300 animate-shimmer"
            aria-label="Get Started Free with Jotion"
            onClick={() => router.push("/documents")}
          >
            <span className="relative z-10">Get Started Free</span>
          </button>
        </div>
        {/* Hero Visual */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 overflow-visible w-full">
          {/* Left Card */}
          <div className="relative w-[200px] h-[200px] bg-white/80 dark:bg-[#23233a]/80 rounded-2xl shadow-2xl border border-indigo-100 dark:border-[#23233a] overflow-hidden transform hover:scale-105 transition-transform duration-300 animate-float">
            <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 opacity-30 z-10" />
            <Image
              src="/documents.png"
              alt="Documents"
              fill
              className="object-contain dark:hidden"
              sizes="auto"
              priority={true}
            />

            <Image
              src="/documents-dark.png"
              alt="Documents"
              fill
              className="object-contain hidden dark:block"
              sizes="auto"
              priority={true}
            />
          </div>
          {/* Animation (center) */}
          <div className="w-full md:w-[400px] flex justify-center items-center">
            <Lottie
              animationData={heroLottie}
              className="w-60 h-60 md:w-96 md:h-96"
              loop
              aria-label="Animated workspace illustration"
            />
          </div>
          {/* Right Card */}
          <div className="relative w-[200px] h-[200px] bg-white/80 dark:bg-[#23233a]/80 rounded-2xl shadow-2xl border border-indigo-100 dark:border-[#23233a] overflow-hidden transform hover:scale-105 transition-transform duration-300 animate-float-slow">
            <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 opacity-30 z-10" />
            <Image
              src="/reading.png"
              alt="Ideas"
              fill
              className="object-contain dark:hidden"
              sizes="auto"
            />
            <Image
              src="/reading-dark.png"
              alt="Ideas"
              fill
              className="object-contain hidden dark:block"
              sizes="auto"
            />
          </div>
        </div>
      </section>
      {/* SVG Divider: Hero -> Features */}
      <div className="w-full overflow-hidden leading-none">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-12 md:h-20"
        >
          <path
            fill="#F9FAFB"
            d="M0,32 C360,80 1080,0 1440,48 L1440,80 L0,80 Z"
          />
        </svg>
      </div>
      {/* Features Section with fade-in */}
      <section
        ref={featuresRef}
        className={`py-20 px-4 bg-white dark:bg-[#18181B] transition-all duration-1000 ${featuresVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-left mb-12 text-gray-900 dark:text-white max-w-6xl mx-auto">
          Features
        </h2>
        <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto justify-center">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="flex-1 flex flex-row md:flex-col items-center md:items-start glass-card card-hover-lift min-w-[220px] max-w-full md:max-w-xs mb-4 md:mb-0 animate-float"
            >
              <div className="flex-shrink-0 mr-4 md:mr-0 md:mb-4">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-indigo-700 dark:text-indigo-300 mb-1">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* Trusted by Section with fade-in */}
      <section
        ref={testimonialsRef}
        className={`py-8 px-4 bg-white dark:bg-[#18181B] transition-all duration-1000 ${testimonialsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          <h3 className="text-md font-semibold text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider">
            Trusted by teams worldwide
          </h3>
          <div className="flex flex-row flex-wrap justify-center items-center gap-8 opacity-80">
            <Image
              src="/logo.svg"
              alt="Company 1"
              width={80}
              height={32}
              className="h-8 w-auto"
            />
            <Image
              src="/logo-dark.svg"
              alt="Company 2"
              width={80}
              height={32}
              className="h-8 w-auto"
            />
            <Image
              src="/logo.svg"
              alt="Company 3"
              width={80}
              height={32}
              className="h-8 w-auto"
            />
            <Image
              src="/logo-dark.svg"
              alt="Company 4"
              width={80}
              height={32}
              className="h-8 w-auto"
            />
            {/* Replace with real company logos as needed */}
          </div>
        </div>
      </section>
      {/* SVG Divider: Features -> Testimonials */}
      <div className="w-full overflow-hidden leading-none rotate-180">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-12 md:h-20"
        >
          <path
            fill="#F9FAFB"
            d="M0,32 C360,80 1080,0 1440,48 L1440,80 L0,80 Z"
          />
        </svg>
      </div>
      {/* Testimonials Section with fade-in */}
      <section
        ref={testimonialsRef}
        className={`py-20 px-4 bg-gray-50 dark:bg-[#23233a] transition-all duration-1000 ${testimonialsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-left mb-12 text-gray-900 dark:text-white max-w-4xl mx-auto">
          What Our Users Say
        </h2>
        <div className="overflow-x-auto">
          <div className="flex gap-6 md:gap-8 max-w-4xl mx-auto pb-2 md:pb-0">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="min-w-[280px] max-w-xs flex-1 bg-white/70 dark:bg-[#18181B]/70 rounded-xl shadow-2xl backdrop-blur-md p-6 border border-gray-100 dark:border-[#23233a] flex flex-col justify-between items-start"
              >
                <div className="flex items-center gap-4 mb-4">
                  <Image
                    src={t.avatar}
                    alt={`Avatar of ${t.name}`}
                    width={48}
                    height={48}
                    className="h-12 w-12 min-w-12 rounded-full object-cover border-2 border-indigo-400"
                  />
                  <div>
                    <span className="block font-semibold text-indigo-600 dark:text-indigo-300 text-base">
                      {t.name}
                    </span>
                    {/* Optionally add user role or company here */}
                  </div>
                </div>
                <p className="text-base italic mb-4 text-gray-700 dark:text-gray-300">
                  “{t.quote}”
                </p>
                <div className="flex gap-1 mb-2">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                  {[...Array(5 - t.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 text-gray-300 dark:text-gray-600"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* FAQ Section with fade-in */}
      <section
        ref={faqRef}
        className={`py-20 px-4 bg-white dark:bg-[#18181B] transition-all duration-1000 ${faqVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        <div className="max-w-2xl mx-auto bg-white dark:bg-[#23233a] rounded-xl shadow-lg p-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-gray-900 dark:text-white text-center">
            Frequently Asked Questions
          </h2>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {/* FAQ Item 1 */}
            <details className="group py-4" open>
              <summary className="flex items-center justify-between cursor-pointer font-semibold text-gray-800 dark:text-gray-200 text-lg focus:outline-none">
                <span>Is Jotion free to use?</span>
                <svg
                  className="h-5 w-5 text-gray-400 group-open:rotate-90 transition-transform duration-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </summary>
              <div className="mt-2 text-gray-600 dark:text-gray-300 text-sm pl-1">
                Yes! Jotion offers a generous free plan for individuals and
                small teams. Paid plans are available for advanced features.
              </div>
            </details>
            {/* FAQ Item 2 */}
            <details className="group py-4">
              <summary className="flex items-center justify-between cursor-pointer font-semibold text-gray-800 dark:text-gray-200 text-lg focus:outline-none">
                <span>Can I collaborate with my team in real time?</span>
                <svg
                  className="h-5 w-5 text-gray-400 group-open:rotate-90 transition-transform duration-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </summary>
              <div className="mt-2 text-gray-600 dark:text-gray-300 text-sm pl-1">
                Absolutely! Jotion is built for real-time collaboration, so you
                and your team can work together seamlessly.
              </div>
            </details>
            {/* FAQ Item 3 */}
            <details className="group py-4">
              <summary className="flex items-center justify-between cursor-pointer font-semibold text-gray-800 dark:text-gray-200 text-lg focus:outline-none">
                <span>Is my data secure?</span>
                <svg
                  className="h-5 w-5 text-gray-400 group-open:rotate-90 transition-transform duration-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </summary>
              <div className="mt-2 text-gray-600 dark:text-gray-300 text-sm pl-1">
                Yes, your data is encrypted and protected with industry best
                practices. Privacy and security are our top priorities.
              </div>
            </details>
            {/* FAQ Item 4 */}
            <details className="group py-4">
              <summary className="flex items-center justify-between cursor-pointer font-semibold text-gray-800 dark:text-gray-200 text-lg focus:outline-none">
                <span>Can I import my notes from other apps?</span>
                <svg
                  className="h-5 w-5 text-gray-400 group-open:rotate-90 transition-transform duration-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </summary>
              <div className="mt-2 text-gray-600 dark:text-gray-300 text-sm pl-1">
                Yes! Jotion supports importing notes from popular apps. Check
                our documentation for supported formats and instructions.
              </div>
            </details>
            {/* FAQ Item 5 */}
            <details className="group py-4">
              <summary className="flex items-center justify-between cursor-pointer font-semibold text-gray-800 dark:text-gray-200 text-lg focus:outline-none">
                <span>How do I contact support?</span>
                <svg
                  className="h-5 w-5 text-gray-400 group-open:rotate-90 transition-transform duration-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </summary>
              <div className="mt-2 text-gray-600 dark:text-gray-300 text-sm pl-1">
                You can contact our support team anytime via the Help section in
                the app or by emailing support@jotion.com.
              </div>
            </details>
          </div>
        </div>
      </section>
      <Footer />
      <ScrollToTopButton />
      {/* Landmark role for main content */}
      <div role="main" aria-label="Jotion marketing main content" />
    </div>
  );
};

export default MarketingPage;
