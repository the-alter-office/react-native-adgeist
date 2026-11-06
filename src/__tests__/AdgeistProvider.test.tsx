import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { Text } from 'react-native';

import NativeAdgeist from '../specs/NativeAdgeist';
import {
  AdgeistProvider,
  useAdgeistContext,
} from '../providers/AdgeistProvider';
import { PACKAGE_VERSION, PACKAGE_VERSION_TAG } from '../constants';
import type { AdgeistContextType } from '../types/Provider';

jest.mock('../specs/NativeAdgeist');
jest.mock('../config', () => ({
  PACKAGE_SUFFIX: '-beta.7',
  BACKEND_DOMAIN: 'https://beta.backend.test',
}));

const native = jest.mocked(NativeAdgeist);

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

let seen: AdgeistContextType[] = [];

const Probe = () => {
  seen.push(useAdgeistContext());
  return <Text>child</Text>;
};

const lastContext = () => seen[seen.length - 1];

const renderProvider = async (
  props: Partial<React.ComponentProps<typeof AdgeistProvider>> = {}
) => {
  let renderer!: ReactTestRenderer;
  await act(async () => {
    renderer = create(
      <AdgeistProvider {...props}>
        <Probe />
      </AdgeistProvider>
    );
  });
  return renderer;
};

const hasChild = (renderer: ReactTestRenderer) =>
  renderer.root.findAllByType(Probe).length > 0;

beforeEach(() => {
  jest.clearAllMocks();
  seen = [];
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('AdgeistProvider initialization', () => {
  it('destroys any previous SDK instance before initializing', async () => {
    await renderProvider();

    expect(native.destroySdk).toHaveBeenCalledTimes(1);
    expect(native.initializeSdk).toHaveBeenCalledTimes(1);
    expect(native.destroySdk.mock.invocationCallOrder[0]).toBeLessThan(
      native.initializeSdk.mock.invocationCallOrder[0]!
    );
  });

  it('passes the configured domain, null ids and the RN version tag', async () => {
    await renderProvider();

    expect(native.initializeSdk).toHaveBeenCalledWith(
      'https://beta.backend.test',
      null,
      null,
      `${PACKAGE_VERSION_TAG}-${PACKAGE_VERSION}`
    );
  });

  it('sends RN-x.y.z without the build suffix', async () => {
    await renderProvider();

    const version = native.initializeSdk.mock.calls[0]![3];
    expect(version).toMatch(/^RN-\d+\.\d+\.\d+$/);
  });

  it('forwards custom domain, bundle id and app id', async () => {
    await renderProvider({
      customBidRequestBackendDomain: 'https://example.test',
      customPackageOrBundleID: 'com.example.app',
      customAdgeistAppID: 'app-123',
    });

    expect(native.initializeSdk).toHaveBeenCalledWith(
      'https://example.test',
      'com.example.app',
      'app-123',
      `${PACKAGE_VERSION_TAG}-${PACKAGE_VERSION}`
    );
  });

  it('keeps children hidden until initialization resolves', async () => {
    const init = deferred<boolean>();
    native.initializeSdk.mockReturnValueOnce(init.promise);
    const onInitializationSuccess = jest.fn();

    const renderer = await renderProvider({ onInitializationSuccess });

    expect(hasChild(renderer)).toBe(false);
    expect(onInitializationSuccess).not.toHaveBeenCalled();

    await act(async () => {
      init.resolve(true);
    });

    expect(hasChild(renderer)).toBe(true);
    expect(lastContext()).toEqual({
      isInitialized: true,
      initializationError: undefined,
    });
    expect(onInitializationSuccess).toHaveBeenCalledTimes(1);
  });

  it('reports an initialization failure and still renders children', async () => {
    const failure = new Error('invalid app id');
    native.initializeSdk.mockRejectedValueOnce(failure);
    const onInitializationError = jest.fn();
    const onInitializationSuccess = jest.fn();

    const renderer = await renderProvider({
      onInitializationError,
      onInitializationSuccess,
    });

    expect(onInitializationError).toHaveBeenCalledTimes(1);
    expect(onInitializationError).toHaveBeenCalledWith(failure);
    expect(onInitializationSuccess).not.toHaveBeenCalled();
    expect(hasChild(renderer)).toBe(true);
    expect(lastContext()).toEqual({
      isInitialized: false,
      initializationError: failure,
    });
  });

  it('does not initialize when destroy fails', async () => {
    native.destroySdk.mockRejectedValueOnce(new Error('destroy failed'));
    const onInitializationError = jest.fn();

    await renderProvider({ onInitializationError });

    expect(native.initializeSdk).not.toHaveBeenCalled();
    expect(onInitializationError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'destroy failed' })
    );
  });

  it('wraps a non-Error rejection', async () => {
    native.initializeSdk.mockRejectedValueOnce('boom');
    const onInitializationError = jest.fn();

    await renderProvider({ onInitializationError });

    const error = onInitializationError.mock.calls[0][0];
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Unknown error occurred');
  });

  it('re-initializes when the app id changes', async () => {
    const renderer = await renderProvider({ customAdgeistAppID: 'app-1' });

    await act(async () => {
      renderer.update(
        <AdgeistProvider customAdgeistAppID="app-2">
          <Probe />
        </AdgeistProvider>
      );
    });

    expect(native.destroySdk).toHaveBeenCalledTimes(2);
    expect(native.initializeSdk).toHaveBeenCalledTimes(2);
    expect(native.initializeSdk.mock.calls[1]![2]).toBe('app-2');
    expect(lastContext()?.isInitialized).toBe(true);
  });

  it('does not re-initialize on a re-render with the same props', async () => {
    const onInitializationSuccess = jest.fn();
    const renderer = await renderProvider({
      customAdgeistAppID: 'app-1',
      onInitializationSuccess,
    });

    await act(async () => {
      renderer.update(
        <AdgeistProvider
          customAdgeistAppID="app-1"
          onInitializationSuccess={onInitializationSuccess}
        >
          <Probe />
        </AdgeistProvider>
      );
    });

    expect(native.initializeSdk).toHaveBeenCalledTimes(1);
    expect(onInitializationSuccess).toHaveBeenCalledTimes(1);
  });

  it('recovers after a failed initialization when props change', async () => {
    native.initializeSdk.mockRejectedValueOnce(new Error('offline'));
    const renderer = await renderProvider({ customAdgeistAppID: 'app-1' });

    expect(lastContext()?.initializationError?.message).toBe('offline');

    await act(async () => {
      renderer.update(
        <AdgeistProvider customAdgeistAppID="app-2">
          <Probe />
        </AdgeistProvider>
      );
    });

    expect(lastContext()).toEqual({
      isInitialized: true,
      initializationError: undefined,
    });
  });
});

describe('useAdgeistContext', () => {
  it('reports not initialized outside a provider', async () => {
    await act(async () => {
      create(<Probe />);
    });

    expect(lastContext()).toEqual({ isInitialized: false });
  });
});
