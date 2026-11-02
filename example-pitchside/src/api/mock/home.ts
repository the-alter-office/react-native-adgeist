import type { HomePill, HomeSegment, IContentItem } from '../../types/content';
import { CATALOG } from './catalog';

const byPill = (pill: HomePill): IContentItem[] =>
  pill === 'ALL' ? CATALOG : CATALOG.filter((item) => item.sport === pill);

export function buildHomeSegments(pill: HomePill): HomeSegment[] {
  const items = byPill(pill);
  const live = items.filter((item) => item.isLive);
  const vod = items.filter((item) => !item.isLive);
  const segments: HomeSegment[] = [
    {
      type: 'ROADBLOCK',
      id: 'roadblock',
      slot: { adUnitId: '/pitchside/home/roadblock', format: 'ROADBLOCK', defaultBanner: null },
    },
    {
      type: 'HERO',
      id: 'hero',
      items: [...live, ...vod].slice(0, 4),
      masthead: {
        adUnitId: '/pitchside/home/masthead',
        format: 'MASTHEAD',
        defaultBanner: { title: 'Get a Pass', subtitle: 'Fewer ads on every live match', targetContentId: 'settings', color: '#FF5A36' },
      },
    },
  ];
  if (live.length > 0) segments.push({ type: 'RAIL', id: 'live-now', title: 'Live Now', items: live });
  segments.push({
    type: 'BANNER',
    id: 'banner-mid',
    slot: {
      adUnitId: `/pitchside/home/${pill.toLowerCase()}/banner`,
      format: 'BANNER_320x50',
      defaultBanner: { title: 'Final tonight, 7:30 PM', subtitle: 'Monarchs vs Cyclones · watch free', targetContentId: 'live-ppl-final', color: '#3B2A8F' },
    },
  });
  if (vod.length > 0) segments.push({ type: 'RAIL', id: 'highlights', title: 'Highlights & Replays', items: vod });
  const premium = items.filter((item) => item.isPremium);
  if (premium.length > 0) segments.push({ type: 'RAIL', id: 'premium', title: 'Premium', items: premium });
  return segments;
}
