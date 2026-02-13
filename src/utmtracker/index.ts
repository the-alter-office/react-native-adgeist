import Adgeist from '../specs/NativeAdgeist';

class AdgeistError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = 'AdgeistError';
    this.code = code;
    Object.setPrototypeOf(this, AdgeistError.prototype);
  }
}

/**
 * @param uri - string
 * @throws AdgeistError if the operation fails
 */
export const trackConversionsWithDeepLinks = (uri: string): void => {
  try {
    Adgeist.trackDeeplinkUtm(uri);
  } catch (error: unknown) {
    const err =
      error instanceof Error ? error : new Error('Failed to set user details');
    throw new AdgeistError(err.message);
  }
};
