import Image from "next/image";
import Lottie from "lottie-react";
import heroLottie from "./hero-lottie.json";

function Heroes() {
  return (
    <div className="relative flex flex-col items-center justify-center max-w-5xl">
      {/* Abstract SVG illustration */}
      <svg
        aria-hidden="true"
        className="absolute -top-8 -left-8 w-[340px] h-[180px] md:w-[480px] md:h-[260px] z-0 opacity-60 pointer-events-none select-none"
        viewBox="0 0 480 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse
          cx="120"
          cy="130"
          rx="120"
          ry="60"
          fill="#6366F1"
          fillOpacity="0.12"
        />
        <ellipse
          cx="360"
          cy="80"
          rx="80"
          ry="40"
          fill="#A5B4FC"
          fillOpacity="0.10"
        />
        <rect
          x="200"
          y="180"
          width="120"
          height="30"
          rx="15"
          fill="#6366F1"
          fillOpacity="0.08"
        />
        <rect
          x="320"
          y="120"
          width="60"
          height="18"
          rx="9"
          fill="#6366F1"
          fillOpacity="0.10"
        />
        <rect
          x="60"
          y="60"
          width="80"
          height="18"
          rx="9"
          fill="#A5B4FC"
          fillOpacity="0.10"
        />
      </svg>
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 overflow-visible w-full">
        {/* Lottie Animation */}
        <div className="w-full md:w-1/3 flex justify-center items-center">
          <Lottie
            animationData={heroLottie}
            className="w-40 h-40 md:w-56 md:h-56"
            loop
            aria-label="Animated workspace illustration"
          />
        </div>
        {/* Product Screenshot Mockup Frame */}
        <div className="relative w-[320px] h-[220px] sm:w-[400px] sm:h-[260px] md:w-[480px] md:h-[320px] glass-card overflow-hidden transform hover:scale-105 transition-all duration-300 animate-float">
          <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-r from-modern-primary-400 via-modern-primary-500 to-modern-accent-400 opacity-40 z-10 rounded-t-2xl" />
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
        {/* Secondary visual for larger screens */}
        <div className="relative w-[220px] h-[220px] sm:w-[260px] sm:h-[260px] md:w-[320px] md:h-[320px] glass-card overflow-hidden hidden md:block animate-float-slow hover:scale-105 transition-all duration-300">
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
    </div>
  );
}

export default Heroes;
