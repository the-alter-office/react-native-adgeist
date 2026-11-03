import type { HomePill, HomeSegment, IContentItem } from '../../types/content';
import { CATALOG } from './catalog';

const byPill = (pill: HomePill): IContentItem[] =>
  pill === 'ALL' ? CATALOG : CATALOG.filter((item) => item.sport === pill);

export function buildHomeSegments(pill: HomePill): HomeSegment[] {
  const items = byPill(pill);
  const live = items.filter((item) => item.isLive);
  const vod = items.filter((item) => !item.isLive);
  const segments: HomeSegment[] = [{ type: 'HERO', id: 'hero', items: [...live, ...vod].slice(0, 4) }];
  if (live.length > 0) segments.push({ type: 'RAIL', id: 'live-now', title: 'Live Now', items: live });
  if (vod.length > 0) segments.push({ type: 'RAIL', id: 'highlights', title: 'Highlights & Replays', items: vod });
  const premium = items.filter((item) => item.isPremium);
  if (premium.length > 0) segments.push({ type: 'RAIL', id: 'premium', title: 'Premium', items: premium });
  return segments;
}
