import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ClerkProvider } from "@clerk/clerk-react";
import { RouterProvider } from "@tanstack/react-router";
import "./index.css";
import { router } from "./lib/router";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

// Get Clerk publishable key from environment
const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string;

if (!clerkPublishableKey) {
  console.warn("Missing Clerk publishable key. Set VITE_CLERK_PUBLISHABLE_KEY in your .env file");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <ConvexProvider client={convex}>
        <RouterProvider router={router} />
      </ConvexProvider>
    </ClerkProvider>
  </StrictMode>,
);
