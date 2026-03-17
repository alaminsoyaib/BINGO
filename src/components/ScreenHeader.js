import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

const ScreenHeader = ({ title, onBack, onSettings }) => {
  return (
    <View style={styles.headerWrapper}>
      <View style={styles.topBar}>
        {onBack ? (
          <TouchableOpacity style={styles.iconButton} onPress={onBack}>
            <Ionicons name="arrow-back" size={28} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconPlaceholder} />
        )}
        
        {onSettings ? (
          <TouchableOpacity style={styles.iconButton} onPress={onSettings}>
            <Ionicons name="settings-sharp" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconPlaceholder} />
        )}
      </View>
      <Text style={styles.screenTitle}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headerWrapper: {
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 70,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 4,
    right: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
    elevation: 10,
  },
  iconButton: {
    padding: 8,
    backgroundColor: 'rgba(45, 42, 67, 0.6)',
    borderRadius: 22,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPlaceholder: {
    width: 44,
    height: 44,
  },
  screenTitle: {
    fontFamily: theme.typography.h1.fontFamily,
    fontSize: theme.typography.h1.fontSize,
    color: theme.colors.textPrimary,
    letterSpacing: 1,
    textAlign: 'center',
  },
});

export default ScreenHeader;