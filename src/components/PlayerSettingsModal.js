import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Linking } from 'react-native';
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

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@gravityvibe.com').catch(err => console.log('Error opening mail:', err));
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>SETTINGS</Text>
            
            <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
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

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>HOW TO PLAY</Text>
                <Text style={styles.infoText}>• Tap any tile to cross off a number.</Text>
                <Text style={styles.infoText}>• Complete 5 lines (horizontal, vertical, or diagonal).</Text>
                <Text style={styles.infoText}>• The first to reach 5 full lines wins the game!</Text>
                <Text style={styles.infoText}>• Host games on the same Wi-Fi or fully online.</Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>APP INFO</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Version:</Text>
                  <Text style={styles.infoValue}>1.0.0</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Developer:</Text>
                  <Text style={styles.infoValue}>Alamin Soyaib</Text>
                </View>
                <TouchableOpacity onPress={handleContactSupport} style={styles.contactButton}>
                  <Text style={styles.contactButtonText}>CONTACT SUPPORT</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
            
            <View style={styles.actionButtons}>
              <GameButton title="SAVE" variant="primary" onPress={handleSave} style={styles.btn} />
              <GameButton title="CANCEL" variant="secondary" onPress={onClose} style={styles.btn} />
            </View>
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
    maxHeight: '90%',
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
  scrollArea: {
    flexShrink: 1,
    marginBottom: theme.spacing.md,
  },
  scrollContent: {
    paddingBottom: theme.spacing.sm,
  },
  section: {
    backgroundColor: theme.colors.surfaceDark || '#2A364F',
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
    fontSize: 16,
  },
  infoText: {
    ...theme.typography.body2,
    color: theme.colors.textPrimary,
    marginBottom: 6,
    fontSize: 14,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  infoLabel: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    fontSize: 15,
  },
  infoValue: {
    ...theme.typography.body2,
    color: theme.colors.textPrimary,
    fontWeight: 'bold',
    fontSize: 15,
  },
  contactButton: {
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 10,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  contactButtonText: {
    ...theme.typography.body2,
    color: theme.colors.accentYellow,
    fontWeight: 'bold',
    fontSize: 14,
  },
  actionButtons: {
    gap: 10,
  },
  btn: {
    width: '100%',
  }
});

export default PlayerSettingsModal;