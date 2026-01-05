"use client";

import { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";

export const ConvexClintProvider = ({ children }: { children: ReactNode }) => {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  console.log("Convex URL:", convexUrl);
  console.log("Clerk Key:", clerkKey ? "Set" : "Not set");

  if (!clerkKey || clerkKey === "dummy") {
    throw new Error(
      "Clerk publishable key is not set. Please add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY to your .env.local file. " +
      "Get your key from https://dashboard.clerk.com/last-active?path=api-keys"
    );
  }

  if (!convexUrl || convexUrl === "https://dummy.convex.cloud") {
    console.error("Convex URL is missing or dummy:", convexUrl);
    throw new Error(
      "Convex URL is not set. Please add NEXT_PUBLIC_CONVEX_URL to your .env.local file. " +
      "Get your URL from https://dashboard.convex.dev or run `npx convex dev` to set it automatically."
    );
  }

  const convex = new ConvexReactClient(convexUrl);

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
