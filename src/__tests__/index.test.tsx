import * as Adgeist from '../index';

jest.mock('../specs/NativeAdgeist');

describe('public API', () => {
  it.each([
    'AdgeistProvider',
    'useAdgeistContext',
    'setUserDetails',
    'logEvent',
    'getConsentStatus',
    'updateConsentStatus',
  ])('exports %s as a function', (name) => {
    expect(typeof Adgeist[name as keyof typeof Adgeist]).toBe('function');
  });

  it.each(['HTML5AdView', 'HTML5AdViewPreview'])(
    'exports %s as a forwardRef component',
    (name) => {
      const component = Adgeist[name as keyof typeof Adgeist] as {
        $$typeof?: symbol;
        displayName?: string;
      };
      expect(component.$$typeof).toBe(Symbol.for('react.forward_ref'));
      expect(component.displayName).toBe(name);
    }
  );
});
