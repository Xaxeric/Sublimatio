/**
 * JWT signing/verification secret is read from the environment only.
 * No secret value is committed; see backend/.env.example.
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return secret;
}
