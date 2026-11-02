import type { IContentItem, IVideoSource, IVastTag } from '../../types/content';

const SAMPLE_BASE = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample';

export const CATALOG: IContentItem[] = [
  { id: 'live-ppl-final', title: 'Monarchs vs Cyclones', subtitle: 'Final · 2nd innings', tournament: 'Pitchside Premier League', sport: 'CRICKET', isLive: true, isPremium: false, durationLabel: 'LIVE', posterColor: '#3B2A8F' },
  { id: 'live-coastal-derby', title: 'Harbour FC vs Ridgeway United', subtitle: 'Matchday 14 · 2nd half', tournament: 'Coastal League', sport: 'FOOTBALL', isLive: true, isPremium: true, durationLabel: 'LIVE', posterColor: '#0E6E4E' },
  { id: 'live-raiders', title: 'Desert Raiders vs Lake Titans', subtitle: 'Season 4 · Match 31', tournament: 'Pro Raid Series', sport: 'KABADDI', isLive: true, isPremium: false, durationLabel: 'LIVE', posterColor: '#8A3B12' },
  { id: 'live-hoops-timer', title: 'Metro Comets vs Valley Owls', subtitle: 'Quarter 3 · no SCTE feed', tournament: 'City Hoops League', sport: 'BASKETBALL', isLive: true, isPremium: false, durationLabel: 'LIVE', posterColor: '#1D4F91' },
  { id: 'vod-ppl-highlights', title: 'Semi-final 2 Highlights', subtitle: 'Cyclones chase down 211', tournament: 'Pitchside Premier League', sport: 'CRICKET', isLive: false, isPremium: false, durationLabel: '9:56', posterColor: '#5A1F6B' },
  { id: 'vod-full-replay', title: 'Full Replay: Opening Match', subtitle: 'Monarchs vs Falcons', tournament: 'Pitchside Premier League', sport: 'CRICKET', isLive: false, isPremium: true, durationLabel: '10:53', posterColor: '#24476B' },
  { id: 'vod-coastal-goals', title: 'Goals of the Week', subtitle: 'Top 10 strikes', tournament: 'Coastal League', sport: 'FOOTBALL', isLive: false, isPremium: false, durationLabel: '14:48', posterColor: '#1F6B3A' },
  { id: 'vod-coastal-ssai', title: 'Matchday 13 Extended', subtitle: 'Server-side ads (DAI)', tournament: 'Coastal League', sport: 'FOOTBALL', isLive: false, isPremium: false, durationLabel: '12:14', posterColor: '#2F5D50' },
  { id: 'vod-raid-of-season', title: 'Raid of the Season', subtitle: 'Fan vote finalists', tournament: 'Pro Raid Series', sport: 'KABADDI', isLive: false, isPremium: false, durationLabel: '0:47', posterColor: '#7A4A12' },
  { id: 'vod-hoops-recap', title: 'Comets Season Recap', subtitle: 'Road to the playoffs', tournament: 'City Hoops League', sport: 'BASKETBALL', isLive: false, isPremium: false, durationLabel: '9:41', posterColor: '#2B3A8F' },
];

const PREROLL_TAGS: IVastTag[] = [
  { vastTagId: 'tag-sponsor-bumper', vastTagType: 'BUMPER' },
  { vastTagId: 'tag-preroll-1', vastTagType: 'REGULAR' },
  { vastTagId: 'tag-preroll-2', vastTagType: 'REGULAR' },
];

const MIDROLL_TAGS: IVastTag[] = [
  { vastTagId: 'tag-midroll-1', vastTagType: 'REGULAR' },
  { vastTagId: 'tag-midroll-2', vastTagType: 'REGULAR' },
  { vastTagId: 'tag-midroll-3', vastTagType: 'REGULAR' },
];

function vmaxSource(url: string, isLive: boolean, custParams: string, overrides: Partial<IVideoSource> = {}): IVideoSource {
  return {
    url,
    isLive,
    csai: {
      enabled: true,
      provider: 'VMAX',
      extraData: {
        preRollEnabled: true,
        preRollTimeOut: 4,
        preRollMaxDuration: 45,
        midRollMaxDuration: 45,
        preRollVastTagIds: PREROLL_TAGS,
        midRollVastTagIds: isLive ? MIDROLL_TAGS : [],
        adTagParams: { cust_params: custParams },
      },
    },
    ssai: null,
    timerBasedAdInterval: 0,
    vodMidRollCuePoints: [],
    simulatedScteCues: [],
    ...overrides,
  };
}

export const VIDEO_SOURCES: Record<string, IVideoSource> = {
  'live-ppl-final': vmaxSource(`${SAMPLE_BASE}/TearsOfSteel.mp4`, true, 'sport=cricket&tour=ppl&stage=final', {
    simulatedScteCues: [
      { id: 'scte-over-10', startSec: 30, durationSec: 40 },
      { id: 'scte-drinks', startSec: 120, durationSec: 8 },
      { id: 'scte-over-20', startSec: 180, durationSec: 30 },
    ],
  }),
  'live-coastal-derby': vmaxSource(`${SAMPLE_BASE}/ElephantsDream.mp4`, true, 'sport=football&tour=coastal', {
    simulatedScteCues: [{ id: 'scte-injury', startSec: 45, durationSec: 25 }],
  }),
  'live-raiders': {
    url: `${SAMPLE_BASE}/WeAreGoingOnBullrun.mp4`,
    isLive: true,
    csai: { enabled: true, provider: 'IMA', extraData: { adTagUrl: 'https://ads.example.invalid/vast?iu=/pitchside/kabaddi/preroll', queryParams: 'sz=640x480' } },
    ssai: null,
    timerBasedAdInterval: 0,
    vodMidRollCuePoints: [],
    simulatedScteCues: [],
  },
  'live-hoops-timer': vmaxSource(`${SAMPLE_BASE}/Sintel.mp4`, true, 'sport=basketball', { timerBasedAdInterval: 90 }),
  'vod-ppl-highlights': vmaxSource(`${SAMPLE_BASE}/BigBuckBunny.mp4`, false, 'sport=cricket&type=highlights', {
    vodMidRollCuePoints: [120, 300],
  }),
  'vod-full-replay': vmaxSource(`${SAMPLE_BASE}/TearsOfSteel.mp4`, false, 'sport=cricket&type=replay'),
  'vod-coastal-goals': vmaxSource(`${SAMPLE_BASE}/SubaruOutbackOnStreetAndDirt.mp4`, false, 'sport=football&type=goals'),
  'vod-coastal-ssai': {
    url: `${SAMPLE_BASE}/VolkswagenGTIReview.mp4`,
    isLive: false,
    csai: null,
    ssai: { enabled: true, provider: 'DAI', extraData: { assetKey: 'demo-asset-key', sdkType: 'IMA_DAI_CORE', adTagParams: { cust_params: 'sport=football' } } },
    timerBasedAdInterval: 0,
    vodMidRollCuePoints: [],
    simulatedScteCues: [],
  },
  'vod-raid-of-season': vmaxSource(`${SAMPLE_BASE}/ForBiggerMeltdowns.mp4`, false, 'sport=kabaddi'),
  'vod-hoops-recap': vmaxSource(`${SAMPLE_BASE}/ElephantsDream.mp4`, false, 'sport=basketball&type=recap'),
};
