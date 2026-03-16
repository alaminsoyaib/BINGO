import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ModeSelectScreen = ({ onSelectMode, currentName, onSaveName }) => {
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [draftName, setDraftName] = useState(currentName || '');

  useEffect(() => {
    setDraftName(currentName || '');
  }, [currentName]);

  const handleSave = async () => {
    const value = draftName.trim();
    if (!value) return;
    await onSaveName(value);
    setSettingsVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Text style={styles.nameBadge}>Player: {currentName || 'Player'}</Text>
          <TouchableOpacity style={styles.settingsButton} onPress={() => setSettingsVisible(true)}>
            <Text style={styles.settingsButtonText}>Settings</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>BINGO</Text>
        <Text style={styles.subtitle}>Choose how you want to play</Text>

        <TouchableOpacity style={styles.primaryButton} onPress={() => onSelectMode('offline')}>
          <Text style={styles.primaryButtonText}>Offline</Text>
          <Text style={styles.buttonHint}>Play on one device</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => onSelectMode('online')}>
          <Text style={styles.secondaryButtonText}>Online (Local)</Text>
          <Text style={styles.buttonHintDark}>Play together on Wi-Fi</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tertiaryButton} onPress={() => onSelectMode('cloud')}>
          <Text style={styles.secondaryButtonText}>Online (Anywhere)</Text>
          <Text style={styles.buttonHintDark}>Create room code and play globally</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={settingsVisible} transparent animationType="fade" onRequestClose={() => setSettingsVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Profile Settings</Text>
            <Text style={styles.modalHint}>Change your name anytime. This name is saved on your device.</Text>
            <TextInput
              style={styles.nameInput}
              value={draftName}
              onChangeText={setDraftName}
              placeholder="Enter player name"
              placeholderTextColor="#6b7280"
              maxLength={24}
              autoCapitalize="words"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setSettingsVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    paddingHorizontal: 24,
    paddingTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    top: 24,
    left: 24,
    right: 24,
  },
  nameBadge: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '600',
  },
  settingsButton: {
    backgroundColor: '#0f172a',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  settingsButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#374151',
    marginBottom: 20,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#059669',
    borderRadius: 10,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: '#0f172a',
    borderRadius: 10,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  tertiaryButton: {
    width: '100%',
    backgroundColor: '#0b5563',
    borderRadius: 10,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
  },
  buttonHint: {
    marginTop: 4,
    color: '#ecfdf3',
    fontSize: 14,
  },
  buttonHintDark: {
    marginTop: 4,
    color: '#cbd5f5',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalHint: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#0f172a',
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  cancelButtonText: {
    color: '#334155',
    fontWeight: '700',
  },
  saveButton: {
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 16,
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});

export default ModeSelectScreen;
