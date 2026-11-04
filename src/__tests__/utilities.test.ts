import { LOAD_FAILURE_CODES, toAdSizeAxis } from '../utilities';

describe('toAdSizeAxis', () => {
  it.each([
    [320, 320],
    [0.5, 0.5],
    [0, undefined],
    [-1, undefined],
    [Number.NaN, undefined],
    [Number.POSITIVE_INFINITY, undefined],
    [undefined, undefined],
  ])('%p -> %p', (input, expected) => {
    expect(toAdSizeAxis(input)).toBe(expected);
  });

  it('rejects a non-number at runtime', () => {
    expect(toAdSizeAxis('320' as never)).toBeUndefined();
  });
});

describe('LOAD_FAILURE_CODES', () => {
  it('matches the codes documented for reserveSpace', () => {
    expect([...LOAD_FAILURE_CODES].sort()).toEqual(
      ['AE1', 'AE2', 'AE3', 'AE4', 'AW1', 'AW2', 'AW3', 'AW6', 'RWAE1'].sort()
    );
  });

  it.each(['AL1', 'AL2', 'AI1', 'AW4', 'AW5', 'AW7', 'AW8', 'RWAW1'])(
    'does not treat %s as a load failure',
    (code) => {
      expect(LOAD_FAILURE_CODES.has(code)).toBe(false);
    }
  );
});
