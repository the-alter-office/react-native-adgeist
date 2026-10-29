import { Text, View } from 'react-native';
import { shared } from '../theme';

type Props = {
  title: string;
  body: string;
  code?: string;
};

export function InfoCard({ title, body, code }: Props) {
  return (
    <View style={shared.card}>
      <Text style={shared.title}>{title}</Text>
      <Text style={shared.body}>{body}</Text>
      {code ? <Text style={shared.code}>{code}</Text> : null}
    </View>
  );
}
