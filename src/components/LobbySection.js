import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

const LobbySection = ({ title, children, rightHeaderElement, style }) => {
  return (
    <View style={[styles.section, style]}>
      {title && (
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {rightHeaderElement}
        </View>
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    borderWidth: 2,
    borderColor: theme.colors.surfaceLight,
    ...theme.shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
    gap: 8,
  },
  sectionTitle: {
    fontFamily: theme.typography.h2.fontFamily,
    fontSize: theme.typography.h2.fontSize,
    color: theme.colors.accentYellow,
    textAlign: 'center',
  },
});

export default LobbySection;