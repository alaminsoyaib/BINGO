import React from 'react';
import { View, StyleSheet } from 'react-native';
import Tile from './Tile';

const Board = ({ board, winningIndexes, onTilePress }) => {
  return (
    <View style={styles.grid}>
      {board.map((tile, index) => (
        <Tile 
          key={index} 
          number={tile.value} 
          marked={tile.marked} 
          winning={winningIndexes.has(index)}
          onPress={() => onTilePress(index)} 
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
    gap: 4,
    paddingHorizontal: 4,
    backgroundColor: 'transparent',
    width: '100%',
  }
});

export default Board;
