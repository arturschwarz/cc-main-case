import type { User } from '../types';

/** A contiguous run of Users sharing one alphabetical section title. */
export interface UserSection {
  /** Single uppercase letter A–Z, or '#' for empty/non-alphabetic last names. */
  title: string;
  data: User[];
}

/** Section title from a User's last name: its uppercased first letter, or '#'. */
function sectionTitle(user: User): string {
  const first = user.lastName.trim().charAt(0).toUpperCase();
  return first >= 'A' && first <= 'Z' ? first : '#';
}

/**
 * Group a globally-sorted User array into alphabetical sections keyed by the
 * first letter of the last name (matching the last-name sort).
 *
 * The input is already ordered by the server, so equal initials are contiguous;
 * a single O(n) pass appends each User to the trailing section when its title
 * matches, else opens a new one. This is direction-agnostic — an asc list yields
 * A→Z sections, a desc list yields Z→A — and never splits or duplicates a letter
 * across page boundaries because callers rebuild from the full flat array.
 */
export function buildSections(users: User[]): UserSection[] {
  const sections: UserSection[] = [];

  for (const user of users) {
    const title = sectionTitle(user);
    const last = sections[sections.length - 1];
    if (last && last.title === title) {
      last.data.push(user);
    } else {
      sections.push({ title, data: [user] });
    }
  }

  return sections;
}
