# Pitchside

A demo sports-streaming app (Expo / React Native) that follows the ad architecture of a large Indian sports OTT app: server-driven ad config per stream, a client-side ad engine (CSAI) for pre-rolls and SCTE-cued live mid-rolls, and display ad slots with house-banner fallback. There's no auth and no backend. Every network call goes to an in-app mock.

It lives in this repo as a reference for how a streaming publisher wires ads, but it does not use `@thealteroffice/react-native-adgeist` yet: the display slots come from a mock ad server (`src/api/mock/displayAdServer.ts`) and the video ads from a mock VAST-style server (`src/api/mock/adServer.ts`). Swapping the display slots for `HTML5AdView` is the natural next step.

## Run

The app is a standalone npm project. It is not one of the repo's Yarn workspaces, and the library's lint, typecheck, Jest and build all skip this folder.

```bash
cd example-pitchside
npm install
npx expo start            # press i / a, or scan the QR code with Expo Go
npx expo start --web      # browser
npm run typecheck
```

Expo Go is enough on a device or emulator, because expo-video ships in it. No native build is needed.

Videos are Google's public sample MP4s (`gtv-videos-bucket`). "Live" streams are VOD files presented as live, with simulated SCTE-35 cues.

## Map

```
src/app/                    Expo Router screens
  index.tsx                 Home: server-driven segments (roadblock, hero + masthead ad, rails, banner), sport pills
  watch/[id].tsx            Player page: premium gate, player, delayed bottom banner, related rail
  settings.tsx              Plans (Free / Pass), mock remote flags, ad event log, opportunity vs fill stats
src/api/client.ts           GraphQL-shaped mock client (fetchHome, fetchStream) with latency
src/api/mock/               catalog + per-stream videoSource {csai, ssai}, VAST-style ad server, display ad server
src/player/PlayerSurface    content player + ad player (expo-video); implements IAdPlaybackHost
src/player/AdOverlay        ad UI: "Ad n of m", countdown, skip after skipOffset, Learn more
src/player/ads/
  createAdsManager.ts       router: Pass → none, SSAI → DAI (simulated), CSAI → VMAX | IMA, remote flag gates
  VmaxAdManager.ts          pre-roll (parallel tags, 1s poll up to preRollTimeOut, max-duration pod),
                            live SCTE mid-roll (prefetch at first frame, muted not paused, <10s / background skip,
                            cue-in truncates, refetch 2s after break), timer-based mid-roll, VOD cue points
  ImaAdManager.ts           single pre-roll from adTagUrl with 2s VAST timeout
  AdBreakRunner.ts          plays a pod in tag order under a PausableTimer cap; emits break/ad events
  SimulatedScteCueSource.ts emits cue-out/cue-in from the stream's simulatedScteCues
src/analytics/eventBus.ts   single event pipeline + opportunity vs filled seconds
src/state/                  tiny stores: remote flags, entitlement (Free / Pass / ad-funded unlocks)
```

## Streams that show each path

| Content | Path |
|---|---|
| Monarchs vs Cyclones (live) | VMAX pre-roll + SCTE mid-rolls at 0:30 (40s), 2:00 (8s, skipped: under min), 3:00 (30s) |
| Harbour FC vs Ridgeway (live, premium) | Premium gate → "Watch Free With Ads" forces a pre-roll; SCTE mid-roll at 0:45 |
| Desert Raiders vs Lake Titans (live) | IMA pre-roll only |
| Metro Comets vs Valley Owls (live) | Timer-based mid-roll every 90s, content paused |
| Semi-final 2 Highlights (VOD) | VMAX pre-roll + VOD cue-point mid-rolls at 2:00 and 5:00 |
| Matchday 13 Extended (VOD) | SSAI/DAI config: no client ads |

Pre-rolls play once per content per app session (the dedupe applies only when timer mode is off).
