import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { theme } from '../theme';
import GameButton from './GameButton';
import StyledInput from './StyledInput';

const PlayerSettingsModal = ({ visible, onClose, onSave, initialName }) => {
  const [playerName, setPlayerName] = useState(initialName || '');

  useEffect(() => {
    if (visible) {
      setPlayerName(initialName || '');
    }
  }, [visible, initialName]);

  const handleSave = () => {
    onSave(playerName.trim());
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>PLAYER SETTINGS</Text>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>YOUR NAME</Text>
              <StyledInput
                
                placeholder="Player name"
                value={playerName}
                onChangeText={setPlayerName}
                placeholderTextColor={theme.colors.textSecondary}
                maxLength={16}
                autoCapitalize="characters"
              />
            </View>
            
            <GameButton title="SAVE" variant="primary" onPress={handleSave} style={{ marginTop: 10 }} />
            <GameButton title="CANCEL" variant="secondary" onPress={onClose} style={{ marginTop: 10 }} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
  section: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    borderWidth: 2,
    borderColor: theme.colors.surfaceLight,
    marginBottom: theme.spacing.md,
    ...theme.shadows.card,
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.accentYellow,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  });

export default PlayerSettingsModal;