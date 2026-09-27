export {};

declare global {
  /**
   * Claims added to the Clerk session token in the Clerk Dashboard:
   * Sessions → Customize session token → { "metadata": "{{user.public_metadata}}" }
   */
  interface CustomJwtSessionClaims {
    metadata?: {
      role?: "admin";
    };
  }
}
