import { Text, View } from 'react-native';
import { adNumber } from '../config';
import type { AdKind } from '../config';
import { shared } from '../theme';

export function MissingAdCard({ kind }: { kind: AdKind }) {
  const n = adNumber(kind);
  return (
    <View testID={`${kind}-ad-missing`} style={shared.card}>
      <Text style={shared.title}>Ad {n} is not configured</Text>
      <Text style={shared.body}>
        Set ADGEIST_E2E_AD{n}_UNIT_ID in .env at the repo root and rebuild the app. The value is inlined into the JS bundle at build time.
      </Text>
    </View>
  );
}
