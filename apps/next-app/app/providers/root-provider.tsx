"use client";

import { ReactNode } from "react";
import { ConvexProviderClient } from "./convex-provider-client";
import { AuthProvider } from "./auth-provider";

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ConvexProviderClient>{children}</ConvexProviderClient>
    </AuthProvider>
  );
}
