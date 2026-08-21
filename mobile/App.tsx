import {
  Figtree_400Regular,
  Figtree_700Bold,
  Figtree_800ExtraBold,
} from '@expo-google-fonts/figtree';
import { Fraunces_700Bold, Fraunces_900Black_Italic } from '@expo-google-fonts/fraunces';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LandingScreen } from './src/screens/LandingScreen';
import { PlayScreen } from './src/screens/PlayScreen';
import { SetupScreen } from './src/screens/SetupScreen';
import { GameProvider, useGameStore } from './src/state/gameStore';
import { paper } from './src/theme/paper';

SplashScreen.preventAutoHideAsync();

function Root() {
  const { state } = useGameStore();
  const [showLanding, setShowLanding] = useState(true);

  if (showLanding && state.phase === 'setup') {
    return (
      <>
        <StatusBar style="dark" />
        <LandingScreen onStart={() => setShowLanding(false)} />
      </>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      {state.phase === 'setup' ? (
        <SetupScreen onBack={() => setShowLanding(true)} />
      ) : (
        <PlayScreen />
      )}
    </>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Fraunces_900Black_Italic,
    Fraunces_700Bold,
    Figtree_400Regular,
    Figtree_700Bold,
    Figtree_800ExtraBold,
  });

  const onLayoutRootView = useCallback(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <GameProvider>
        <View style={{ flex: 1, backgroundColor: paper.cream }} onLayout={onLayoutRootView}>
          <Root />
        </View>
      </GameProvider>
    </SafeAreaProvider>
  );
}
