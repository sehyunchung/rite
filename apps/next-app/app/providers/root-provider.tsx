"use client";

import { ReactNode } from "react";
import { AuthProvider } from "./auth-provider";
import { ConvexProviderHydrationSafe } from "./convex-provider-hydration-safe";
import { PostHogProviderWrapper } from "./posthog-provider";
import { Toaster } from "sonner";

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <PostHogProviderWrapper>
      <AuthProvider>
        <ConvexProviderHydrationSafe>
          {children}
          <Toaster 
            position="top-right"
            closeButton
            richColors
            theme="dark"
          />
        </ConvexProviderHydrationSafe>
      </AuthProvider>
    </PostHogProviderWrapper>
  );
}
