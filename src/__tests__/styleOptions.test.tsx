import type { ReactElement } from 'react';

import { HTML5AdView } from '../components/HTML5AdView';
import { HTML5AdViewPreview } from '../components/HTML5AdViewPreview';
import type { AdStyleOptions } from '../types/HTML5AdNativeComponentProps';

// No React renderer is installed, so hooks are stubbed and each component's
// render function is called directly to read the props it sends to native.
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useRef: (current: unknown) => ({ current }),
  useState: (initial: unknown) => [initial, () => {}],
  useCallback: (fn: unknown) => fn,
  useMemo: (fn: () => unknown) => fn(),
  useEffect: () => {},
  useImperativeHandle: () => {},
}));

jest.mock('../specs/HTML5AdNativeComponent', () => ({
  __esModule: true,
  default: 'HTML5AdNativeComponent',
  AdCommands: { loadAd: jest.fn(), destroy: jest.fn() },
}));

jest.mock('../specs/AdPreviewNativeComponent', () => ({
  __esModule: true,
  default: 'AdPreviewNativeComponent',
  AdPreviewCommands: { loadAd: jest.fn() },
}));

type NativeProps = {
  styleOptions?: string;
  fontUrl?: string;
  brandName?: string;
  brandLogoUrl?: string;
};

const render = (component: unknown, props: object): NativeProps =>
  ((component as any).render(props, null) as ReactElement<NativeProps>).props;

const fullStyleOptions: AdStyleOptions = {
  backgroundColor: '#FFFFFF',
  cornerRadius: 'LG',
  showBorder: false,
  borderColor: '#E0E0E0',
  adLabel: 'SPONSORED',
  fontFamily: 'custom',
  textAlign: 'CENTER',
  titleColor: '#111',
  titleFontStyle: 'BOLD',
  descriptionColor: '#555555',
  descriptionFontStyle: 'ITALIC',
  ctaStyle: 'OUTLINE',
  ctaShape: 'PILL',
  ctaBackgroundColor: '#000000',
  ctaTextColor: '#FFFFFF',
  ctaBorderColor: '#000000',
};

const components = [
  ['HTML5AdView', HTML5AdView, { adUnitID: 'unit-1' }],
  ['HTML5AdViewPreview', HTML5AdViewPreview, { type: 'display' }],
] as const;

describe.each(components)('%s styleOptions', (_name, component, base) => {
  const sendStyleOptions = (styleOptions: unknown) =>
    render(component, { ...base, styleOptions }).styleOptions;

  it('sends every field as a JSON string', () => {
    const sent = sendStyleOptions(fullStyleOptions);

    expect(typeof sent).toBe('string');
    expect(JSON.parse(sent!)).toEqual(fullStyleOptions);
  });

  it('sends nothing when styleOptions is not set', () => {
    expect(render(component, base).styleOptions).toBeUndefined();
  });

  it.each([null, false, 0, ''])('sends nothing for falsy %p', (value) => {
    expect(sendStyleOptions(value)).toBeUndefined();
  });

  it('sends an empty object as "{}"', () => {
    expect(sendStyleOptions({})).toBe('{}');
  });

  it('passes unknown keys through unchanged', () => {
    const sent = sendStyleOptions({ titleColor: '#000', notAnOption: 1 });

    expect(JSON.parse(sent!)).toEqual({ titleColor: '#000', notAnOption: 1 });
  });

  it('passes wrong-typed values through unchanged', () => {
    const malformed = {
      backgroundColor: 123,
      cornerRadius: 'huge',
      showBorder: 'yes',
      borderColor: null,
      adLabel: ['AD'],
      titleFontStyle: { bold: true },
    };

    expect(JSON.parse(sendStyleOptions(malformed)!)).toEqual(malformed);
  });

  it('drops undefined and function values', () => {
    const sent = sendStyleOptions({
      titleColor: undefined,
      ctaStyle: () => 'FILLED',
      ctaShape: 'SQUARE',
    });

    expect(sent).toBe('{"ctaShape":"SQUARE"}');
  });

  it.each([
    ['a string', 'red', '"red"'],
    ['a number', 42, '42'],
    ['an array', [{ titleColor: '#000' }], '[{"titleColor":"#000"}]'],
  ])('serializes %s without throwing', (_label, value, expected) => {
    expect(sendStyleOptions(value)).toBe(expected);
  });
});

describe.each(components)('%s fontUrl', (_name, component, base) => {
  const sendFontUrl = (fontUrl: unknown) =>
    render(component, { ...base, fontUrl }).fontUrl;

  it('passes fontUrl through unchanged', () => {
    const url = 'https://fonts.googleapis.com/css2?family=Inter';

    expect(sendFontUrl(url)).toBe(url);
  });

  it('sends nothing when fontUrl is not set', () => {
    expect(sendFontUrl(undefined)).toBeUndefined();
  });

  it('passes an empty string through for native to ignore', () => {
    expect(sendFontUrl('')).toBe('');
  });
});

describe.each([
  ['brandName', 'Acme'],
  ['brandLogoUrl', 'https://example.com/logo.png'],
] as const)('HTML5AdViewPreview %s', (prop, value) => {
  const send = (sent: unknown) =>
    render(HTML5AdViewPreview, { type: 'display', [prop]: sent })[prop];

  it('passes the value through unchanged', () => {
    expect(send(value)).toBe(value);
  });

  it('sends nothing when not set, so native shows the default', () => {
    expect(send(undefined)).toBeUndefined();
  });

  it('passes an empty string through for native to treat as unset', () => {
    expect(send('')).toBe('');
  });
});
