import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GameProvider, useGameStore } from './src/state/gameStore';
import { PlayScreen } from './src/screens/PlayScreen';
import { SetupScreen } from './src/screens/SetupScreen';

function Root() {
  const { state } = useGameStore();
  const dark = state.phase !== 'setup';
  return (
    <>
      <StatusBar style={dark ? 'light' : 'dark'} />
      {state.phase === 'setup' ? <SetupScreen /> : <PlayScreen />}
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <GameProvider>
        <View style={{ flex: 1, backgroundColor: '#0B0415' }}>
          <Root />
        </View>
      </GameProvider>
    </SafeAreaProvider>
  );
}
