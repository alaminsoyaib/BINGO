import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Modal, Share, StatusBar, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { theme } from '../theme';
import GameButton from '../components/GameButton';

const CloudLobbyScreen = ({ session, onBack, onEnterGame, playerName: savedPlayerName, onPlayerNameChange }) => {
  const [playerName, setPlayerName] = useState(savedPlayerName || '');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [settingsVisible, setSettingsVisible] = useState(false);

  const isConnected = session.status === 'connected';
  const isHost = session.role === 'host';
  const displayName = playerName.trim() || savedPlayerName?.trim() || 'Player';

  useEffect(() => {
    setPlayerName(savedPlayerName || '');
  }, [savedPlayerName]);

  useEffect(() => {
    if (session.inGame) {
      onEnterGame();
    }
  }, [session.inGame, onEnterGame]);

  const handleNameSave = async () => {
    if (!onPlayerNameChange) return;
    const nextName = playerName.trim();
    if (nextName) {
      await onPlayerNameChange(nextName);
    }
    setSettingsVisible(false);
  };

  const handleCreateRoom = () => {
    session.createRoom({ name: displayName });
  };

  const handleJoinRoom = () => {
    session.joinRoom({ roomCode: roomCodeInput.trim().toUpperCase(), name: displayName });
  };

  const shareInvite = async () => {
    if (!session.roomCode) return;
    const message = `Join my BINGO room: ${session.roomCode}`;
    await Share.share({ message });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <View style={styles.headerWrapper}>
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.backButtonIcon} onPress={onBack}>
              <Ionicons name="arrow-back" size={28} color={theme.colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingsButtonIcon}
              onPress={() => setSettingsVisible(true)}
            >
              <Ionicons name="settings-sharp" size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.screenTitle}>GLOBAL PLAY</Text>
        </View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {!isConnected && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CREATE A ROOM</Text>
            <Text style={styles.helpText}>Host a game for anyone, anywhere.</Text>
            <GameButton title="CREATE ROOM" variant="primary" onPress={handleCreateRoom} style={styles.actionButton} />

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>JOIN A ROOM</Text>
            <TextInput
              style={styles.input}
              placeholder="ENTER ROOM CODE"
              value={roomCodeInput}
              onChangeText={(text) => setRoomCodeInput(text.toUpperCase())}
              autoCapitalize="characters"
              placeholderTextColor={theme.colors.textSecondary}
              maxLength={6}
            />
            <GameButton title="JOIN ROOM" variant="secondary" onPress={handleJoinRoom} style={styles.actionButton} />
          </View>
        )}

        {isConnected && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{isHost ? 'HOSTING ROOM' : 'CONNECTED TO ROOM'}</Text>
            <View style={styles.roomCodeContainer}>
              <Text style={styles.roomCode}>{session.roomCode}</Text>
            </View>

            <View style={styles.playerList}>
              <Text style={styles.listHeader}>PLAYERS ({session.players.length})</Text>
              {session.players.map((player) => (
                <View key={player.id} style={styles.playerItem}>
                  <Text style={styles.playerItemText}>• {player.name}</Text>
                  <Text style={[styles.playerStatus, player.ready ? styles.statusReady : styles.statusWaiting]}>
                    {player.ready ? 'READY' : 'WAITING'}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.qrContainer}>
              <View style={styles.qrWrapper}>
                <QRCode value={session.roomCode || ''} size={160} backgroundColor={theme.colors.surface} color={theme.colors.textPrimary} />
              </View>
            </View>

            <View style={styles.actionRow}>
              <GameButton title="SHARE" variant="secondary" onPress={shareInvite} style={styles.halfBtn} />
              <GameButton title={isHost ? "START" : "READY"} variant="success" onPress={() => {
                if (isHost) {
                  if (session.startGame) session.startGame();
                } else {
                  if (session.sendReady) session.sendReady();
                }
              }} style={styles.halfBtn} />
            </View>
            <GameButton title="EXIT ROOM" variant="danger" onPress={onBack} style={{ marginTop: theme.spacing.md }} />
          </View>
        )}

        {session.error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{session.error}</Text>
          </View>
        )}
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={settingsVisible} animationType="fade" transparent={true} onRequestClose={() => setSettingsVisible(false)}>
        <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>SETTINGS</Text>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>YOUR NAME</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Player name"
                  value={playerName}
                  onChangeText={setPlayerName}
                  placeholderTextColor={theme.colors.textSecondary}
                  maxLength={16}
                  autoCapitalize="characters"
                />
              </View>
              <GameButton title="SAVE" variant="primary" onPress={handleNameSave} style={{ marginTop: 10 }} />
              <GameButton title="CANCEL" variant="secondary" onPress={() => {
                setPlayerName(savedPlayerName || '');
                setSettingsVisible(false);
              }} style={{ marginTop: 10 }} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      </View>
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
    paddingHorizontal: 8,
    paddingTop: 10,
    alignItems: 'center',
  },
  headerWrapper: {
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 70,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 4,
    right: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
    elevation: 10,
  },
  backButtonIcon: {
    padding: 8,
    backgroundColor: 'rgba(45, 42, 67, 0.6)',
    borderRadius: 20,
  },
  settingsButtonIcon: {
    padding: 8,
    backgroundColor: 'rgba(45, 42, 67, 0.6)',
    borderRadius: 20,
  },
  screenTitle: {
    ...theme.typography.h1,
    color: theme.colors.textPrimary,
    letterSpacing: 1,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  scrollContainer: {
    padding: theme.spacing.md,
    gap: theme.spacing.lg,
    width: '100%',
  },
  section: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    borderWidth: 2,
    borderColor: theme.colors.surfaceLight,
    ...theme.shadows.card,
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.accentYellow,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  helpText: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  input: {
    backgroundColor: theme.colors.background,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    color: theme.colors.textPrimary,
    ...theme.typography.h2,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  actionButton: {
    marginTop: theme.spacing.sm,
  },
  divider: {
    height: 2,
    backgroundColor: theme.colors.surfaceLight,
    marginVertical: theme.spacing.xl,
  },
  roomCodeContainer: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 2,
    borderColor: theme.colors.accent,
    marginBottom: theme.spacing.lg,
  },
  roomCode: {
    fontSize: 32,
    fontWeight: '900',
    color: theme.colors.accent,
    textAlign: 'center',
    letterSpacing: 8,
  },
  playerList: {
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  listHeader: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    fontWeight: 'bold',
  },
  playerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  playerItemText: {
    ...theme.typography.body1,
    color: theme.colors.textPrimary,
  },
  playerStatus: {
    ...theme.typography.body2,
    fontWeight: 'bold',
  },
  statusReady: {
    color: theme.colors.success,
  },
  statusWaiting: {
    color: theme.colors.warning,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  qrWrapper: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sm,
  },
  actionRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  halfBtn: {
    flex: 1,
  },
  errorBox: {
    backgroundColor: 'rgba(214, 48, 49, 0.2)',
    borderWidth: 2,
    borderColor: theme.colors.danger,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.danger,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  modalContent: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.surfaceLight,
    ...theme.shadows.card,
  },
  modalTitle: {
    ...theme.typography.h2,
    color: theme.colors.accentYellow,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  }
});

export default CloudLobbyScreen;
