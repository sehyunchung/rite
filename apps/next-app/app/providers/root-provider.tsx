"use client";

import { ReactNode } from "react";
import { AuthProvider } from "./auth-provider";
import { ConvexProviderHydrationSafe } from "./convex-provider-hydration-safe";
import { PostHogProviderWrapper } from "./posthog-provider";

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <PostHogProviderWrapper>
      <AuthProvider>
        <ConvexProviderHydrationSafe>{children}</ConvexProviderHydrationSafe>
      </AuthProvider>
    </PostHogProviderWrapper>
  );
}
