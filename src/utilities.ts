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
