"use client";

import { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";

export const ConvexClintProvider = ({ children }: { children: ReactNode }) => {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!clerkKey || clerkKey === "dummy") {
    throw new Error(
      "Clerk publishable key is not set. Please add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY to your .env.local file. " +
      "Get your key from https://dashboard.clerk.com/last-active?path=api-keys"
    );
  }

  const convex = convexUrl ? new ConvexReactClient(convexUrl) : new ConvexReactClient("https://dummy.convex.cloud");

  return (
    <ClerkProvider
      publishableKey={clerkKey}
    >
      <ConvexProviderWithClerk useAuth={useAuth} client={convex}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
};
