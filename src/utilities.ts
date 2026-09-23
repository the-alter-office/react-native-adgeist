/**
 * Normalizes a URL to ensure it has a valid protocol
 */
export const normalizeUrl = (url: string) => {
  if (!url) return url;
  if (url.startsWith('www.')) {
    return `https://${url}`;
  }
  if (!url.match(/^[a-zA-Z]+:\/\//)) {
    return `https://${url}`;
  }
  return url;
};

export const toAdSizeAxis = (value?: number): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) && value > 0
    ? value
    : undefined;
