import type { User } from '../types';

/**
 * Full name = `firstName + " " + lastName` (CONTEXT.md). The single source of
 * truth for the User's display label across the list row and detail header.
 */
export function getFullName(
  user: Pick<User, 'firstName' | 'lastName'>,
): string {
  return `${user.firstName} ${user.lastName}`.trim();
}
