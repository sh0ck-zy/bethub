import { getAutoRemovalConfig } from '../config/autoRemovalConfig';

// Mock DB de jogos publicados
const publishedMatches: Array<{
  id: string;
  kickoffUtc: string;
  isPublished: boolean;
  adminOverrideRemoval?: boolean;
}> = [
  { id: '1', kickoffUtc: '2025-07-12T18:00:00Z', isPublished: true },
  { id: '2', kickoffUtc: '2025-07-12T20:00:00Z', isPublished: true, adminOverrideRemoval: true },
  { id: '3', kickoffUtc: '2025-07-12T15:00:00Z', isPublished: true },
];

export function checkAutoRemoval() {
  const config = getAutoRemovalConfig();
  if (!config.enableAutoRemoval) return [];

  const now = new Date();
  const cutoff = new Date(now.getTime() - config.removeAfterHours * 60 * 60 * 1000);

  const removed: string[] = [];

  for (const match of publishedMatches) {
    if (
      match.isPublished &&
      (!match.adminOverrideRemoval || !config.adminCanOverride) &&
      new Date(match.kickoffUtc) < cutoff
    ) {
      match.isPublished = false;
      removed.push(match.id);
    }
  }
  return removed;
} 