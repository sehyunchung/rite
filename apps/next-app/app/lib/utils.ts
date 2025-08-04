import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Validate if a string is a valid Convex ID format
 * Convex IDs are typically in format: jd7dkmd0a6d7sjx0h0hmfbfwfh6r21qp
 * They are 32 character strings with alphanumeric characters
 */
export function isValidConvexId(id: string): boolean {
  return /^[a-z0-9]{32}$/.test(id);
}
