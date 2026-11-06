import NativeAdgeist from '../specs/NativeAdgeist';
import {
  getConsentStatus,
  logEvent,
  setUserDetails,
  updateConsentStatus,
} from '../cdpclient';

jest.mock('../specs/NativeAdgeist');

const native = jest.mocked(NativeAdgeist);

const expectAdgeistError = (error: unknown, message: string) => {
  expect(error).toBeInstanceOf(Error);
  expect(error).toMatchObject({ name: 'AdgeistError', message });
};

const thrownBy = (fn: () => unknown): unknown => {
  try {
    fn();
  } catch (error) {
    return error;
  }
  throw new Error('expected function to throw');
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('setUserDetails', () => {
  it('forwards the user details unchanged', () => {
    const user = { userId: 'u-1', userName: 'Ada', email: 'a@b.c', phone: '1' };

    setUserDetails(user);

    expect(native.setUserDetails).toHaveBeenCalledTimes(1);
    expect(native.setUserDetails).toHaveBeenCalledWith(user);
  });

  it('accepts partial details', () => {
    setUserDetails({ email: 'a@b.c' });

    expect(native.setUserDetails).toHaveBeenCalledWith({ email: 'a@b.c' });
  });

  it('wraps a native error in AdgeistError', () => {
    native.setUserDetails.mockImplementationOnce(() => {
      throw new Error('native boom');
    });

    expectAdgeistError(
      thrownBy(() => setUserDetails({ userId: 'u' })),
      'native boom'
    );
  });

  it('uses a default message for a non-Error throw', () => {
    native.setUserDetails.mockImplementationOnce(() => {
      throw 'bad';
    });

    expectAdgeistError(
      thrownBy(() => setUserDetails({ userId: 'u' })),
      'Failed to set user details'
    );
  });
});

describe('logEvent', () => {
  it('forwards the event unchanged', () => {
    const event = {
      eventType: 'purchase',
      eventProperties: { sku: 'A1', price: 9.5 },
    };

    logEvent(event);

    expect(native.logEvent).toHaveBeenCalledTimes(1);
    expect(native.logEvent).toHaveBeenCalledWith(event);
  });

  it.each([null, undefined, 'purchase', 42])(
    'rejects %p without calling native',
    (event) => {
      expectAdgeistError(
        thrownBy(() => logEvent(event as never)),
        'Event must be a valid object'
      );
      expect(native.logEvent).not.toHaveBeenCalled();
    }
  );

  it('wraps a native error in AdgeistError', () => {
    native.logEvent.mockImplementationOnce(() => {
      throw new Error('queue full');
    });

    expectAdgeistError(
      thrownBy(() => logEvent({ eventType: 'x', eventProperties: {} })),
      'queue full'
    );
  });

  it('uses a default message for a non-Error throw', () => {
    native.logEvent.mockImplementationOnce(() => {
      throw null;
    });

    expectAdgeistError(
      thrownBy(() => logEvent({ eventType: 'x', eventProperties: {} })),
      'Failed to log event'
    );
  });
});

describe('getConsentStatus', () => {
  it('maps true to ACCEPTED', async () => {
    native.getConsentStatus.mockResolvedValueOnce(true);

    await expect(getConsentStatus()).resolves.toBe('ACCEPTED');
  });

  it('maps false to DENIED', async () => {
    native.getConsentStatus.mockResolvedValueOnce(false);

    await expect(getConsentStatus()).resolves.toBe('DENIED');
  });

  it('maps a non-boolean value to DENIED', async () => {
    native.getConsentStatus.mockResolvedValueOnce(1 as never);

    await expect(getConsentStatus()).resolves.toBe('DENIED');
  });

  it('wraps a native rejection in AdgeistError', async () => {
    native.getConsentStatus.mockRejectedValueOnce(new Error('no storage'));

    const error = await getConsentStatus().catch((e: unknown) => e);

    expectAdgeistError(error, 'no storage');
  });

  it('uses a default message for a non-Error rejection', async () => {
    native.getConsentStatus.mockRejectedValueOnce('nope');

    const error = await getConsentStatus().catch((e: unknown) => e);

    expectAdgeistError(error, 'Failed to get consent status');
  });
});

describe('updateConsentStatus', () => {
  it.each([true, false])('forwards %p', (consent) => {
    updateConsentStatus(consent);

    expect(native.updateConsentStatus).toHaveBeenCalledTimes(1);
    expect(native.updateConsentStatus).toHaveBeenCalledWith(consent);
  });

  it('round-trips through getConsentStatus', async () => {
    let stored = false;
    const store = (consent: boolean) => {
      stored = consent;
    };
    const read = () => Promise.resolve(stored);
    native.updateConsentStatus
      .mockImplementationOnce(store)
      .mockImplementationOnce(store);
    native.getConsentStatus
      .mockImplementationOnce(read)
      .mockImplementationOnce(read);

    updateConsentStatus(true);
    await expect(getConsentStatus()).resolves.toBe('ACCEPTED');

    updateConsentStatus(false);
    await expect(getConsentStatus()).resolves.toBe('DENIED');
  });

  it('wraps a native error in AdgeistError', () => {
    native.updateConsentStatus.mockImplementationOnce(() => {
      throw new Error('locked');
    });

    expectAdgeistError(
      thrownBy(() => updateConsentStatus(true)),
      'locked'
    );
  });

  it('uses a default message for a non-Error throw', () => {
    native.updateConsentStatus.mockImplementationOnce(() => {
      throw undefined;
    });

    expectAdgeistError(
      thrownBy(() => updateConsentStatus(true)),
      'Failed to update consent status'
    );
  });
});
