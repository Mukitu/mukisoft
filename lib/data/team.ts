import type { TeamMember } from '@/lib/types';
import { assetPaths } from '@/lib/config/assets';

/**
 * People data.
 *
 * MukiSoft Technology is a corporate technology company led by its
 * Founder & CEO. The team data here represents the publicly visible
 * leadership of the company — used in the leadership profile and
 * team pages. As the company grows, additional senior practitioners
 * will be added here with their real names, photos and bios.
 */
export const teamMembers: TeamMember[] = [
  {
    slug: 'mukitu-islam-nishat',
    name: 'Mukitu Islam Nishat',
    role: 'Founder & CEO',
    department: 'Leadership',
    bio: 'Founder and CEO of MukiSoft Technology. Sets the company\'s engineering direction, quality standards and the way the team works with clients. Leads the technical authority on every engagement.',
    photo: assetPaths.founder.primary,
    social: {},
  },
];

export function getTeamMemberBySlug(slug: string) {
  return teamMembers.find((m) => m.slug === slug) ?? null;
}