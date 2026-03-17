import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, BackHandler, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import ScreenWrapper from '../components/ScreenWrapper';
import { theme } from '../theme';
import GameButton from '../components/GameButton';
import PlayerSettingsModal from '../components/PlayerSettingsModal';
import ScreenHeader from '../components/ScreenHeader';
import StyledInput from '../components/StyledInput';

const DEFAULT_PORT = 5050;

const OnlineLobbyScreen = ({ session, onBack, onEnterGame, playerName: savedPlayerName, onPlayerNameChange }) => {
  const insets = useSafeAreaInsets();
  const [playerName, setPlayerName] = useState(savedPlayerName || '');
  const [hostPort, setHostPort] = useState(String(DEFAULT_PORT));
  const [joinHost, setJoinHost] = useState('');
  const [joinPort, setJoinPort] = useState(String(DEFAULT_PORT));
  const [scannerVisible, setScannerVisible] = useState(false);
  const [instructionsType, setInstructionsType] = useState(null); // 'host' or 'join'
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [advancedVisible, setAdvancedVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const isConnected = session.status === 'connected';
  const isHost = session.role === 'host';
  const displayName = playerName.trim() || savedPlayerName?.trim() || (isHost ? 'Host' : 'Player');
  const localPlayer = session.players?.find(p => p.id === session.playerId);

  useEffect(() => {
    setPlayerName(savedPlayerName || '');
  }, [savedPlayerName]);

  useEffect(() => {
    if (session.inGame) {
      onEnterGame();
    }
  }, [session.inGame, onEnterGame]);

  const handleNameSave = async (newName) => {
    if (newName) {
      setPlayerName(newName);
      if (onPlayerNameChange) {
        await onPlayerNameChange(newName);
      }
    }
    setSettingsVisible(false);
  };

  const parsePort = (value) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : DEFAULT_PORT;
  };

  const handleCreateRoom = () => {
    session.hostRoom({ port: parsePort(hostPort), name: displayName });
  };

  const handleJoinRoom = () => {
    session.joinRoom({ host: joinHost.trim(), port: parsePort(joinPort), name: displayName });
  };

  const handleScan = ({ data }) => {
    if (!data) return;
    const clean = data.replace('bingo://', '').trim();
    const [ip, port] = clean.split(':');
    if (!ip) return;
    const resolvedPort = parsePort(port || String(DEFAULT_PORT));
    setJoinHost(ip);
    setJoinPort(String(resolvedPort));
    setScannerVisible(false);
    session.joinRoom({ host: ip, port: resolvedPort, name: displayName });
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
            title={isHost ? 'LOCAL HOST' : 'LOCAL NETWORK'}
            onBack={onBack}
            onSettings={() => setSettingsVisible(true)}
          />

        <KeyboardAvoidingView style={{ flex: 1, width: '100%' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView style={{ width: '100%' }} contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {!isConnected && (
          <>
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitleBase}>JOIN A ROOM</Text>
                <TouchableOpacity onPress={() => setInstructionsType('join')} style={styles.helpIconBox}>
                  <Ionicons name="help-circle" size={theme.icon.md} color={theme.colors.accentYellow} />
                </TouchableOpacity>
              </View>
              <Text style={styles.helpText}>Enter host IP or scan their QR code to join.</Text>

              <View style={{ flexDirection: 'row', alignItems: 'stretch', gap: 12 }}>
                <StyledInput
                  style={{ flex: 1, marginBottom: 0, ...theme.typography.body1 }}
                  placeholder="HOST IP (e.g. 192.168.0.10)"
                  value={joinHost}
                  onChangeText={setJoinHost}
                  placeholderTextColor={theme.colors.textSecondary}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={showScanner}
                  activeOpacity={0.8}
                  style={{
                    width: theme.spacing.xxl + theme.spacing.sm,
                    backgroundColor: theme.colors.accent,
                    borderRadius: theme.radius.lg,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottomWidth: theme.spacing.xs,
                    borderColor: '#00A3A0'
                  }}
                >
                  <MaterialCommunityIcons name="qrcode-scan" size={theme.icon.lg} color="#1A1829" />
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'stretch', gap: 12, marginTop: theme.spacing.md }}>
                <StyledInput
                  style={{ flex: 1, marginBottom: 0, ...theme.typography.body1 }}
                  keyboardType="numeric"
                  value={joinPort}
                  onChangeText={setJoinPort}
                  placeholder="Port"
                  placeholderTextColor={theme.colors.textSecondary}
                />
                <View style={{ flex: 1 }}>
                  <GameButton title="JOIN" variant="secondary" onPress={handleJoinRoom} loading={session.status === 'connecting' && session.role === 'client'} />
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitleBase}>CREATE A ROOM</Text>
                <TouchableOpacity onPress={() => setInstructionsType('host')} style={styles.helpIconBox}>
                  <Ionicons name="help-circle" size={theme.icon.md} color={theme.colors.accentYellow} />
                </TouchableOpacity>
              </View>
              <Text style={styles.helpText}>Host a Local game on your current Wi-Fi network.</Text>
              <GameButton title="CREATE ROOM" variant="primary" onPress={handleCreateRoom} style={styles.actionButton} loading={session.status === 'connecting' && session.role === 'host'} />

              <View style={styles.advancedToggle}>
                <GameButton
                  title={advancedVisible ? "HIDE ADVANCED" : "SHOW ADVANCED"}
                  variant="accent"
                  onPress={() => setAdvancedVisible((prev) => !prev)}
                  style={styles.advancedBtn}
                  textStyle={styles.advancedBtnText}
                />
              </View>

              {advancedVisible && (
                <View style={styles.advancedCard}>
                  <Text style={styles.label}>HOST PORT (OPTIONAL)</Text>
                  <StyledInput
                    keyboardType="numeric"
                    value={hostPort}
                    onChangeText={setHostPort}
                    placeholder="Port"
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                </View>
              )}
            </View>
          </>
        )}

        {isConnected && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{isHost ? 'HOSTING ROOM' : 'CONNECTED TO ROOM'}</Text>

            {session.hostInfo && (
              <View style={styles.hostInfo}>
                <View style={styles.advancedToggle}>
                  <GameButton 
                    title={advancedVisible ? "HIDE COORDS" : "SHOW COORDS"} 
                    variant="accent" 
                    onPress={() => setAdvancedVisible((prev) => !prev)}
                    style={styles.advancedBtn}
                  />
                </View>
                {advancedVisible && (
                  <View style={styles.coordsBox}>
                    <Text style={styles.statusText}>IP: {session.hostInfo.ip}</Text>
                    <Text style={styles.statusText}>PORT: {session.hostInfo.port}</Text>
                  </View>
                )}
              </View>
            )}
            {session.hostInfo && (
              <View style={styles.qrContainer}>
                <Text style={styles.helpText}>Scan to join this room.</Text>
                <View style={styles.qrWrapper}>
                  <QRCode value={`bingo://${session.hostInfo.ip}:${session.hostInfo.port}`} size={theme.layout.qrSize} backgroundColor={theme.colors.surface} color={theme.colors.textPrimary} />
                </View>
              </View>
            )}

            <View style={styles.playerList}>
              <Text style={styles.listHeader}>SQUAD ({session.players.length})</Text>
              {session.players.map((player) => (
                <View key={player.id} style={styles.playerItem}>
                  <Text style={styles.playerItemText}>• {player.name}</Text>
                  <Text style={[styles.playerStatus, player.ready ? styles.statusReady : styles.statusWaiting]}>
                    {player.ready ? 'READY' : 'WAITING'}
                  </Text>
                </View>
              ))}
            </View>
            <View style={styles.actionRow}>
              {isHost ? (
                <GameButton title="START" variant="success" onPress={() => { if (session.startGame) session.startGame(); }} style={styles.halfBtn} />
              ) : (
                <GameButton 
                 title={localPlayer?.ready ? "READY!" : "MARK READY"} 
                 variant={localPlayer?.ready ? "secondary" : "success"}
                 disabled={localPlayer?.ready}
                 onPress={() => { if (session.setPlayerReady) session.setPlayerReady(true); }}
                 style={styles.halfBtn}
               />
              )}
              <GameButton title="EXIT ROOM" variant="danger" onPress={() => { if (session.leaveRoom) session.leaveRoom(); }} style={styles.halfBtn} />
            </View>
          </View>
        )}

        {session.error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{session.error}</Text>
          </View>
        )}
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={scannerVisible} animationType="fade" onRequestClose={() => setScannerVisible(false)}>
        <View style={styles.scannerContainer}>
          <CameraView style={styles.camera} onBarcodeScanned={handleScan} />
          <View style={[styles.scannerHeader, { paddingTop: insets.top + theme.spacing.sm }]}> 
            <GameButton title="ABORT SCAN" variant="danger" onPress={() => setScannerVisible(false)} style={styles.scannerCloseTop} />
          </View>
          <View style={[styles.scannerHintBox, { bottom: insets.bottom + theme.spacing.md }]}>
            <Text style={styles.scannerHint}>Point your camera at a host's QR code.</Text>
          </View>
        </View>
      </Modal>
      <Modal visible={!!instructionsType} animationType="fade" transparent={true} onRequestClose={() => setInstructionsType(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{instructionsType === 'host' ? 'HOW TO HOST' : 'HOW TO JOIN'}</Text>
            {instructionsType === 'host' ? (
              <ScrollView style={styles.modalScroll}>
                <View style={styles.listItem}>
                  <Text style={styles.listNumber}>1.</Text>
                  <Text style={styles.instructionText}>Ensure you are connected to a Wi-Fi network or mobile hotspot.</Text>
                </View>
                <View style={styles.listItem}>
                  <Text style={styles.listNumber}>2.</Text>
                  <Text style={styles.instructionText}>Tap 'CREATE ROOM' to host the game on your device.</Text>
                </View>
                <View style={styles.listItem}>
                  <Text style={styles.listNumber}>3.</Text>
                  <Text style={styles.instructionText}>Once created, a QR Code and your IP Address will be displayed.</Text>
                </View>
                <View style={styles.listItem}>
                  <Text style={styles.listNumber}>4.</Text>
                  <Text style={styles.instructionText}>Other players can scan the QR code or manually enter the IP to join.</Text>
                </View>
                <View style={styles.listItem}>
                  <Text style={styles.listNumber}>5.</Text>
                  <Text style={styles.instructionText}>Wait for players to join and then start the game!</Text>
                </View>
              </ScrollView>
            ) : (
              <ScrollView style={styles.modalScroll}>
                <View style={styles.listItem}>
                  <Text style={styles.listNumber}>1.</Text>
                  <Text style={styles.instructionText}>Ensure you are connected to a Wi-Fi network or mobile hotspot.</Text>
                </View>
                <View style={styles.listItem}>
                  <Text style={styles.listNumber}>2.</Text>
                  <Text style={styles.instructionText}>Tap the QR Code icon to scan the host's screen.</Text>
                </View>
                <View style={styles.listItem}>
                  <Text style={styles.listNumber}>3.</Text>
                  <Text style={styles.instructionText}>Alternatively, enter the host's IP Address manually.</Text>
                </View>
                <View style={styles.listItem}>
                  <Text style={styles.listNumber}>4.</Text>
                  <Text style={styles.instructionText}>Tap 'JOIN' to enter the room.</Text>
                </View>
                <View style={styles.listItem}>
                  <Text style={styles.listNumber}>5.</Text>
                  <Text style={styles.instructionText}>Wait for the host to start the game!</Text>
                </View>
              </ScrollView>
            )}
            <GameButton title="GOT IT" variant="secondary" onPress={() => setInstructionsType(null)} style={{ marginTop: theme.spacing.lg }} />
          </View>
        </View>
      </Modal>

      <PlayerSettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        onSave={handleNameSave}
        initialName={playerName}
      />

      </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  title: {
    ...theme.typography.h1,
    color: theme.colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  scrollContainer: {
    padding: theme.spacing.md,
    gap: theme.spacing.lg,
    width: '100%',
    alignItems: 'center',
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
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.accentYellow,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
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
  helpText: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  label: {
    ...theme.typography.body2,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
    fontWeight: 'bold',
  },
  ipInput: {
    ...theme.typography.body1,
    textAlign: 'center',
  },
  actionButton: {
    marginTop: theme.spacing.md,
  },
  advancedToggle: {
    alignItems: 'center',
    marginVertical: theme.spacing.md,
  },
  advancedBtn: {
    width: 'auto',
    minWidth: '60%',
    paddingHorizontal: theme.spacing.lg,
  },
  advancedBtnText: {
    fontSize: theme.typography.body2.fontSize,
  },
  advancedCard: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
  },
  divider: {
    height: 2,
    backgroundColor: theme.colors.surfaceLight,
    marginVertical: theme.spacing.md,
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.md,
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: theme.colors.surfaceLight,
  },
  orText: {
    color: theme.colors.textSecondary,
    paddingHorizontal: theme.spacing.md,
    ...theme.typography.body2,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  flexInput: {
    flex: 1,
    marginBottom: 0,
  },
  flexBtn: {
    flex: 1,
  },
  hostInfo: {
    marginBottom: theme.spacing.md,
  },
  coordsBox: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  statusText: {
    ...theme.typography.h2,
    color: theme.colors.success,
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
  actionRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
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
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  scannerHeader: {
    position: 'absolute',
    top: 0,
    width: '100%',
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
    maxHeight: theme.spacing.xxl * 6,
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
  }
});

export default OnlineLobbyScreen;

