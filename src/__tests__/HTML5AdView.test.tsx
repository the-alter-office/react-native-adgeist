import { createRef } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import { HTML5AdView } from '../components/HTML5AdView';
import { AdCommands } from '../specs/HTML5AdNativeComponent';
import type { AdSize } from '../types/AdSize';
import type {
  AdViewEventCode,
  HTML5AdNativeComponentProps,
  HTML5AdViewRef,
} from '../types/HTML5AdNativeComponentProps';

jest.mock('../specs/HTML5AdNativeComponent', () => ({
  __esModule: true,
  default: 'HTML5AdNativeComponent',
  AdCommands: { loadAd: jest.fn(), destroy: jest.fn() },
}));

const commands = jest.mocked(AdCommands);
const nativeView = { tag: 'native-ad-view' };

let renderer: ReactTestRenderer;

const render = (props: HTML5AdNativeComponentProps, ref?: unknown) => {
  act(() => {
    renderer = create(<HTML5AdView ref={ref as never} {...props} />, {
      createNodeMock: () => nativeView,
    });
  });
};

const rerender = (props: HTML5AdNativeComponentProps, ref?: unknown) => {
  act(() => {
    renderer.update(<HTML5AdView ref={ref as never} {...props} />);
  });
};

const flushFrame = () => {
  act(() => {
    jest.runOnlyPendingTimers();
  });
};

const host = () =>
  renderer.root.findAllByType('HTML5AdNativeComponent' as never)[0];

const hostProps = () => host()!.props;

const adEvent = (code: AdViewEventCode, type = 'AD_LOADED') => ({
  nativeEvent: { code, type, message: code, data: { reason: '' } },
});

const emitAdEvent = (code: AdViewEventCode, type?: string) => {
  act(() => {
    hostProps().onAdEvent(adEvent(code, type));
  });
};

const emitSizeChanged = (width: number, height: number) => {
  act(() => {
    hostProps().onAdSizeChanged({ nativeEvent: { width, height } });
  });
};

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
});

afterEach(() => {
  act(() => {
    renderer?.unmount();
  });
  jest.useRealTimers();
});

describe('HTML5AdView props', () => {
  it('forwards ad props to the native view', () => {
    render({
      adUnitID: 'unit-1',
      adIsResponsive: false,
      adSize: { width: 320, height: 50 },
      reserveSpace: true,
    });

    expect(hostProps()).toMatchObject({
      adUnitID: 'unit-1',
      adIsResponsive: false,
      adSize: { width: 320, height: 50 },
      reserveSpace: true,
      style: { width: 320, height: 50 },
    });
  });

  it('fills the parent when no size is given', () => {
    render({ adUnitID: 'unit-1', adIsResponsive: true });

    expect(hostProps().adSize).toEqual({});
    expect(hostProps().style).toEqual({ width: '100%', height: '100%' });
  });

  it.each<[AdSize, AdSize]>([
    [{ width: 0, height: 50 }, { height: 50 }],
    [{ width: -1, height: 50 }, { height: 50 }],
    [{ width: Number.NaN, height: 50 }, { height: 50 }],
    [{ width: 320, height: Number.POSITIVE_INFINITY }, { width: 320 }],
    [{ height: 90 }, { height: 90 }],
  ])('drops invalid axes from %p', (adSize, expected) => {
    render({ adUnitID: 'unit-1', adSize });

    expect(hostProps().adSize).toEqual(expected);
    expect(hostProps().style).toEqual({
      width: expected.width ?? '100%',
      height: expected.height ?? '100%',
    });
  });
});

describe('HTML5AdView loading', () => {
  it('loads the ad once the native view has had a frame', () => {
    render({ adUnitID: 'unit-1' });

    expect(commands.loadAd).not.toHaveBeenCalled();

    flushFrame();

    expect(commands.loadAd).toHaveBeenCalledTimes(1);
    expect(commands.loadAd).toHaveBeenCalledWith(nativeView);
  });

  it('does not load without an ad unit id', () => {
    render({ adUnitID: '' });
    flushFrame();

    expect(commands.loadAd).not.toHaveBeenCalled();
  });

  it('loads a new ad when the ad unit id changes', () => {
    render({ adUnitID: 'unit-1' });
    flushFrame();

    rerender({ adUnitID: 'unit-2' });

    expect(commands.loadAd).toHaveBeenCalledTimes(2);
    expect(hostProps().adUnitID).toBe('unit-2');
  });

  it('does not reload on an unrelated re-render', () => {
    const onAdEvent = jest.fn();
    render({ adUnitID: 'unit-1', onAdEvent });
    flushFrame();

    rerender({ adUnitID: 'unit-1', onAdEvent: jest.fn() });

    expect(commands.loadAd).toHaveBeenCalledTimes(1);
  });

  it('survives a native loadAd error', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    commands.loadAd.mockImplementationOnce(() => {
      throw new Error('view gone');
    });

    render({ adUnitID: 'unit-1' });
    flushFrame();

    expect(host()).toBeDefined();
    warn.mockRestore();
  });
});

