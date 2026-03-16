import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ModeSelectScreen = ({ onSelectMode }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
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
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
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
  }
});

export default ModeSelectScreen;
