type Platform = 'ios' | 'android';

interface Harness {
  dispatchViewManagerCommand: jest.Mock;
  findNodeHandle: jest.Mock;
  codegenCommands: { loadAd: jest.Mock; destroy: jest.Mock };
  codegenNativeCommands: jest.Mock;
  codegenNativeComponent: jest.Mock;
  spec: any;
}

const loadSpec = (
  path: '../specs/HTML5AdNativeComponent' | '../specs/AdPreviewNativeComponent',
  {
    os,
    fabric,
    tag = 42,
  }: { os: Platform; fabric: boolean; tag?: number | null }
): Harness => {
  const harness = {
    dispatchViewManagerCommand: jest.fn(),
    findNodeHandle: jest.fn(() => tag),
    codegenCommands: { loadAd: jest.fn(), destroy: jest.fn() },
  } as unknown as Harness;
  harness.codegenNativeCommands = jest.fn(() => harness.codegenCommands);
  harness.codegenNativeComponent = jest.fn((name: string) => name);

  const g = global as { nativeFabricUIManager?: unknown };
  const previous = g.nativeFabricUIManager;
  if (fabric) {
    g.nativeFabricUIManager = {};
  } else {
    delete g.nativeFabricUIManager;
  }

  try {
    jest.isolateModules(() => {
      jest.doMock('react-native', () => ({
        Platform: { OS: os },
        UIManager: {
          dispatchViewManagerCommand: harness.dispatchViewManagerCommand,
        },
        findNodeHandle: harness.findNodeHandle,
      }));
      jest.doMock(
        'react-native/Libraries/Utilities/codegenNativeCommands',
        () => ({ __esModule: true, default: harness.codegenNativeCommands })
      );
      jest.doMock(
        'react-native/Libraries/Utilities/codegenNativeComponent',
        () => ({ __esModule: true, default: harness.codegenNativeComponent })
      );
      harness.spec = require(path);
    });
  } finally {
    if (previous === undefined) {
      delete g.nativeFabricUIManager;
    } else {
      g.nativeFabricUIManager = previous;
    }
  }

  return harness;
};

const view = { name: 'view-ref' } as never;

describe('HTML5AdNativeComponent spec', () => {
  it('registers the native component and its commands', () => {
    const h = loadSpec('../specs/HTML5AdNativeComponent', {
      os: 'ios',
      fabric: true,
    });

    expect(h.codegenNativeComponent).toHaveBeenCalledWith(
      'HTML5AdNativeComponent'
    );
    expect(h.codegenNativeCommands).toHaveBeenCalledWith({
      supportedCommands: ['loadAd', 'destroy'],
    });
    expect(h.spec.default).toBe('HTML5AdNativeComponent');
  });

  it.each<Platform>(['ios', 'android'])(
    'uses codegen commands on Fabric (%s)',
    (os) => {
      const h = loadSpec('../specs/HTML5AdNativeComponent', {
        os,
        fabric: true,
      });

      h.spec.AdCommands.loadAd(view);
      h.spec.AdCommands.destroy(view);

      expect(h.codegenCommands.loadAd).toHaveBeenCalledWith(view);
      expect(h.codegenCommands.destroy).toHaveBeenCalledWith(view);
      expect(h.dispatchViewManagerCommand).not.toHaveBeenCalled();
    }
  );

  it.each<[Platform, string | number, string | number]>([
    ['ios', 'loadAd', 'destroy'],
    ['android', 1, 2],
  ])(
    'dispatches through UIManager on Paper (%s)',
    (os, loadCommand, destroyCommand) => {
      const h = loadSpec('../specs/HTML5AdNativeComponent', {
        os,
        fabric: false,
        tag: 7,
      });

      h.spec.AdCommands.loadAd(view);
      h.spec.AdCommands.destroy(view);

      expect(h.findNodeHandle).toHaveBeenCalledWith(view);
      expect(h.dispatchViewManagerCommand.mock.calls).toEqual([
        [7, loadCommand, []],
        [7, destroyCommand, []],
      ]);
      expect(h.codegenCommands.loadAd).not.toHaveBeenCalled();
    }
  );

  it('skips dispatch on Paper when the view has no tag', () => {
    const h = loadSpec('../specs/HTML5AdNativeComponent', {
      os: 'android',
      fabric: false,
      tag: null,
    });

    h.spec.AdCommands.loadAd(view);
    h.spec.AdCommands.destroy(view);

    expect(h.dispatchViewManagerCommand).not.toHaveBeenCalled();
  });
});

describe('AdPreviewNativeComponent spec', () => {
  it('registers the native component and its commands', () => {
    const h = loadSpec('../specs/AdPreviewNativeComponent', {
      os: 'ios',
      fabric: true,
    });

    expect(h.codegenNativeComponent).toHaveBeenCalledWith(
      'AdPreviewNativeComponent'
    );
    expect(h.codegenNativeCommands).toHaveBeenCalledWith({
      supportedCommands: ['loadAd'],
    });
  });

  it('uses codegen commands on Fabric', () => {
    const h = loadSpec('../specs/AdPreviewNativeComponent', {
      os: 'android',
      fabric: true,
    });

    h.spec.AdPreviewCommands.loadAd(view);

    expect(h.codegenCommands.loadAd).toHaveBeenCalledWith(view);
    expect(h.dispatchViewManagerCommand).not.toHaveBeenCalled();
  });

  it.each<[Platform, string | number]>([
    ['ios', 'loadAd'],
    ['android', 1],
  ])('dispatches through UIManager on Paper (%s)', (os, loadCommand) => {
    const h = loadSpec('../specs/AdPreviewNativeComponent', {
      os,
      fabric: false,
      tag: 9,
    });

    h.spec.AdPreviewCommands.loadAd(view);

    expect(h.dispatchViewManagerCommand).toHaveBeenCalledWith(
      9,
      loadCommand,
      []
    );
  });

  it('skips dispatch on Paper when the view has no tag', () => {
    const h = loadSpec('../specs/AdPreviewNativeComponent', {
      os: 'ios',
      fabric: false,
      tag: null,
    });

    h.spec.AdPreviewCommands.loadAd(view);

    expect(h.dispatchViewManagerCommand).not.toHaveBeenCalled();
  });
});

describe('NativeAdgeist spec', () => {
  it('binds to the "Adgeist" TurboModule', () => {
    const module = { name: 'turbo-module' };
    const getEnforcing = jest.fn(() => module);
    let spec: any;

    jest.isolateModules(() => {
      jest.doMock('react-native', () => ({
        TurboModuleRegistry: { getEnforcing },
      }));
      spec = require('../specs/NativeAdgeist');
    });

    expect(getEnforcing).toHaveBeenCalledWith('Adgeist');
    expect(spec.default).toBe(module);
  });
});
