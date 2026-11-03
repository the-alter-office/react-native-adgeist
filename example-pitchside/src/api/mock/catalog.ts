import type { IContentItem, IVideoSource } from '../../types/content';

const SAMPLE_BASE = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample';

export const CATALOG: IContentItem[] = [
  { id: 'live-ppl-final', title: 'Monarchs vs Cyclones', subtitle: 'Final · 2nd innings', tournament: 'Pitchside Premier League', sport: 'CRICKET', isLive: true, isPremium: false, durationLabel: 'LIVE', posterColor: '#3B2A8F' },
  { id: 'live-coastal-derby', title: 'Harbour FC vs Ridgeway United', subtitle: 'Matchday 14 · 2nd half', tournament: 'Coastal League', sport: 'FOOTBALL', isLive: true, isPremium: true, durationLabel: 'LIVE', posterColor: '#0E6E4E' },
  { id: 'live-raiders', title: 'Desert Raiders vs Lake Titans', subtitle: 'Season 4 · Match 31', tournament: 'Pro Raid Series', sport: 'KABADDI', isLive: true, isPremium: false, durationLabel: 'LIVE', posterColor: '#8A3B12' },
  { id: 'live-hoops', title: 'Metro Comets vs Valley Owls', subtitle: 'Quarter 3', tournament: 'City Hoops League', sport: 'BASKETBALL', isLive: true, isPremium: false, durationLabel: 'LIVE', posterColor: '#1D4F91' },
  { id: 'vod-ppl-highlights', title: 'Semi-final 2 Highlights', subtitle: 'Cyclones chase down 211', tournament: 'Pitchside Premier League', sport: 'CRICKET', isLive: false, isPremium: false, durationLabel: '9:56', posterColor: '#5A1F6B' },
  { id: 'vod-full-replay', title: 'Full Replay: Opening Match', subtitle: 'Monarchs vs Falcons', tournament: 'Pitchside Premier League', sport: 'CRICKET', isLive: false, isPremium: true, durationLabel: '10:53', posterColor: '#24476B' },
  { id: 'vod-coastal-goals', title: 'Goals of the Week', subtitle: 'Top 10 strikes', tournament: 'Coastal League', sport: 'FOOTBALL', isLive: false, isPremium: false, durationLabel: '14:48', posterColor: '#1F6B3A' },
  { id: 'vod-coastal-extended', title: 'Matchday 13 Extended', subtitle: 'Extended highlights', tournament: 'Coastal League', sport: 'FOOTBALL', isLive: false, isPremium: false, durationLabel: '12:14', posterColor: '#2F5D50' },
  { id: 'vod-raid-of-season', title: 'Raid of the Season', subtitle: 'Fan vote finalists', tournament: 'Pro Raid Series', sport: 'KABADDI', isLive: false, isPremium: false, durationLabel: '0:47', posterColor: '#7A4A12' },
  { id: 'vod-hoops-recap', title: 'Comets Season Recap', subtitle: 'Road to the playoffs', tournament: 'City Hoops League', sport: 'BASKETBALL', isLive: false, isPremium: false, durationLabel: '9:41', posterColor: '#2B3A8F' },
];

const source = (file: string, isLive: boolean): IVideoSource => ({ url: `${SAMPLE_BASE}/${file}`, isLive });

export const VIDEO_SOURCES: Record<string, IVideoSource> = {
  'live-ppl-final': source('TearsOfSteel.mp4', true),
  'live-coastal-derby': source('ElephantsDream.mp4', true),
  'live-raiders': source('WeAreGoingOnBullrun.mp4', true),
  'live-hoops': source('Sintel.mp4', true),
  'vod-ppl-highlights': source('BigBuckBunny.mp4', false),
  'vod-full-replay': source('TearsOfSteel.mp4', false),
  'vod-coastal-goals': source('SubaruOutbackOnStreetAndDirt.mp4', false),
  'vod-coastal-extended': source('VolkswagenGTIReview.mp4', false),
  'vod-raid-of-season': source('ForBiggerMeltdowns.mp4', false),
  'vod-hoops-recap': source('ElephantsDream.mp4', false),
};
