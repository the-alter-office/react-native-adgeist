export type AdSizeType =
  | 'BANNER'
  | 'LARGE_BANNER'
  | 'MEDIUM_RECTANGLE'
  | 'FULL_BANNER'
  | 'LEADERBOARD'
  | 'WIDE_SKYSCRAPER';

export interface AdSize {
  type?: AdSizeType;
  width?: number;
  height?: number;
}
