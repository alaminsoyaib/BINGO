import React, { useCallback, useEffect, useLayoutEffect, useState, useRef } from 'react';
import { BackHandler, Text, TextInput, Animated, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

// Set global custom font styles to bypass system fonts on Android devices like Samsung
if (Text.defaultProps == null) {
  Text.defaultProps = {};
  Text.defaultProps.allowFontScaling = false;
}
if (TextInput.defaultProps == null) {
  TextInput.defaultProps = {};
  TextInput.defaultProps.allowFontScaling = false;
}
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BingoScreen from './src/screens/BingoScreen';
import ModeSelectScreen from './src/screens/ModeSelectScreen';
import OnlineLobbyScreen from './src/screens/OnlineLobbyScreen';
import CloudLobbyScreen from './src/screens/CloudLobbyScreen';
import FirstLaunchNameScreen from './src/screens/FirstLaunchNameScreen';
import { useLanSession } from './src/hooks/useLanSession';
import { useCloudSession } from './src/hooks/useCloudSession';

const PLAYER_NAME_KEY = 'bingo_player_name';

const generateDefaultName = () => {
  const adjectives = ['Swift', 'Lucky', 'Bright', 'Nova', 'Pixel', 'Echo', 'Blaze', 'Comet'];
  const nouns = ['Falcon', 'Tiger', 'Player', 'Rocket', 'Vibe', 'Bingo', 'Spark', 'Wave'];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(100 + Math.random() * 900);
  return `${adjective}${noun}${number}`;
};

/**
 * Simple, robust screen transition.
 * - Always renders live children (no snapshots — lobby updates work).
 * - On screen change: snap invisible before paint, then fade+scale in.
 */
const ScreenTransition = ({ screenKey, children }) => {
  const anim = useRef(new Animated.Value(1)).current;
  const prevKey = useRef(screenKey);

  useLayoutEffect(() => {
    if (screenKey === prevKey.current) return;
    prevKey.current = screenKey;

    // Snap invisible before the frame paints — hides the content swap
    anim.setValue(0);

    // Smoothly reveal the new screen
    Animated.timing(anim, {
      toValue: 1,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [screenKey]);

  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1],
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#1a1a2e' }}>
      <Animated.View style={{ flex: 1, opacity: anim, transform: [{ scale }] }}>
        {children}
      </Animated.View>
    </View>
  );
};

export default function App() {
  const [mode, setMode] = useState(null);
  const [screen, setScreen] = useState('mode');
  const [playerName, setPlayerName] = useState('');
  const [needsNameSetup, setNeedsNameSetup] = useState(true);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const localSession = useLanSession();
  const cloudSession = useCloudSession();

  const activeSession = mode === 'online' ? localSession : mode === 'cloud' ? cloudSession : null;

  useEffect(() => {
    const bootstrapName = async () => {
      try {
        const storedName = await AsyncStorage.getItem(PLAYER_NAME_KEY);
        if (storedName && storedName.trim()) {
          setPlayerName(storedName.trim());
          setNeedsNameSetup(false);
        }
      } finally {
        setIsBootstrapping(false);
      }
    };

    bootstrapName();
  }, []);

  const persistPlayerName = useCallback(async (nextName) => {
    const value = (nextName || '').trim();
    if (!value) return;
    setPlayerName(value);
    await AsyncStorage.setItem(PLAYER_NAME_KEY, value);
  }, []);

  const handleNameSetupDone = useCallback(async (enteredName) => {
    const trimmed = (enteredName || '').trim();
    await persistPlayerName(trimmed || generateDefaultName());
    setNeedsNameSetup(false);
  }, [persistPlayerName]);

  const handlePlayerNameChange = useCallback(async (nextName) => {
    await persistPlayerName(nextName);
  }, [persistPlayerName]);

  const handleSelectMode = useCallback((nextMode) => {
    setMode(nextMode);
    setScreen(nextMode === 'online' || nextMode === 'cloud' ? 'lobby' : 'game');
  }, []);

  const handleBackToMode = useCallback(() => {
    if (mode === 'online' || mode === 'cloud') {
      activeSession?.leaveRoom();
    }
    setMode(null);
    setScreen('mode');
  }, [activeSession, mode]);

  const handleEnterGame = useCallback(() => {
    setScreen('game');
  }, []);

  const handleBackFromGame = useCallback(() => {
    if (mode === 'online' || mode === 'cloud') {
      setScreen('lobby');
      return;
    }
    setMode(null);
    setScreen('mode');
  }, [mode]);

  const handleExitOnline = useCallback(() => {
    activeSession?.leaveRoom();
    setMode(null);
    setScreen('mode');
  }, [activeSession]);

  const handleReturnToLobby = useCallback(() => {
    setScreen('lobby');
  }, []);

  useEffect(() => {
    const onBackPress = () => {
      if (screen === 'lobby') {
        handleBackToMode();
        return true;
      }
      // Let other screens (like BingoScreen) handle their own back actions natively
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [screen, handleBackToMode]);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <ScreenTransition screenKey={screen}>
        {!isBootstrapping && needsNameSetup && (
          <FirstLaunchNameScreen onContinue={handleNameSetupDone} suggestedName={generateDefaultName()} />
        )}
        {!isBootstrapping && !needsNameSetup && screen === 'mode' && (
          <ModeSelectScreen
            onSelectMode={handleSelectMode}
            currentName={playerName}
            onSaveName={handlePlayerNameChange}
          />
        )}
        {!isBootstrapping && !needsNameSetup && screen === 'lobby' && mode === 'online' && (
          <OnlineLobbyScreen
            session={localSession}
            onBack={handleBackToMode}
            onEnterGame={handleEnterGame}
            playerName={playerName}
            onPlayerNameChange={handlePlayerNameChange}
          />
        )}
        {!isBootstrapping && !needsNameSetup && mode === 'cloud' && screen === 'lobby' && (
          <CloudLobbyScreen
            session={cloudSession}
            onBack={handleBackToMode}
            onEnterGame={handleEnterGame}
            playerName={playerName}
            onPlayerNameChange={handlePlayerNameChange}
          />
        )}
        {!isBootstrapping && !needsNameSetup && screen === 'game' && (
          <BingoScreen
            mode={mode || 'offline'}
            session={activeSession}
            onExitOnline={(mode === 'online' || mode === 'cloud') ? handleExitOnline : null}
            onReturnToLobby={handleReturnToLobby}
            onBack={handleBackFromGame}
          />
        )}
      </ScreenTransition>
    </SafeAreaProvider>
  );
}
