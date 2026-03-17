import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';
import { theme } from '../theme';
import GameButton from '../components/GameButton';
import PlayerSettingsModal from '../components/PlayerSettingsModal';

const ModeSelectScreen = ({ onSelectMode, currentName, onSaveName }) => {
  const [settingsVisible, setSettingsVisible] = useState(false);


  const handleSave = async (newName) => {
    if (!newName) return;
    await onSaveName(newName);
    setSettingsVisible(false);
  };

  return (
    <>
      <ScreenWrapper style={styles.container}>
        <View style={styles.topBar}>
          <View style={styles.playerBadge}>
            <Text style={styles.nameLabel}>PLAYER</Text>
            <Text style={styles.nameBadge}>{currentName || 'Player'}</Text>
          </View>
          <TouchableOpacity activeOpacity={0.8} style={styles.settingsButton} onPress={() => setSettingsVisible(true)}>
            <Ionicons name="settings-sharp" size={20} color={theme.colors.accentYellow} />
          </TouchableOpacity>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>BINGO</Text>
          <View style={styles.titleUnderline} />
          <Text style={styles.subtitle}>CHOOSE GAME MODE</Text>
        </View>

        <View style={styles.buttonGroup}>
          <GameButton
            title="OFFLINE"
            subtitle="Play locally without networking"
            variant="accent"
            onPress={() => onSelectMode('offline')}
            style={styles.button}
          />

          <GameButton
            title="LOCAL MULTIPLAYER"
            subtitle="Play together on Wi-Fi (LAN)"
            variant="primary"
            onPress={() => onSelectMode('online')}
            style={styles.button}
          />

          <GameButton
            title="GLOBAL MULTIPLAYER"
            subtitle="Play with anyone, anywhere"
            variant="secondary"
            onPress={() => onSelectMode('cloud')}
            style={styles.button}
          />
        </View>
      </ScreenWrapper>

      <PlayerSettingsModal 
        visible={settingsVisible} 
        onClose={() => setSettingsVisible(false)} 
        onSave={handleSave} 
        initialName={currentName} 
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: theme.spacing.xxl * 2,
    paddingTop: theme.spacing.xl,
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.lg,
    borderWidth: 2,
    borderColor: theme.colors.surfaceLight,
  },
  playerBadge: {
    flexDirection: 'column',
    paddingHorizontal: theme.spacing.sm,
  },
  nameLabel: {
    color: theme.colors.textSecondary,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  nameBadge: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  settingsButton: {
    backgroundColor: theme.colors.surfaceLight,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.md,
  },
  titleContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.textPrimary,
    textShadowColor: theme.colors.primary,
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
    fontSize: 64,
  },
  titleUnderline: {
    height: 4,
    width: 100,
    backgroundColor: theme.colors.accent,
    borderRadius: 2,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    ...theme.typography.button,
    color: theme.colors.textSecondary,
    letterSpacing: 2,
  },
  buttonGroup: {
    width: '100%',
    gap: theme.spacing.lg,
  },
  button: {
    width: '100%',
  }
});

export default ModeSelectScreen;
