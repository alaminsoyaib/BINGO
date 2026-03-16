import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Modal, BackHandler } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import QRCode from 'react-native-qrcode-svg';

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
      <View style={styles.container}>
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Local Room</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Your name</Text>
          <TextInput
            style={styles.input}
            placeholder="Player name"
            value={playerName}
            onChangeText={setPlayerName}
            onBlur={handleNameBlur}
            placeholderTextColor="#6b7280"
          />
        </View>

        {!isConnected && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Create room</Text>
            <Text style={styles.helpText}>Quick start with default settings.</Text>
            <TouchableOpacity style={styles.primaryButtonFull} onPress={handleCreateRoom}>
              <Text style={styles.primaryButtonText}>Create Room</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkButton} onPress={() => setAdvancedVisible((prev) => !prev)}>
              <Text style={styles.linkButtonText}>{advancedVisible ? 'Hide advanced settings' : 'Show advanced settings'}</Text>
            </TouchableOpacity>

            {advancedVisible && (
              <View style={styles.advancedCard}>
                <Text style={styles.label}>Host port (optional)</Text>
                <TextInput
                  style={styles.inputSmall}
                  keyboardType="numeric"
                  value={hostPort}
                  onChangeText={setHostPort}
                  placeholder="Port"
                  placeholderTextColor="#6b7280"
                />
              </View>
            )}

            <Text style={styles.sectionTitle}>Join room</Text>
            <Text style={styles.helpText}>Scan QR to join instantly, or enter host details manually.</Text>
            <TextInput
              style={styles.input}
              placeholder="Host IP (example 192.168.0.10)"
              value={joinHost}
              onChangeText={setJoinHost}
              placeholderTextColor="#6b7280"
              autoCapitalize="none"
            />
            <View style={styles.row}>
              <TextInput
                style={styles.inputSmall}
                keyboardType="numeric"
                value={joinPort}
                onChangeText={setJoinPort}
                placeholder="Port"
                placeholderTextColor="#6b7280"
              />
              <TouchableOpacity style={styles.secondaryButton} onPress={handleJoinRoom}>
                <Text style={styles.secondaryButtonText}>Join</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.outlineButton} onPress={showScanner}>
                <Text style={styles.outlineButtonText}>Scan QR</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {isConnected && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Room status</Text>
            <Text style={styles.statusText}>
              {isHost ? 'Hosting room' : 'Connected to host'}
            </Text>
            {session.hostInfo && (
              <View style={styles.hostInfo}>
                <TouchableOpacity style={styles.linkButton} onPress={() => setAdvancedVisible((prev) => !prev)}>
                  <Text style={styles.linkButtonText}>{advancedVisible ? 'Hide connection details' : 'Show connection details'}</Text>
                </TouchableOpacity>
                {advancedVisible && (
                  <>
                    <Text style={styles.statusText}>IP: {session.hostInfo.ip}</Text>
                    <Text style={styles.statusText}>Port: {session.hostInfo.port}</Text>
                  </>
                )}
              </View>
            )}
            {isHost && session.hostInfo && (
              <View style={styles.qrContainer}>
                <Text style={styles.helpText}>Share this QR so others can join instantly.</Text>
                <QRCode value={`bingo://${session.hostInfo.ip}:${session.hostInfo.port}`} size={160} />
              </View>
            )}
            <View style={styles.playerList}>
              {session.players.map((player) => (
                <Text key={player.id} style={styles.playerItem}>
                  {player.ready ? 'Ready' : 'Waiting'} - {player.name}
                </Text>
              ))}
            </View>
            <TouchableOpacity style={styles.primaryButton} onPress={onEnterGame}>
              <Text style={styles.primaryButtonText}>Enter Game</Text>
            </TouchableOpacity>
          </View>
        )}

        {session.error && <Text style={styles.errorText}>{session.error}</Text>}
      </View>

      <Modal visible={scannerVisible} animationType="fade" onRequestClose={() => setScannerVisible(false)}>
        <View style={styles.scannerContainer}>
          <CameraView
            style={styles.camera}
            onBarcodeScanned={handleScan}
          />
          <View style={[styles.scannerHeader, { paddingTop: insets.top + 8 }]}> 
            <TouchableOpacity style={styles.scannerCloseTop} onPress={() => setScannerVisible(false)}>
              <Text style={styles.scannerCloseText}>Close Scanner</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.scannerHintBox, { bottom: insets.bottom + 18 }]}> 
            <Text style={styles.scannerHint}>Point the camera at a room QR code to join automatically.</Text>
          </View>
          <TouchableOpacity style={[styles.scannerCloseFloating, { bottom: insets.bottom + 64 }]} onPress={() => setScannerVisible(false)}>
            <Text style={styles.scannerCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#c9d4e5',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  backButton: {
    backgroundColor: '#1f2937',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  backButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  label: {
    fontSize: 14,
    color: '#475569',
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderColor: '#e2e8f0',
    borderWidth: 1,
    color: '#0f172a',
  },
  inputSmall: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderColor: '#e2e8f0',
    borderWidth: 1,
    color: '#0f172a',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#059669',
    paddingVertical: 10,
      primaryButtonFull: {
        backgroundColor: '#059669',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
      },
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#0f172a',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  outlineButton: {
    borderColor: '#0f172a',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  helpText: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 18,
  },
  linkButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  linkButtonText: {
    color: '#0f766e',
    fontSize: 13,
    fontWeight: '700',
  },
  advancedCard: {
    backgroundColor: '#eef2ff',
    borderRadius: 10,
    padding: 10,
    gap: 8,
  },
  outlineButtonText: {
    color: '#0f172a',
    fontWeight: '700',
  },
  statusText: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '600',
  },
  hostInfo: {
    gap: 4,
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  playerList: {
    gap: 6,
  },
  playerItem: {
    color: '#1f2937',
    fontSize: 14,
  },
  errorText: {
    color: '#b91c1c',
    fontWeight: '600',
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
    left: 12,
    right: 12,
    top: 0,
    zIndex: 3,
    alignItems: 'flex-end',
  },
  scannerCloseTop: {
    backgroundColor: '#111827',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  scannerCloseFloating: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: '#111827',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    zIndex: 3,
  },
  scannerHintBox: {
    position: 'absolute',
    left: 12,
    right: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.84)',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 10,
    zIndex: 2,
  },
  scannerHint: {
    color: '#e2e8f0',
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
  },
  scannerCloseText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});

export default OnlineLobbyScreen;
