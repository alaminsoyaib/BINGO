import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';

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
      <View style={styles.container}>
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Online Anywhere</Text>
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
            <Text style={styles.sectionTitle}>Create global room</Text>
            <Text style={styles.helpText}>Anyone with the room code can join from anywhere.</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={handleCreateRoom}>
              <Text style={styles.primaryButtonText}>Create Room</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Join global room</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter room code"
              value={roomCodeInput}
              onChangeText={(text) => setRoomCodeInput(text.toUpperCase())}
              autoCapitalize="characters"
              placeholderTextColor="#6b7280"
              maxLength={6}
            />
            <TouchableOpacity style={styles.secondaryButton} onPress={handleJoinRoom}>
              <Text style={styles.secondaryButtonText}>Join Room</Text>
            </TouchableOpacity>
          </View>
        )}

        {isConnected && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{isHost ? 'Hosting global room' : 'Connected to global room'}</Text>
            <Text style={styles.roomCode}>Room: {session.roomCode}</Text>

            <View style={styles.playerList}>
              {session.players.map((player) => (
                <Text key={player.id} style={styles.playerItem}>
                  {player.ready ? 'Ready' : 'Waiting'} - {player.name}
                </Text>
              ))}
            </View>

            <View style={styles.qrContainer}>
              <QRCode value={session.roomCode || ''} size={160} />
            </View>

            <TouchableOpacity style={styles.secondaryButton} onPress={shareInvite}>
              <Text style={styles.secondaryButtonText}>Share Invite</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.primaryButton} onPress={onEnterGame}>
              <Text style={styles.primaryButtonText}>Enter Game</Text>
            </TouchableOpacity>
          </View>
        )}

        {session.error && <Text style={styles.errorText}>{session.error}</Text>}
      </View>
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
  helpText: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 18,
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
  primaryButton: {
    backgroundColor: '#059669',
    paddingVertical: 11,
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
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  roomCode: {
    fontSize: 18,
    color: '#0f766e',
    fontWeight: '800',
    textAlign: 'center',
  },
  playerList: {
    gap: 6,
  },
  playerItem: {
    color: '#1f2937',
    fontSize: 14,
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  errorText: {
    color: '#b91c1c',
    fontWeight: '600',
  }
});

export default CloudLobbyScreen;
