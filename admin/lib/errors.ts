import { ConvexError } from "convex/values";

/** Convex mutations throw ConvexError("message") for user-facing failures. */
export function errorMessage(error: unknown): string {
  if (error instanceof ConvexError && typeof error.data === "string") {
    return error.data;
  }
  return "Something went wrong. Please try again.";
}
