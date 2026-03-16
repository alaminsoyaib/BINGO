import React from 'react';
import { View, StyleSheet } from 'react-native';
import Tile from './Tile';
import { theme } from '../theme';

const Board = ({ board, winningIndexes, onTilePress, disabled }) => {
  return (
    <View style={styles.grid}>
      {board.map((tile, index) => (
        <Tile 
          key={index} 
          number={tile.value} 
          marked={tile.marked} 
          winning={winningIndexes.has(index)}
          onPress={() => onTilePress(index)} 
          disabled={disabled}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.xs,
    backgroundColor: 'transparent',
    width: '100%',
  }
});

export default Board;
