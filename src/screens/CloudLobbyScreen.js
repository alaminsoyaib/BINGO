import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Share, StatusBar, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { theme } from '../theme';
import GameButton from '../components/GameButton';

const CloudLobbyScreen = ({ session, onBack, onEnterGame, playerName: savedPlayerName, onPlayerNameChange }) => {
  const [playerName, setPlayerName] = useState(savedPlayerName || '');
  const [roomCodeInput, setRoomCodeInput] = useState('');

  const isConnected = session.status === 'connected';
  const isHost = session.role === 'host';
  const displayName = playerName.trim() || savedPlayerName?.trim() || 'Player';

  useEffect(() => {
    setPlayerName(savedPlayerName || '');
  }, [savedPlayerName]);

  const handleNameBlur = async () => {
    if (!onPlayerNameChange) return;
    const nextName = playerName.trim();
    if (!nextName) return;
    await onPlayerNameChange(nextName);
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
      <View style={styles.topRow}>
        <GameButton title="BACK" variant="danger" onPress={onBack} style={styles.backButton} />
        <Text style={styles.title}>GLOBAL PLAY</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>YOUR AGENT NAME</Text>
          <TextInput
            style={styles.input}
            placeholder="Player name"
            value={playerName}
            onChangeText={setPlayerName}
            onBlur={handleNameBlur}
            placeholderTextColor={theme.colors.textSecondary}
            maxLength={16}
            autoCapitalize="characters"
          />
        </View>

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
              <GameButton title="ENTER GAME" variant="accent" onPress={onEnterGame} style={styles.halfBtn} />
            </View>
          </View>
        )}

        {session.error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{session.error}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 2,
    borderColor: theme.colors.surfaceLight,
  },
  backButton: {
    width: 100,
    marginRight: theme.spacing.md,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.textPrimary,
    flex: 1,
    textAlign: 'center',
    paddingRight: 100 + theme.spacing.md, // offset back button width
  },
  scrollContainer: {
    padding: theme.spacing.md,
    gap: theme.spacing.lg,
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
  }
});

export default CloudLobbyScreen;
