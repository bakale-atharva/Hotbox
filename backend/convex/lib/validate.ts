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

export function assertPriceCents(value: number, label: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new ConvexError(`${label} must be a positive whole number of cents.`);
  }
}
