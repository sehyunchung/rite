import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConvexReactClient } from "convex/react";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { RouterProvider } from "@tanstack/react-router";
import "./index.css";
import { router } from "./lib/router";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

// Get Clerk configuration from environment
const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPublishableKey) {
  console.warn("Missing Clerk publishable key. Set VITE_CLERK_PUBLISHABLE_KEY in your .env file");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <RouterProvider router={router} />
      </ConvexProviderWithClerk>
    </ClerkProvider>
  </StrictMode>,
);
