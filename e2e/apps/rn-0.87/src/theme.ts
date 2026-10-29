import { StyleSheet } from 'react-native';
import { DarkTheme } from '@react-navigation/native';
import type { Theme } from '@react-navigation/native';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

export const colors = {
  background: 'black',
  surface: '#1a1a1a',
  surfaceRaised: '#2a2a2a',
  slot: '#141414',
  border: '#333',
  borderStrong: '#3a3a3a',
  text: 'white',
  textMuted: '#ccc',
  textSubtle: '#999',
  accent: '#63AA75',
  link: '#4A7DFF',
  danger: '#E5484D',
};

export const navigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.accent,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
  },
};

export const stackScreenOptions: NativeStackNavigationOptions = {
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.text,
  contentStyle: { backgroundColor: colors.background },
};

export const shared = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 10,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  title: {
    color: colors.text,
    fontSize: 21,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  body: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 23,
  },
  code: {
    color: colors.accent,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'monospace',
    marginTop: 12,
  },
});
