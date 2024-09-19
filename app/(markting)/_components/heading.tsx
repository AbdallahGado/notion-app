"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const Heading = () => {
  return (
    <div className="space-y-4 max-w-3xl">
      <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold ">
        Your Ideas, Documents, & Plans. Unified. welcome to{" "}
        <span className="underline">Jotion</span>
      </h1>
      <h3 className="text-base sm:text-xl md:text-2xl">
        Jotion is the connected workspace where <br /> better faster work happens.
      </h3>
      <Button variant="outline">
        Enter Jotion
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
};
