# Pitchside

A demo sports-streaming app built with Expo and React Native. It has a home screen with sport filters, a hero carousel and content rails, a watch screen that plays live and on-demand video, and a premium tier unlocked by a demo pass. There's no auth and no backend. Every network call goes to an in-app mock.

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

Videos are Google's public sample MP4s (`gtv-videos-bucket`). "Live" streams are on-demand files presented as live.

## Map

```
src/app/                    Expo Router screens
  index.tsx                 Home: sport pills, hero carousel, Live Now / Highlights / Premium rails
  watch/[id].tsx            Watch page: player or premium gate, match info, related rail
  plans.tsx                 Plans (Free / Pass)
src/api/client.ts           mock client (fetchHome, fetchStream) with simulated latency
src/api/mock/               catalog with a video source per item, home segment builder
src/player/PlayerSurface    expo-video player with native controls and a live badge
src/components/             hero carousel, rails, content cards, sport pills, premium gate, state views
src/state/                  tiny stores: entitlement (Free / Pass)
```

## Premium

"Harbour FC vs Ridgeway United" and "Full Replay: Opening Match" are premium. On the Free plan they show a gate with "Get a Pass (demo)"; switching to Pass on the gate or the Plans screen plays them. No payment is taken.
