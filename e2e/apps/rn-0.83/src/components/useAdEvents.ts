import { useCallback, useMemo, useState } from 'react';
import type { NativeSyntheticEvent } from 'react-native';
import type { AdViewEvent } from '@thealteroffice/react-native-adgeist';

const AD_RENDERED_CODE = 'AL1';
const CLICK_HANDLED_CODE = 'AI1';
const ALLOWED_WARNING_CODES: string[] = [];

export type ReceivedEvent = {
  at: string;
  code: string;
  type: string;
  message: string;
  reason: string;
};

function isUnexpected(code: string) {
  if (code.startsWith('AE') || code === 'RWAE1') {
    return true;
  }
  return code.startsWith('AW') && !ALLOWED_WARNING_CODES.includes(code);
}

export function useAdEvents() {
  const [events, setEvents] = useState<ReceivedEvent[]>([]);

  const onAdEvent = useCallback((event: NativeSyntheticEvent<AdViewEvent>) => {
    const { code, type, message, data } = event.nativeEvent;
    const at = new Date().toTimeString().slice(0, 8);
    setEvents((current) => [...current, { at, code, type, message, reason: data?.reason ?? '' }]);
  }, []);

  const clear = useCallback(() => setEvents([]), []);

  const summary = useMemo(() => {
    const codes = events.map((e) => e.code);
    return {
      codes,
      adRendered: codes.includes(AD_RENDERED_CODE),
      clickHandled: codes.includes(CLICK_HANDLED_CODE),
      unexpected: [...new Set(codes.filter(isUnexpected))],
    };
  }, [events]);

  return { events, onAdEvent, clear, ...summary };
}
