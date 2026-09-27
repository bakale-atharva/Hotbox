/** Readable message from a Clerk method's `{ error }` result. */
export function clerkMessage(error: unknown): string {
  if (error && typeof error === 'object') {
    const e = error as { longMessage?: string; message?: string };
    if (e.longMessage) return e.longMessage;
    if (e.message) return e.message;
  }
  return 'Something went wrong. Please try again.';
}
