import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BingoScreen from './src/screens/BingoScreen';
import ModeSelectScreen from './src/screens/ModeSelectScreen';
import OnlineLobbyScreen from './src/screens/OnlineLobbyScreen';
import { useLanSession } from './src/hooks/useLanSession';

export default function App() {
  const [mode, setMode] = useState(null);
  const [screen, setScreen] = useState('mode');
  const session = useLanSession();

  const handleSelectMode = (nextMode) => {
    setMode(nextMode);
    setScreen(nextMode === 'online' ? 'lobby' : 'game');
  };

  const handleBackToMode = () => {
    if (mode === 'online') {
      session.leaveRoom();
    }
    setMode(null);
    setScreen('mode');
  };

  const handleEnterGame = () => {
    setScreen('game');
  };

  const handleExitOnline = () => {
    session.leaveRoom();
    setMode(null);
    setScreen('mode');
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {screen === 'mode' && <ModeSelectScreen onSelectMode={handleSelectMode} />}
      {screen === 'lobby' && (
        <OnlineLobbyScreen
          session={session}
          onBack={handleBackToMode}
          onEnterGame={handleEnterGame}
        />
      )}
      {screen === 'game' && (
        <BingoScreen
          mode={mode || 'offline'}
          session={mode === 'online' ? session : null}
          onExitOnline={mode === 'online' ? handleExitOnline : null}
        />
      )}
    </SafeAreaProvider>
  );
}
