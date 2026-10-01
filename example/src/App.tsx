import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { NavigatorScreenParams } from '@react-navigation/native';
import HomeScreen from './screens/HomeScreen';
import TestScreen from './screens/TestScreen';
import SettingsScreen from './screens/SettingsScreen';
import FixedAdspaceScreen from './screens/FixedAdspaceScreen';
import ScenariosScreen from './screens/ScenariosScreen';
import VerticalRailScreen from './screens/scenarios/VerticalRailScreen';
import BottomBannerScreen from './screens/scenarios/BottomBannerScreen';
import FixedBoxScreen from './screens/scenarios/FixedBoxScreen';
import ScrollListScreen from './screens/scenarios/ScrollListScreen';

export type RootTabParamList = {
  Home: undefined;
  Test: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<RootTabParamList>;
  FixedAdspace: undefined;
  Scenarios: undefined;
  VerticalRail: undefined;
  BottomBanner: undefined;
  FixedBox: undefined;
  ScrollList: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

function Tabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: { backgroundColor: '#1a1a1a' },
        headerTintColor: 'white',
        tabBarStyle: { backgroundColor: '#1a1a1a', borderTopColor: '#333' },
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: '#888',
        sceneStyle: { backgroundColor: 'black' },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Test" component={TestScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Tabs"
        screenOptions={{
          headerStyle: { backgroundColor: '#1a1a1a' },
          headerTintColor: 'white',
          contentStyle: { backgroundColor: 'black' },
        }}
      >
        <Stack.Screen
          name="Tabs"
          component={Tabs}
          options={{ headerShown: false }}
        />
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
