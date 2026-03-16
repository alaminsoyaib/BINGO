import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import GameButton from '../components/GameButton';

const ModeSelectScreen = ({ onSelectMode, currentName, onSaveName }) => {
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [draftName, setDraftName] = useState(currentName || '');

  useEffect(() => {
    setDraftName(currentName || '');
  }, [currentName]);

  const handleSave = async () => {
    const value = draftName.trim();
    if (!value) return;
    await onSaveName(value);
    setSettingsVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <View style={styles.topBar}>
          <View style={styles.playerBadge}>
            <Text style={styles.nameLabel}>PLAYER</Text>
            <Text style={styles.nameBadge}>{currentName || 'Player'}</Text>
          </View>
          <TouchableOpacity activeOpacity={0.8} style={styles.settingsButton} onPress={() => setSettingsVisible(true)}>
            <Text style={styles.settingsButtonText}>✎ EDIT</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>BINGO</Text>
          <View style={styles.titleUnderline} />
          <Text style={styles.subtitle}>CHOOSE GAME MODE</Text>
        </View>

        <View style={styles.buttonGroup}>
          <GameButton
            title="PRACTICE (OFFLINE)"
            subtitle="Play solo on this device"
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
      </View>

      <Modal visible={settingsVisible} transparent animationType="slide" onRequestClose={() => setSettingsVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>PLAYER PROFILE</Text>
            <Text style={styles.modalHint}>Enter your display name for multiplayer games.</Text>
            <TextInput
              style={styles.nameInput}
              value={draftName}
              onChangeText={setDraftName}
              placeholder="Enter player name"
              placeholderTextColor={theme.colors.textSecondary}
              maxLength={16}
              autoCapitalize="characters"
            />
            <View style={styles.modalActions}>
              <GameButton title="CANCEL" variant="danger" onPress={() => setSettingsVisible(false)} style={styles.modalBtn} />
              <GameButton title="SAVE" variant="success" onPress={handleSave} style={styles.modalBtn} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
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
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
  },
  settingsButtonText: {
    color: theme.colors.accentYellow,
    fontWeight: '900',
    fontSize: 14,
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalCard: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    borderWidth: 4,
    borderColor: theme.colors.surfaceLight,
  },
  modalTitle: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  modalHint: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  nameInput: {
    backgroundColor: theme.colors.background,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    color: theme.colors.textPrimary,
    ...theme.typography.h2,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  modalBtn: {
    flex: 1,
  },
});

export default ModeSelectScreen;
