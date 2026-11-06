import type { HomePill, IHomeResponse, IStreamResponse } from '../types/content';
import { CATALOG, VIDEO_SOURCES } from './mock/catalog';
import { buildHomeSegments } from './mock/home';

const SIMULATED_LATENCY_MS = 450;

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchHome(pill: HomePill): Promise<IHomeResponse> {
  try {
    await delay(SIMULATED_LATENCY_MS);
    return { pill, segments: buildHomeSegments(pill) };
  } catch (error) {
    throw error;
  }
}

export async function fetchStream(contentId: string): Promise<IStreamResponse> {
  try {
    await delay(SIMULATED_LATENCY_MS);
    const item = CATALOG.find((entry) => entry.id === contentId);
    const videoSource = VIDEO_SOURCES[contentId];
    if (!item || !videoSource) throw new Error(`Content ${contentId} not found`);
    const related = CATALOG.filter((entry) => entry.id !== contentId && entry.sport === item.sport);
    return { item, videoSource, related };
  } catch (error) {
    throw error;
  }
}
