import { createRef } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import { HTML5AdViewPreview } from '../components/HTML5AdViewPreview';
import { AdPreviewCommands } from '../specs/AdPreviewNativeComponent';
import type {
  HTML5AdViewPreviewProps,
  HTML5AdViewPreviewRef,
} from '../types/AdPreviewProps';

jest.mock('../specs/AdPreviewNativeComponent', () => ({
  __esModule: true,
  default: 'AdPreviewNativeComponent',
  AdPreviewCommands: { loadAd: jest.fn() },
}));

const commands = jest.mocked(AdPreviewCommands);
const nativeView = { tag: 'native-preview-view' };

let renderer: ReactTestRenderer;

const render = (props: HTML5AdViewPreviewProps, ref?: unknown) => {
  act(() => {
    renderer = create(<HTML5AdViewPreview ref={ref as never} {...props} />, {
      createNodeMock: () => nativeView,
    });
  });
};

const flushFrame = () => {
  act(() => {
    jest.runOnlyPendingTimers();
  });
};

const hostProps = () =>
  renderer.root.findAllByType('AdPreviewNativeComponent' as never)[0]!.props;

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

describe('HTML5AdViewPreview', () => {
  it('forwards preview props to the native view', () => {
    const props: HTML5AdViewPreviewProps = {
      type: 'companion',
      media: 'video',
      creativeUrl: 'https://cdn.test/video.mp4',
      companionUrl: 'https://cdn.test/banner.png',
      title: 'Title',
      description: 'Body',
      ctaUrl: 'https://example.test',
      deepLinkUrl: 'app://open',
      isResponsive: false,
      adSize: { width: 320, height: 250 },
      reserveSpace: false,
    };

    render(props);

    expect(hostProps()).toMatchObject({
      ...props,
      style: { width: 320, height: 250 },
    });
  });

  it('drops invalid size axes', () => {
    render({ adSize: { width: 0, height: 90 } });

    expect(hostProps().adSize).toEqual({ height: 90 });
    expect(hostProps().style).toEqual({ width: '100%', height: 90 });
  });

  it('renders the preview once the native view has had a frame', () => {
    render({});

    expect(commands.loadAd).not.toHaveBeenCalled();

    flushFrame();

    expect(commands.loadAd).toHaveBeenCalledTimes(1);
    expect(commands.loadAd).toHaveBeenCalledWith(nativeView);
  });

  it('ref.loadAd re-renders the preview only when ready', () => {
    const ref = createRef<HTML5AdViewPreviewRef>();
    render({}, ref);

    act(() => ref.current!.loadAd());
    expect(commands.loadAd).not.toHaveBeenCalled();

    flushFrame();
    act(() => ref.current!.loadAd());

    expect(commands.loadAd).toHaveBeenCalledTimes(2);
  });

  it('forwards native events to onAdEvent', () => {
    const onAdEvent = jest.fn();
    render({ onAdEvent });

    const event = {
      nativeEvent: {
        code: 'AL1',
        type: 'AD_LOADED',
        message: 'loaded',
        data: { reason: '' },
      },
    };
    act(() => hostProps().onAdEvent(event));

    expect(onAdEvent).toHaveBeenCalledWith(event);
  });

  it('takes a positive native size and ignores a zero one', () => {
    render({ adSize: { width: 300, height: 250 } });

    act(() =>
      hostProps().onAdSizeChanged({ nativeEvent: { width: 0, height: 100 } })
    );
    expect(hostProps().style).toEqual({ width: 300, height: 250 });

    act(() =>
      hostProps().onAdSizeChanged({ nativeEvent: { width: 320, height: 100 } })
    );
    expect(hostProps().style).toEqual({ width: 320, height: 100 });
  });

  it('survives a native loadAd error', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    commands.loadAd.mockImplementationOnce(() => {
      throw new Error('view gone');
    });

    render({});
    flushFrame();

    expect(hostProps()).toBeDefined();
    warn.mockRestore();
  });
});
