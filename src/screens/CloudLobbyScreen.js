import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, Share, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, BackHandler } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Clipboard from 'expo-clipboard';

import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import ScreenWrapper from '../components/ScreenWrapper';
import { theme } from '../theme';
import GameButton from '../components/GameButton';
import PlayerSettingsModal from '../components/PlayerSettingsModal';
import ScreenHeader from '../components/ScreenHeader';
import StyledInput from '../components/StyledInput';
import CustomAlert from '../components/CustomAlert';

const CloudLobbyScreen = ({ session, onBack, onEnterGame, playerName: savedPlayerName, onPlayerNameChange }) => {
  const insets = useSafeAreaInsets();
  const [playerName, setPlayerName] = useState(savedPlayerName || '');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [scannerVisible, setScannerVisible] = useState(false);
  const [instructionsType, setInstructionsType] = useState(null); // 'host' | 'join'
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'info', icon: 'information-circle' });
  const [permission, requestPermission] = useCameraPermissions();

  const isConnected = session.status === 'connected';
  const isHost = session.isHost;
  const displayName = playerName.trim() || savedPlayerName?.trim() || 'Player';
  const localPlayer = session.players?.find(p => p.id === session.playerId);
  const [managePlayer, setManagePlayer] = useState(null); // player object for host action sheet

  useEffect(() => {
    setPlayerName(savedPlayerName || '');
  }, [savedPlayerName]);

  // Navigate to game when a new game starts (not a finished game)
  useEffect(() => {
    if (session.inGame && (!session.winners || session.winners.length === 0)) {
      onEnterGame();
    }
  }, [session.inGame, session.winners, onEnterGame]);

  // Auto-navigate back when kicked (error state set by syncFromRoom)
  useEffect(() => {
    if (session.status === 'idle' && session.error) {
      setAlertConfig({
        visible: true,
        title: 'Removed',
        message: session.error,
        type: 'warning',
        icon: 'alert-circle',
        onCloseAction: onBack
      });
    }
  }, [session.status, session.error, onBack]);

  const handleNameSave = async (newName) => {
    if (newName) {
      setPlayerName(newName);
      if (session.updatePlayerName && session.status === 'connected') {
        session.updatePlayerName(newName);
      }
      if (onPlayerNameChange) {
        await onPlayerNameChange(newName);
      }
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

  const copyRoomCode = async () => {
    if (!session.roomCode) return;
    await Clipboard.setStringAsync(session.roomCode);
    setAlertConfig({
      visible: true,
      title: 'Copied!',
      message: 'Room code copied to clipboard.',
      type: 'success',
      icon: 'checkmark-circle'
    });
  };

  const handleScan = ({ data }) => {
    if (!data) return;
    const clean = String(data).replace('bingo://', '').trim().toUpperCase();
    const normalized = clean.replace(/[^A-Z0-9]/g, '').slice(0, 4);
    if (normalized.length !== 4) return;
    setRoomCodeInput(normalized);
    setScannerVisible(false);
    session.joinRoom({ roomCode: normalized, name: displayName });
  };

  const showScanner = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result?.granted) return;
    }
    setScannerVisible(true);
  };

  useEffect(() => {
    if (!scannerVisible) return;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setScannerVisible(false);
      return true;
    });

    return () => subscription.remove();
  }, [scannerVisible]);

  return (
    <ScreenWrapper>
          <ScreenHeader
            title={'GLOBAL PLAY'}
            onBack={onBack}
            onSettings={() => setSettingsVisible(true)}
          />

        <KeyboardAvoidingView style={styles.flexFull} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView style={styles.fullWidth} contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {!isConnected && (
          <>
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitleBase}>JOIN A ROOM</Text>
                <TouchableOpacity onPress={() => setInstructionsType('join')} style={styles.helpIconBox}>
                  <Ionicons name="help-circle" size={theme.icon.md} color={theme.colors.accentYellow} />
                </TouchableOpacity>
              </View>
              <Text style={styles.helpText}>Enter room code or scan host QR to join.</Text>
              <View style={styles.joinRow}>
                <StyledInput
                  style={styles.flexInput}
                  placeholder="ENTER ROOM CODE"
                  value={roomCodeInput}
                  onChangeText={(text) => setRoomCodeInput(text.toUpperCase().slice(0, 4))}
                  autoCapitalize="characters"
                  placeholderTextColor={theme.colors.textSecondary}
                  maxLength={4}
                />
                <TouchableOpacity onPress={showScanner} activeOpacity={0.8} style={styles.scanButton}>
                  <Ionicons name="qr-code-outline" size={theme.icon.lg} color="#1A1829" />
                </TouchableOpacity>
              </View>
              <GameButton title="JOIN ROOM" variant="secondary" onPress={handleJoinRoom} style={styles.actionButton} loading={session.status === 'connecting' && session.role === 'client'} />
            </View>

            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitleBase}>CREATE A ROOM</Text>
                <TouchableOpacity onPress={() => setInstructionsType('host')} style={styles.helpIconBox}>
                  <Ionicons name="help-circle" size={theme.icon.md} color={theme.colors.accentYellow} />
                </TouchableOpacity>
              </View>
              <Text style={styles.helpText}>Host a game for anyone, anywhere.</Text>
              <GameButton title="CREATE ROOM" variant="primary" onPress={handleCreateRoom} style={styles.actionButton} loading={session.status === 'connecting' && session.role === 'host'} />
            </View>
          </>
        )}

        {isConnected && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{isHost ? 'HOSTING ROOM' : 'CONNECTED TO ROOM'}</Text>
            <View style={styles.roomCodeContainer}>
              <Text style={styles.roomCode}>{session.roomCode}</Text>
            </View>
            <GameButton title="COPY CODE" variant="accent" onPress={copyRoomCode} style={styles.copyButton} />

            {isHost && (
              <Text style={[styles.helpText, { color: theme.colors.textSecondary, fontStyle: 'italic' }]}>Tap on a player to manage them.</Text>
            )}

            <View style={styles.playerList}>
              <Text style={styles.listHeader}>PLAYERS ({session.players.length})</Text>
              {session.players.map((player) => (
                <TouchableOpacity 
                  key={player.id} 
                  style={styles.playerItem}
                  disabled={!isHost || player.id === session.playerId}
                  onPress={() => setManagePlayer(player)}
                >
                  <Text style={styles.playerItemText}>• {player.name}</Text>
                  <Text style={[styles.playerStatus, player.ready ? styles.statusReady : styles.statusWaiting]}>
                    {player.id === session.hostId 
                      ? (player.ready ? 'READY (HOST)' : 'WAITING (HOST)')
                      : (player.ready ? 'READY' : 'WAITING')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.qrContainer}>
              <View style={styles.qrWrapper}>
                <QRCode value={session.roomCode || ''} size={theme.layout.qrSize} backgroundColor={theme.colors.surface} color={theme.colors.textPrimary} />
              </View>
            </View>

            <View style={{ marginBottom: theme.spacing.md }}>
              {isHost ? (
                <GameButton title="START" variant="success" onPress={() => {
                  if (session.players.length < 2) {
                    setAlertConfig({
                      visible: true,
                      title: 'Cannot Start',
                      message: 'No other player has joined yet.',
                      type: 'warning',
                      icon: 'alert-circle'
                    });
                    return;
                  }
                  if (!session.players.every(p => p.ready)) {
                    setAlertConfig({
                      visible: true,
                      title: 'Cannot Start',
                      message: 'Not all players are ready. Wait for them to return to the lobby.',
                      type: 'warning',
                      icon: 'alert-circle'
                    });
                    return;
                  }
                  if (session.startGame) session.startGame();
                }} />
              ) : (
                <Text style={[styles.helpText, { textAlign: 'center', marginBottom: 0 }]}>Waiting for host to start...</Text>
              )}
            </View>
            <GameButton title="EXIT ROOM" variant="danger" onPress={() => { if (session.leaveRoom) session.leaveRoom(); }} style={{ marginTop: theme.spacing.md }} />
          </View>
        )}

        {session.error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{session.error}</Text>
          </View>
        )}
        </ScrollView>
      </KeyboardAvoidingView>

      <PlayerSettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        onSave={handleNameSave}
        initialName={playerName}
      />

      <Modal visible={scannerVisible} animationType="fade" onRequestClose={() => setScannerVisible(false)}>
        <View style={styles.scannerContainer}>
          <CameraView style={styles.camera} onBarcodeScanned={handleScan} />
          <View style={[styles.scannerHeader, { paddingTop: insets.top + theme.spacing.sm }]}>
            <GameButton title="ABORT SCAN" variant="danger" onPress={() => setScannerVisible(false)} style={styles.scannerCloseTop} />
          </View>
          <View style={[styles.scannerHintBox, { bottom: insets.bottom + theme.spacing.md }]}>
            <Text style={styles.scannerHint}>Scan a host's QR code to auto-join the room.</Text>
          </View>
        </View>
      </Modal>

      <Modal visible={!!instructionsType} animationType="fade" transparent={true} onRequestClose={() => setInstructionsType(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{instructionsType === 'host' ? 'HOW TO CREATE' : 'HOW TO JOIN'}</Text>
            {instructionsType === 'host' ? (
              <ScrollView style={styles.modalScroll}>
                <View style={styles.listItem}>
                  <Text style={styles.listNumber}>1.</Text>
                  <Text style={styles.instructionText}>Tap 'CREATE ROOM' to create a 4-character room code.</Text>
                </View>
                <View style={styles.listItem}>
                  <Text style={styles.listNumber}>2.</Text>
                  <Text style={styles.instructionText}>Share or copy the code for other players.</Text>
                </View>
                <View style={styles.listItem}>
                  <Text style={styles.listNumber}>3.</Text>
                  <Text style={styles.instructionText}>Wait for everyone to join, then start the game.</Text>
                </View>
              </ScrollView>
            ) : (
              <ScrollView style={styles.modalScroll}>
                <View style={styles.listItem}>
                  <Text style={styles.listNumber}>1.</Text>
                  <Text style={styles.instructionText}>Enter the 4-character code and tap 'JOIN ROOM'.</Text>
                </View>
                <View style={styles.listItem}>
                  <Text style={styles.listNumber}>2.</Text>
                  <Text style={styles.instructionText}>Or use the QR button to scan host QR and auto-join.</Text>
                </View>
                <View style={styles.listItem}>
                  <Text style={styles.listNumber}>3.</Text>
                  <Text style={styles.instructionText}>Once connected, wait for the host to start the game.</Text>
                </View>
              </ScrollView>
            )}
            <GameButton title="GOT IT" variant="secondary" onPress={() => setInstructionsType(null)} style={{ marginTop: theme.spacing.lg }} />
          </View>
        </View>
      </Modal>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        icon={alertConfig.icon}
        onClose={() => {
          const action = alertConfig.onCloseAction;
          setAlertConfig(prev => ({ ...prev, visible: false, onCloseAction: undefined }));
          if (action) action();
        }}
      />

      {/* Host Action Sheet for managing players */}
      <Modal visible={!!managePlayer} animationType="fade" transparent={true} onRequestClose={() => setManagePlayer(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>MANAGE PLAYER</Text>
            <Text style={[styles.helpText, { marginBottom: theme.spacing.lg }]}>
              What do you want to do with {managePlayer?.name}?
            </Text>
            <GameButton title="MAKE HOST" variant="accent" onPress={() => {
              if (managePlayer) session.transferHost?.(managePlayer.id);
              setManagePlayer(null);
            }} style={{ marginBottom: theme.spacing.md }} />
            <GameButton title="KICK PLAYER" variant="danger" onPress={() => {
              if (managePlayer) session.kickPlayer?.(managePlayer.id);
              setManagePlayer(null);
            }} style={{ marginBottom: theme.spacing.md }} />
            <GameButton title="CANCEL" variant="secondary" onPress={() => setManagePlayer(null)} />
          </View>
        </View>
      </Modal>
      </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
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
    alignItems: 'center',
  },
  flexFull: {
    flex: 1,
    width: '100%',
  },
  fullWidth: {
    width: '100%',
  },
  section: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    borderWidth: 2,
    borderColor: theme.colors.surfaceLight,
    width: '100%',
    maxWidth: theme.layout.maxCardWidth,
    alignSelf: 'center',
    ...theme.shadows.card,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  sectionTitleBase: {
    ...theme.typography.h2,
    color: theme.colors.accentYellow,
    textAlign: 'center',
  },
  helpIconBox: {
    padding: theme.spacing.xs / 2,
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
  actionButton: {
    marginTop: theme.spacing.sm,
  },
  joinRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: theme.spacing.sm + theme.spacing.xs / 2,
  },
  flexInput: {
    flex: 1,
    marginBottom: 0,
    ...theme.typography.body1,
  },
  scanButton: {
    width: theme.spacing.xxl + theme.spacing.sm,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: theme.spacing.xs,
    borderColor: '#00A3A0',
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
    borderWidth: theme.spacing.xs / 2,
    borderColor: theme.colors.accent,
    marginBottom: theme.spacing.lg,
  },
  copyButton: {
    marginTop: -theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  roomCode: {
    fontSize: theme.typography.h1.fontSize,
    fontWeight: '900',
    color: theme.colors.accent,
    textAlign: 'center',
    letterSpacing: theme.typography.button.letterSpacing * 2,
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
    ...theme.typography.caption,
    fontWeight: 'bold',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
    overflow: 'hidden',
  },
  statusReady: {
    backgroundColor: 'rgba(0, 255, 65, 0.2)',
    color: theme.colors.success,
  },
  statusWaiting: {
    backgroundColor: 'rgba(255, 204, 0, 0.2)',
    color: theme.colors.accentYellow,
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
  },
  modalScroll: {
    maxHeight: theme.spacing.xxl * 5,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    alignItems: 'flex-start',
  },
  listNumber: {
    ...theme.typography.body1,
    color: theme.colors.textPrimary,
    lineHeight: theme.typography.body1.fontSize * 1.35,
    marginRight: theme.spacing.sm,
    minWidth: 16,
  },
  instructionText: {
    flex: 1,
    ...theme.typography.body1,
    color: theme.colors.textPrimary,
    lineHeight: theme.typography.body1.fontSize * 1.35,
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  scannerHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  scannerCloseTop: {
    width: '100%',
  },
  scannerHintBox: {
    position: 'absolute',
    left: theme.spacing.md,
    right: theme.spacing.md,
    backgroundColor: 'rgba(26,24,41,0.82)',
    borderWidth: 2,
    borderColor: theme.colors.surfaceLight,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  scannerHint: {
    ...theme.typography.body1,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
});

export default CloudLobbyScreen;
