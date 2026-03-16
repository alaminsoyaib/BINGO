import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Modal, BackHandler, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import QRCode from 'react-native-qrcode-svg';
import { theme } from '../theme';
import GameButton from '../components/GameButton';

const DEFAULT_PORT = 5050;

const OnlineLobbyScreen = ({ session, onBack, onEnterGame, playerName: savedPlayerName, onPlayerNameChange }) => {
  const insets = useSafeAreaInsets();
  const [playerName, setPlayerName] = useState(savedPlayerName || '');
  const [hostPort, setHostPort] = useState(String(DEFAULT_PORT));
  const [joinHost, setJoinHost] = useState('');
  const [joinPort, setJoinPort] = useState(String(DEFAULT_PORT));
  const [scannerVisible, setScannerVisible] = useState(false);
  const [advancedVisible, setAdvancedVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const isConnected = session.status === 'connected';
  const isHost = session.role === 'host';
  const displayName = playerName.trim() || savedPlayerName?.trim() || (isHost ? 'Host' : 'Player');

  useEffect(() => {
    setPlayerName(savedPlayerName || '');
  }, [savedPlayerName]);

  const handleNameBlur = async () => {
    if (!onPlayerNameChange) return;
    const nextName = playerName.trim();
    if (!nextName) return;
    await onPlayerNameChange(nextName);
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.topRow}>
        <GameButton title="BACK" variant="danger" onPress={onBack} style={styles.backButton} />
        <Text style={styles.title}>LOCAL PLAY</Text>
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
            <Text style={styles.sectionTitle}>DEPLOY OUTPOST</Text>
            <Text style={styles.helpText}>Host a Local game on your current Wi-Fi network.</Text>
            <GameButton title="CREATE ROOM" variant="primary" onPress={handleCreateRoom} style={styles.actionButton} />

            <View style={styles.advancedToggle}>
              <GameButton 
                title={advancedVisible ? "HIDE ADVANCED" : "SHOW ADVANCED"} 
                variant="accent" 
                onPress={() => setAdvancedVisible((prev) => !prev)} 
                style={styles.advancedBtn}
              />
            </View>

            {advancedVisible && (
              <View style={styles.advancedCard}>
                <Text style={styles.label}>HOST PORT (OPTIONAL)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={hostPort}
                  onChangeText={setHostPort}
                  placeholder="Port"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>
            )}

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>INFILTRATE OUTPOST</Text>
            <Text style={styles.helpText}>Scan a host's QR to join instantly or use IP.</Text>
            
            <GameButton title="SCAN QR CODE" variant="accent" onPress={showScanner} style={styles.actionButton} />

            <View style={styles.orDivider}>
              <View style={styles.line} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.line} />
            </View>

            <TextInput
              style={styles.input}
              placeholder="HOST IP (e.g. 192.168.0.10)"
              value={joinHost}
              onChangeText={setJoinHost}
              placeholderTextColor={theme.colors.textSecondary}
              autoCapitalize="none"
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.flexInput]}
                keyboardType="numeric"
                value={joinPort}
                onChangeText={setJoinPort}
                placeholder="Port"
                placeholderTextColor={theme.colors.textSecondary}
              />
              <GameButton title="JOIN" variant="secondary" onPress={handleJoinRoom} style={styles.flexBtn} />
            </View>
          </View>
        )}

        {isConnected && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{isHost ? 'HOSTING OUTPOST' : 'CONNECTED TO OUTPOST'}</Text>
            
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
            {isHost && session.hostInfo && (
              <View style={styles.qrContainer}>
                <Text style={styles.helpText}>Show this QR code to recruits.</Text>
                <View style={styles.qrWrapper}>
                  <QRCode value={`bingo://${session.hostInfo.ip}:${session.hostInfo.port}`} size={160} backgroundColor={theme.colors.surface} color={theme.colors.textPrimary} />
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
            <GameButton title="ENTER GAME" variant="primary" onPress={onEnterGame} style={styles.actionButton} />
          </View>
        )}

        {session.error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{session.error}</Text>
          </View>
        )}
      </ScrollView>

      <Modal visible={scannerVisible} animationType="fade" onRequestClose={() => setScannerVisible(false)}>
        <View style={styles.scannerContainer}>
          <CameraView style={styles.camera} onBarcodeScanned={handleScan} />
          <View style={[styles.scannerHeader, { paddingTop: insets.top + 8 }]}> 
            <GameButton title="ABORT SCAN" variant="danger" onPress={() => setScannerVisible(false)} style={styles.scannerCloseTop} />
          </View>
          <View style={[styles.scannerHintBox, { bottom: insets.bottom + 18 }]}> 
            <Text style={styles.scannerHint}>Aim your crosshairs at a host's QR code.</Text>
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
    paddingRight: 100 + theme.spacing.md,
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
  label: {
    ...theme.typography.body2,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
    fontWeight: 'bold',
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
  advancedToggle: {
    alignItems: 'center',
    marginVertical: theme.spacing.md,
  },
  advancedBtn: {
    width: 200,
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
    ...theme.typography.body2,
    fontWeight: 'bold',
  },
  statusReady: {
    color: theme.colors.success,
  },
  statusWaiting: {
    color: theme.colors.warning,
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
    paddingHorizontal: 20,
  },
  scannerCloseTop: {
    width: 200,
  },
  scannerHintBox: {
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
  },
  scannerHint: {
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 12,
    borderRadius: 8,
    ...theme.typography.body2,
    textAlign: 'center',
    overflow: 'hidden',
  }
});

export default OnlineLobbyScreen;