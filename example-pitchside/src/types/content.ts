export type Sport = 'CRICKET' | 'FOOTBALL' | 'KABADDI' | 'BASKETBALL';
export type HomePill = 'ALL' | Sport;

export interface IContentItem {
  id: string;
  title: string;
  subtitle: string;
  tournament: string;
  sport: Sport;
  isLive: boolean;
  isPremium: boolean;
  durationLabel: string;
  posterColor: string;
}

export interface IVideoSource {
  url: string;
  isLive: boolean;
}

export interface IStreamResponse {
  item: IContentItem;
  videoSource: IVideoSource;
  related: IContentItem[];
}

export type HomeSegment =
  | { type: 'HERO'; id: string; items: IContentItem[] }
  | { type: 'RAIL'; id: string; title: string; items: IContentItem[] };

export interface IHomeResponse {
  pill: HomePill;
  segments: HomeSegment[];
}
