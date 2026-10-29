import { useCallback, useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AdgeistProvider } from '@thealteroffice/react-native-adgeist';
import type { RootStackParamList } from './src/navigation';
import { InitializingView, SdkStatusContext } from './src/components/SdkStatus';
import type { SdkState } from './src/components/SdkStatus';
import HomeScreen from './src/screens/HomeScreen';
import CompanionAdScreen from './src/screens/CompanionAdScreen';
import BannerAdScreen from './src/screens/BannerAdScreen';
import DisplayAdScreen from './src/screens/DisplayAdScreen';
import { colors, navigationTheme, stackScreenOptions } from './src/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [sdk, setSdk] = useState<SdkState>({ status: 'initializing' });

  const handleInitSuccess = useCallback(() => setSdk({ status: 'initialized' }), []);
  const handleInitError = useCallback(
    (error: Error) => setSdk({ status: 'error', error: error.message }),
    []
  );

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <SdkStatusContext.Provider value={sdk}>
        <View style={styles.root}>
          <AdgeistProvider
            onInitializationSuccess={handleInitSuccess}
            onInitializationError={handleInitError}
          >
            <NavigationContainer theme={navigationTheme}>
              <Stack.Navigator initialRouteName="Home" screenOptions={stackScreenOptions}>
                <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Adgeist E2E' }} />
                <Stack.Screen
                  name="CompanionAd"
                  component={CompanionAdScreen}
                  options={{ title: 'Companion Ad' }}
                />
                <Stack.Screen
                  name="BannerAd"
                  component={BannerAdScreen}
                  options={{ title: 'Banner Ad' }}
                />
                <Stack.Screen
                  name="DisplayAd"
                  component={DisplayAdScreen}
                  options={{ title: 'Display Ad' }}
                />
              </Stack.Navigator>
            </NavigationContainer>
          </AdgeistProvider>
          {sdk.status === 'initializing' ? <InitializingView /> : null}
        </View>
      </SdkStatusContext.Provider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
