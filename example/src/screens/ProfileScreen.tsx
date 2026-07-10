import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>A</Text>
        </View>
        <Text style={styles.name}>Adgeist User</Text>
        <Text style={styles.email}>user@adgeist.ai</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>App ID</Text>
          <Text style={styles.infoValue}>69a6777707df2b1527e357f9</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Bundle ID</Text>
          <Text style={styles.infoValue}>com.leaguex.crm</Text>
        </View>

        <Pressable style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  card: {
    padding: 20,
    backgroundColor: '#1a1a1a',
    margin: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#63AA75',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  avatarText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  name: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  infoLabel: {
    color: '#ccc',
    fontSize: 14,
  },
  infoValue: {
    color: 'white',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#63AA75',
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
    alignSelf: 'stretch',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
