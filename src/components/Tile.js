import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

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
      <View style={styles.textContainer}>
        <Text style={styles.text}>
          {isEmpty ? '?' : number}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tile: {
    width: '19%', 
    aspectRatio: 1, 
    borderRadius: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTile: {
    backgroundColor: '#3b82f6', // Blue 500
  },
  assignedTile: {
    backgroundColor: '#a27146', // Brown
  },
  markedTile: {
    backgroundColor: '#4f46e5', // Indigo/Bluish for "Marked"
  },
  winningTile: {
    backgroundColor: '#059669', // Emerald 600 (Winning lines)
  },
  disabledTile: {
    opacity: 0.6,
  },
  text: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  }
});

export default Tile;
