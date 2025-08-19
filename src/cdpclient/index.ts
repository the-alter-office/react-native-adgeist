import Adgeist, { type UserDetails, type Event } from '../NativeAdgeist';

export const setUserDetails = (userDetails: UserDetails) => {
  Adgeist.setUserDetails(userDetails);
};

export const logEvent = (event: Event) => {
  Adgeist.logEvent(event);
};

export const getConsentStatus = async () => {
  return (await Adgeist.getConsentStatus()) === true ? 'ACCEPTED' : 'DENIED';
};

export const updateConsentStatus = (consent: boolean) => {
  Adgeist.updateConsentStatus(consent);
};
