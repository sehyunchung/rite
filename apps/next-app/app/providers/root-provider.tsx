"use client";

import { ReactNode } from "react";
import { AuthProvider } from "./auth-provider";
import { ConvexProviderHydrationSafe } from "./convex-provider-hydration-safe";

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ConvexProviderHydrationSafe>{children}</ConvexProviderHydrationSafe>
    </AuthProvider>
  );
}
