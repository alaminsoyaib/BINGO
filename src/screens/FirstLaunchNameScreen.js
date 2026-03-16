import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import GameButton from '../components/GameButton';

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
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>BINGO</Text>
          <Text style={styles.subtitle}>PLAYER SETUP</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>ENTER CODENAME</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder={suggestedName}
            placeholderTextColor={theme.colors.textSecondary}
            maxLength={16}
            autoCapitalize="characters"
          />
          <Text style={styles.helper}>You can change this later in settings.</Text>

          <View style={styles.actions}>
            <GameButton 
              title="USE DEFAULT" 
              variant="secondary" 
              onPress={handleUseDefault} 
              style={styles.btnContext}
            />
            <GameButton 
              title="CONTINUE" 
              variant="accent" 
              onPress={handleContinue} 
              style={styles.btnContext}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.textPrimary,
    textShadowColor: theme.colors.primary,
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
    fontSize: 54,
  },
  subtitle: {
    ...theme.typography.button,
    color: theme.colors.accent,
    letterSpacing: 3,
    marginTop: theme.spacing.sm,
  },
  card: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    borderWidth: 4,
    borderColor: theme.colors.surfaceLight,
    ...theme.shadows.card,
  },
  label: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
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
    marginBottom: theme.spacing.sm,
  },
  helper: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  actions: {
    gap: theme.spacing.lg,
  },
  btnContext: {
    width: '100%',
  },
});

export default FirstLaunchNameScreen;
