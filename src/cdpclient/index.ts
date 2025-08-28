import Adgeist, { type UserDetails, type Event } from '../NativeAdgeist';

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
 * Sets user details in the Adgeist SDK
 * @param userDetails - User details object
 * @throws AdgeistError if the operation fails
 */
export const setUserDetails = (userDetails: UserDetails): void => {
  try {
    Adgeist.setUserDetails(userDetails);
  } catch (error: unknown) {
    const err =
      error instanceof Error ? error : new Error('Failed to set user details');
    throw new AdgeistError(err.message);
  }
};

/**
 * Logs an event in the Adgeist SDK
 * @param event - Event object to log
 * @throws AdgeistError if the event is invalid or logging fails
 */
export const logEvent = (event: Event): void => {
  if (!event || typeof event !== 'object') {
    throw new AdgeistError('Event must be a valid object');
  }
  try {
    Adgeist.logEvent(event);
  } catch (error: unknown) {
    const err =
      error instanceof Error ? error : new Error('Failed to log event');
    throw new AdgeistError(err.message);
  }
};

/**
 * Retrieves the consent status from the Adgeist SDK
 * @returns Promise resolving to 'ACCEPTED' or 'DENIED'
 * @throws AdgeistError if the operation fails
 */
export const getConsentStatus = async (): Promise<'ACCEPTED' | 'DENIED'> => {
  try {
    const status = await Adgeist.getConsentStatus();
    return status === true ? 'ACCEPTED' : 'DENIED';
  } catch (error: unknown) {
    const err =
      error instanceof Error
        ? error
        : new Error('Failed to get consent status');
    throw new AdgeistError(err.message);
  }
};

/**
 * Updates the consent status in the Adgeist SDK
 * @param consent - Boolean indicating user consent
 * @throws AdgeistError if the operation fails
 */
export const updateConsentStatus = (consent: boolean): void => {
  try {
    Adgeist.updateConsentStatus(consent);
  } catch (error: unknown) {
    const err =
      error instanceof Error
        ? error
        : new Error('Failed to update consent status');
    throw new AdgeistError(err.message);
  }
};
