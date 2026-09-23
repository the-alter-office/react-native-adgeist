import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import FixedAdspaceScreen from './screens/FixedAdspaceScreen';
import ScenariosScreen from './screens/ScenariosScreen';
import VerticalRailScreen from './screens/scenarios/VerticalRailScreen';
import BottomBannerScreen from './screens/scenarios/BottomBannerScreen';
import FixedBoxScreen from './screens/scenarios/FixedBoxScreen';
import ScrollListScreen from './screens/scenarios/ScrollListScreen';

export type RootStackParamList = {
  Home: undefined;
  FixedAdspace: undefined;
  Scenarios: undefined;
  VerticalRail: undefined;
  BottomBanner: undefined;
  FixedBox: undefined;
  ScrollList: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#1a1a1a' },
          headerTintColor: 'white',
          contentStyle: { backgroundColor: 'black' },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="FixedAdspace"
          component={FixedAdspaceScreen}
          options={{ title: 'Fixed Adspace' }}
        />
        <Stack.Screen
          name="Scenarios"
          component={ScenariosScreen}
          options={{ title: 'Layout Scenarios' }}
        />
        <Stack.Screen
          name="VerticalRail"
          component={VerticalRailScreen}
          options={{ title: 'Vertical Rail' }}
        />
        <Stack.Screen
          name="BottomBanner"
          component={BottomBannerScreen}
          options={{ title: 'Bottom Banner' }}
        />
        <Stack.Screen
          name="FixedBox"
          component={FixedBoxScreen}
          options={{ title: 'Fixed Box' }}
        />
        <Stack.Screen
          name="ScrollList"
          component={ScrollListScreen}
          options={{ title: 'In a ScrollView' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
