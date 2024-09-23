"use client";

import { Spinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/clerk-react";
import { ArrowRight } from "lucide-react";
import { useConvexAuth } from "convex/react";
import Link from "next/link";
export const Heading = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();

  return (
    <div className="space-y-4 max-w-3xl">
      <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold ">
        Your Ideas, Documents, & Plans. Unified. welcome to{" "}
        <span className="hover:underline  text-indigo-400">Jotion</span>
      </h1>
      <h3 className="text-base sm:text-xl md:text-2xl">
        Jotion is the connected workspace where <br /> better faster work
        happens.
      </h3>
      <div className=" w-full flex items-center justify-center ">
        {isLoading && <Spinner size="lg" />}
      </div>
      {isAuthenticated && !isLoading && (
        <Link href="/documents">
          <Button variant="outline">
            <>
              <span>Enter Jotion</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          </Button>
        </Link>
      )}
      {!isAuthenticated && !isLoading && (
        <SignInButton mode="modal">
          <Button variant="outline">
            <>
              <span>Sign In for free</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          </Button>
        </SignInButton>
      )}
    </div>
  );
};