describe('HTML5AdView events', () => {
  it('forwards every native event to onAdEvent', () => {
    const onAdEvent = jest.fn();
    render({ adUnitID: 'unit-1', onAdEvent });

    emitAdEvent('AL1', 'AD_LOADED');
    emitAdEvent('AI1', 'AD_CLICKED');

    expect(onAdEvent).toHaveBeenCalledTimes(2);
    expect(onAdEvent.mock.calls[0][0].nativeEvent).toMatchObject({
      code: 'AL1',
      type: 'AD_LOADED',
    });
    expect(onAdEvent.mock.calls[1][0].nativeEvent.code).toBe('AI1');
  });

  it('works without an onAdEvent handler', () => {
    render({ adUnitID: 'unit-1' });

    expect(() => emitAdEvent('AL1')).not.toThrow();
  });
});

describe('HTML5AdView sizing', () => {
  it('takes the native size for a fixed ad', () => {
    render({ adUnitID: 'unit-1', adSize: { width: 300, height: 250 } });

    emitSizeChanged(320, 480);

    expect(hostProps().style).toEqual({ width: 320, height: 480 });
  });

  it.each([
    [0, 480],
    [320, 0],
    [-5, -5],
  ])('ignores a native size of %p x %p', (width, height) => {
    render({ adUnitID: 'unit-1', adSize: { width: 300, height: 250 } });

    emitSizeChanged(width, height);

    expect(hostProps().style).toEqual({ width: 300, height: 250 });
  });

  it('ignores the native size for a responsive ad', () => {
    render({
      adUnitID: 'unit-1',
      adIsResponsive: true,
      adSize: { height: 50 },
    });

    emitSizeChanged(320, 480);

    expect(hostProps().style).toEqual({ width: '100%', height: 50 });
  });

  it('resets the native size when the ad unit id changes', () => {
    render({ adUnitID: 'unit-1', adSize: { width: 300, height: 250 } });
    emitSizeChanged(320, 480);

    rerender({ adUnitID: 'unit-2', adSize: { width: 300, height: 250 } });

    expect(hostProps().style).toEqual({ width: 300, height: 250 });
  });
});

describe('HTML5AdView reserveSpace', () => {
  const failureCodes: AdViewEventCode[] = [
    'AE1',
    'AE2',
    'AE3',
    'AE4',
    'AW1',
    'AW2',
    'AW3',
    'AW6',
    'RWAE1',
  ];

  it.each(failureCodes)(
    'collapses on %s when reserveSpace is false',
    (code) => {
      render({ adUnitID: 'unit-1', reserveSpace: false });

      emitAdEvent(code, 'AD_NETWORK_ERROR');

      expect(renderer.toJSON()).toBeNull();
    }
  );

  it.each(['AL1', 'AL2', 'AI1', 'AW4', 'AW5', 'AW7', 'AW8', 'RWAW1'] as const)(
    'stays on %s when reserveSpace is false',
    (code) => {
      render({ adUnitID: 'unit-1', reserveSpace: false });

      emitAdEvent(code, 'AD_WARNING');

      expect(host()).toBeDefined();
    }
  );

  it.each([true, undefined])(
    'keeps its box on failure when reserveSpace is %p',
    (reserveSpace) => {
      render({ adUnitID: 'unit-1', reserveSpace });

      emitAdEvent('AE1', 'AD_NO_FILL');

      expect(host()).toBeDefined();
    }
  );

  it('still reports the failure event before collapsing', () => {
    const onAdEvent = jest.fn();
    render({ adUnitID: 'unit-1', reserveSpace: false, onAdEvent });

    emitAdEvent('AE1', 'AD_NO_FILL');

    expect(onAdEvent).toHaveBeenCalledTimes(1);
  });

  it('comes back for a new ad unit id after collapsing', () => {
    render({ adUnitID: 'unit-1', reserveSpace: false });
    flushFrame();
    emitAdEvent('AE1', 'AD_NO_FILL');

    rerender({ adUnitID: 'unit-2', reserveSpace: false });
    flushFrame();

    expect(host()).toBeDefined();
    expect(hostProps().adUnitID).toBe('unit-2');
    expect(commands.loadAd).toHaveBeenCalledTimes(2);
  });
});

describe('HTML5AdView ref', () => {
  it('loadAd reloads once the view is ready', () => {
    const ref = createRef<HTML5AdViewRef>();
    render({ adUnitID: 'unit-1' }, ref);

    act(() => ref.current!.loadAd());
    expect(commands.loadAd).not.toHaveBeenCalled();

    flushFrame();
    act(() => ref.current!.loadAd());

    expect(commands.loadAd).toHaveBeenCalledTimes(2);
  });

  it('loadAd after a collapse remounts the view and loads again', () => {
    const ref = createRef<HTML5AdViewRef>();
    render({ adUnitID: 'unit-1', reserveSpace: false }, ref);
    flushFrame();
    emitAdEvent('AE2', 'AD_NETWORK_ERROR');
    expect(renderer.toJSON()).toBeNull();

    act(() => ref.current!.loadAd());
    flushFrame();

    expect(host()).toBeDefined();
    expect(commands.loadAd).toHaveBeenCalledTimes(2);
  });

  it('destroy tears down the native view', () => {
    const ref = createRef<HTML5AdViewRef>();
    render({ adUnitID: 'unit-1' }, ref);

    act(() => ref.current!.destroy());

    expect(commands.destroy).toHaveBeenCalledTimes(1);
    expect(commands.destroy).toHaveBeenCalledWith(nativeView);
  });

  it('destroy swallows a native error', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    commands.destroy.mockImplementationOnce(() => {
      throw new Error('already destroyed');
    });
    const ref = createRef<HTML5AdViewRef>();
    render({ adUnitID: 'unit-1' }, ref);

    expect(() => act(() => ref.current!.destroy())).not.toThrow();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
