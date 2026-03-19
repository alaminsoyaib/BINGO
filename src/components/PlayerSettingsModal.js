import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
    Linking.openURL('mailto:alaminnaki@gmail.com').catch(err => console.log('Error opening mail:', err));
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.headerContainer}>
              <Ionicons name="settings-outline" size={28} color={theme.colors.accentYellow} />
              <Text style={styles.modalTitle}>SETTINGS</Text>
            </View>
            
            <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="person-outline" size={20} color={theme.colors.accentYellow} />
                  <Text style={styles.sectionTitle}>YOUR NAME</Text>
                </View>
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
                <View style={styles.sectionHeader}>
                  <Ionicons name="help-circle-outline" size={20} color={theme.colors.accentYellow} />
                  <Text style={styles.sectionTitle}>HOW TO PLAY</Text>
                </View>
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>• Tap any tile to cross off a number.</Text>
                  <Text style={styles.infoText}>• Complete 5 lines (horizontal, vertical, or diagonal).</Text>
                  <Text style={styles.infoText}>• The first to reach 5 full lines wins the game!</Text>
                  <Text style={styles.infoText}>• Host games on the same Wi-Fi or fully online.</Text>
                </View>
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="information-circle-outline" size={20} color={theme.colors.accentYellow} />
                  <Text style={styles.sectionTitle}>APP INFO</Text>
                </View>
                <View style={styles.infoBox}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Version</Text>
                    <Text style={styles.infoValue}>2.0.3</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Developer</Text>
                    <Text style={styles.infoValue}>Al-Amin Hossain</Text>
                  </View>
                  <TouchableOpacity onPress={handleContactSupport} style={styles.contactButton} activeOpacity={0.7}>
                    <Ionicons name="mail-outline" size={18} color={theme.colors.accentYellow} style={{ marginRight: 8 }} />
                    <Text style={styles.contactButtonText}>CONTACT SUPPORT</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <GameButton title="SAVE" variant="primary" onPress={handleSave} style={styles.btn} />
                <GameButton title="CANCEL" variant="secondary" onPress={onClose} style={styles.btn} />
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.sm, // reduced edge padding to give modal more room
  },
  modalContent: {
    width: '100%',
    maxWidth: theme.layout.maxCardWidth || 450,
    maxHeight: '94%', // Restrict to somewhat within the window bounds always
    flexShrink: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.md, // reduced overall padding
    paddingTop: theme.spacing.lg, 
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    ...theme.shadows.card,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: theme.spacing.md,
  },
  modalTitle: {
    ...theme.typography.h1,
    color: theme.colors.accentYellow,
    fontSize: 24, // slightly smaller text to prevent overflow
    textAlign: 'center',
  },
  scrollArea: {
    flexShrink: 1,
    marginBottom: theme.spacing.sm,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xs,
    gap: theme.spacing.sm, // reduced gap between boxes
  },
  section: {
    marginBottom: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: theme.spacing.sm,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoBox: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  infoText: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginBottom: 8,
    fontSize: 14,
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
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
    marginTop: 16,
    backgroundColor: 'rgba(253, 203, 110, 0.1)',
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(253, 203, 110, 0.3)',
  },
  contactButtonText: {
    ...theme.typography.button,
    color: theme.colors.accentYellow,
    fontSize: 14,
  },
  actionButtons: {
    gap: 12,
    marginTop: theme.spacing.sm,
  },
  btn: {
    width: '100%',
  }
});

export default PlayerSettingsModal;