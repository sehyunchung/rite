"use client";

import { ReactNode } from "react";
import dynamic from "next/dynamic";
import { AuthProvider } from "./auth-provider";

// Dynamically import ConvexProvider with SSR disabled
const ConvexProviderClient = dynamic(
  () => import("./convex-provider-client").then(mod => ({ default: mod.ConvexProviderClient })),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Initializing...</div>
      </div>
    )
  }
);

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ConvexProviderClient>{children}</ConvexProviderClient>
    </AuthProvider>
  );
}
