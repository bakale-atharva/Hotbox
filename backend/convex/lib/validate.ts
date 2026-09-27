import { ConvexError } from "convex/values";

export function cleanName(value: string, label: string, maxLength = 80): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new ConvexError(`${label} is required.`);
  }
  if (trimmed.length > maxLength) {
    throw new ConvexError(`${label} must be at most ${maxLength} characters.`);
  }
  return trimmed;
}

/** Menu positions are 1-based: 1, 2, 3, … */
export function assertSortOrder(value: number): void {
  if (!Number.isInteger(value) || value < 1) {
    throw new ConvexError("Sort order must be a whole number starting at 1.");
  }
}

export function assertPriceCents(value: number, label: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new ConvexError(`${label} must be a positive whole number of cents.`);
  }
}
