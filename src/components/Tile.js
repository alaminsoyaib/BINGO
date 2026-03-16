import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

const Tile = ({ number, marked, winning, onPress, disabled }) => {
  const isEmpty = number === null;
  
  return (
    <TouchableOpacity 
      style={[
        styles.tile, 
        isEmpty ? styles.emptyTile : styles.assignedTile,
        (marked && !winning) && styles.markedTile,
        winning && styles.winningTile,
        disabled && styles.disabledTile
      ]} 
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <View style={styles.content}>
        <Text style={[styles.text, (marked || winning) && styles.textMarked]}>
          {isEmpty ? '' : number}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tile: {
    width: '18.5%', // Slightly smaller to allow gap
    aspectRatio: 1, 
    borderRadius: theme.radius.sm,
    borderBottomWidth: 4,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTile: {
    backgroundColor: theme.colors.surfaceLight,
    borderColor: theme.colors.surface,
  },
  assignedTile: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primaryDark,
  },
  markedTile: {
    backgroundColor: theme.colors.tileMarked,
    borderColor: '#C0392B', // Darker red/orange for depth
  },
  winningTile: {
    backgroundColor: theme.colors.success,
    borderColor: '#028068',
  },
  disabledTile: {
    opacity: 0.5,
  },
  text: {
    color: theme.colors.textPrimary,
    ...theme.typography.h1,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  textMarked: {
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  }
});

export default Tile;
