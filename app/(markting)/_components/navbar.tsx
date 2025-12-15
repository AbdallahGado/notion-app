"use client";
import { useScrollTop } from "@/hooks/use-scroll-top";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import { Logo } from "./logo";
import { useConvexAuth } from "convex/react";
import { SignInButton, UserButton } from "@clerk/clerk-react";
import { Spinner } from "@/components/spinner";
import { Link } from "lucide-react";

export const Navbar = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const scrolled = useScrollTop();
  return (
    <nav
      className={cn(
        `z-50 fixed top-0 flex items-center w-full p-6 transition-all duration-300 glass`,
        scrolled && "shadow-modern-strong",
        "hover:shadow-modern-medium"
      )}
      aria-label="Main navigation"
    >
      <Logo />
      <div className="md:ml-auto md:justify-end justify-between w-full flex items-center gap-x-2">
        {isLoading && <Spinner />}
        {!isLoading && !isAuthenticated && (
          <>
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm" aria-label="Log In">
                Log In
              </Button>
            </SignInButton>
            <SignInButton mode="modal">
              <Button variant="outline" size="sm" aria-label="Get Jotion free">
                Get Jotion free
              </Button>
            </SignInButton>
          </>
        )}
        {isAuthenticated && !isLoading && (
          <>
            <Button variant="ghost" size="sm" asChild aria-label="Enter Jotion">
              <Link href="/documents">Enter Jotion</Link>
            </Button>
            <UserButton afterSignOutUrl="/" />
          </>
        )}
        <ModeToggle />
      </div>
      <style jsx global>{`
        .glass-navbar {
          box-shadow: 0 4px 24px 0 rgba(80, 80, 180, 0.08);
          backdrop-filter: blur(16px) saturate(180%);
        }
      `}</style>
    </nav>
  );
};
