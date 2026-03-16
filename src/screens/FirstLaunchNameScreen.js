import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FirstLaunchNameScreen = ({ onContinue, suggestedName }) => {
  const [name, setName] = useState('');

  const handleContinue = async () => {
    await onContinue(name);
  };

  const handleUseDefault = async () => {
    await onContinue(suggestedName);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to BINGO</Text>
        <Text style={styles.subtitle}>Set your player name (optional)</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Player Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder={`Default: ${suggestedName}`}
            placeholderTextColor="#6b7280"
            maxLength={24}
            autoCapitalize="words"
          />
          <Text style={styles.helper}>You can change this anytime from Settings on the dashboard.</Text>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleUseDefault}>
              <Text style={styles.secondaryButtonText}>Use Default</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={handleContinue}>
              <Text style={styles.primaryButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    color: '#334155',
    fontSize: 16,
    marginBottom: 8,
  },
  card: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  label: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#0f172a',
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  helper: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 19,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#94a3b8',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#334155',
    fontWeight: '700',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#059669',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});

export default FirstLaunchNameScreen;
