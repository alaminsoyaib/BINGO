import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Modal, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAudioPlayer } from 'expo-audio';

import { useBingoGame } from '../hooks/useBingoGame';
import Header from '../components/Header';
import Board from '../components/Board';
import Controls from '../components/Controls';

const BingoScreen = () => {
  const {
    board,
    isSetupPhase,
    nextNumberToPlace,
    bingoWord,
    isWin,
    toggleTile,
    autoFillRemaining,
    undoLastMark,
    restartGame,
    canUndo,
    winningIndexes,
    hasStarted
  } = useBingoGame();

  const player = useAudioPlayer(require('../../assets/bingo_trim.mp3'));
  const [showWinModal, setShowWinModal] = useState(false);

  useEffect(() => {
    if (isWin) {
      setShowWinModal(true);
      player.play();
    } else {
      setShowWinModal(false);
    }
  }, [isWin, player]);

  const handleTilePress = (index) => {
    toggleTile(index);
  };

  const fullWord = "BINGO";
  const displayLetters = fullWord.split('').map((letter, i) => {
    return {
      letter,
      active: i < bingoWord.length
    }
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Header 
          isSetupPhase={isSetupPhase} 
          nextNumberToPlace={nextNumberToPlace} 
          isWin={isWin} 
        />
        
        <View style={styles.boardContainer}>
          <Board board={board} winningIndexes={winningIndexes} onTilePress={handleTilePress} />
        </View>

        <View style={styles.bingoContainer}>
          {displayLetters.map((item, index) => (
            <View key={index} style={[styles.letterBox, item.active && styles.activeLetterBox]}>
              <Text style={[styles.letterText, item.active && styles.activeLetterText]}>
                {item.letter}
              </Text>
            </View>
          ))}
        </View>

        {isWin && (
          <View style={styles.emojiContainer}>
            <Text style={styles.emojiText}>🎉 🎊 🎉</Text>
          </View>
        )}

        <Modal
          visible={showWinModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowWinModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.winImageContainer}>
                <Image 
                  source={require('../../assets/won.jpeg')} 
                  style={styles.winImage} 
                  resizeMode="cover"
                />
              </View>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setShowWinModal(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Controls 
          isSetupPhase={isSetupPhase}
          onAutoFill={autoFillRemaining}
          onUndo={undoLastMark}
          onRestart={restartGame}
          canUndo={canUndo}
          hasStarted={hasStarted}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#c9d4e5', // Light blue-grey background matching the prototype
  },
  container: {
    flex: 1,
    paddingHorizontal: 8,
    paddingTop: 40,
    alignItems: 'center',
  },
  boardContainer: {
    width: '100%',
    marginTop: 10,
    marginBottom: 5,
  },
  bingoContainer: {
    flexDirection: 'row',
    backgroundColor: '#f4f4f5',
    padding: 8,
    borderRadius: 8,
    gap: 8,
    marginTop: 5,
    marginBottom: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  emojiContainer: {
    marginTop: 5,
    marginBottom: 5,
    alignItems: 'center',
  },
  emojiText: {
    fontSize: 40,
  },
  letterBox: {
    width: 48,
    height: 48,
    backgroundColor: '#a1a1aa',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  activeLetterBox: {
    backgroundColor: '#059669', // Green
  },
  letterText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  activeLetterText: {
    color: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    width: '80%',
  },
  winImageContainer: {
    width: '100%',
    height: 300,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  winImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    backgroundColor: '#009688',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  }
});

export default BingoScreen;
