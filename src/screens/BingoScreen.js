import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, Modal, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAudioPlayer } from 'expo-audio';

import { useBingoGame } from '../hooks/useBingoGame';
import Header from '../components/Header';
import Board from '../components/Board';
import Controls from '../components/Controls';

const BingoScreen = ({ mode = 'offline', session, onExitOnline }) => {
  const {
    board,
    isSetupPhase,
    nextNumberToPlace,
    bingoWord,
    isWin,
    toggleTile,
    markNumber,
    autoFillRemaining,
    undoLastMark,
    restartGame,
    canUndo,
    winningIndexes,
    hasStarted
  } = useBingoGame();

  const player = useAudioPlayer(require('../../assets/bingo_trim.mp3'));
  const [showWinModal, setShowWinModal] = useState(false);
  const winSentRef = useRef(false);
  const resetSeenRef = useRef(0);

  const isOnline = mode === 'online' && !!session;
  const currentTurnPlayer = isOnline ? session.players?.find(p => p.id === session.currentTurnPlayerId) : null;
  const isGameOver = isOnline && session.winnerId !== null && session.winnerId !== undefined;
  const onlineStatus = !isOnline
    ? ''
    : session.status === 'connecting'
    ? 'Connecting...'
    : session.status === 'error'
    ? (session.error || 'Connection error')
    : session.inGame
    ? `Online game - Players: ${session.players.length}/4`
    : `Online lobby - Players: ${session.players.length}/4`;
  const turnLabel = isOnline && session.inGame
    ? (session.isYourTurn ? 'Your turn' : `Waiting for ${currentTurnPlayer?.name || 'opponent'}`)
    : null;
  const winnerLabel = isOnline && isGameOver && session.winnerId !== session.playerId
    ? `Winner: ${session.players.find(p => p.id === session.winnerId)?.name || 'Player'}`
    : null;

  useEffect(() => {
    if (isWin) {
      setShowWinModal(true);
      player.play();
    } else {
      setShowWinModal(false);
    }
  }, [isWin, player]);

  useEffect(() => {
    if (!isOnline) return;
    if (!isSetupPhase && !session.localReady) {
      session.sendReady();
    }
  }, [isOnline, isSetupPhase, session]);

  useEffect(() => {
    if (!isOnline) return;
    if (session.lastCalledNumber !== null && session.lastCalledNumber !== undefined) {
      markNumber(session.lastCalledNumber);
    }
  }, [isOnline, session?.lastCalledNumber, markNumber]);

  useEffect(() => {
    if (!isOnline) return;
    if (session.resetCounter > resetSeenRef.current) {
      resetSeenRef.current = session.resetCounter;
      restartGame();
      winSentRef.current = false;
    }
  }, [isOnline, session?.resetCounter, restartGame]);

  useEffect(() => {
    if (!isOnline) return;
    if (isWin && !winSentRef.current) {
      winSentRef.current = true;
      session.sendWin();
    }
    if (!isWin) {
      winSentRef.current = false;
    }
  }, [isOnline, isWin, session]);

  const handleTilePress = (index) => {
    if (!isOnline) {
      toggleTile(index);
      return;
    }

    if (isSetupPhase) {
      toggleTile(index);
      return;
    }

    if (!session.inGame || isGameOver || !session.isYourTurn) return;

    const number = board[index]?.value;
    if (number === null || number === undefined) return;
    if (session.calledNumbers.includes(number)) return;

    session.sendCall(number);
  };

  const handleRestart = () => {
    if (!isOnline) {
      restartGame();
      return;
    }
    if (session.isHost) {
      session.sendReset();
    }
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
        {isOnline && onExitOnline && (
          <TouchableOpacity style={styles.leaveButton} onPress={onExitOnline}>
            <Text style={styles.leaveButtonText}>Leave Room</Text>
          </TouchableOpacity>
        )}
        <Header 
          isSetupPhase={isSetupPhase} 
          nextNumberToPlace={nextNumberToPlace} 
          isWin={isWin} 
          mode={mode}
          onlineStatus={onlineStatus}
          turnLabel={turnLabel}
          lastCalledNumber={isOnline ? session.lastCalledNumber : null}
          winnerLabel={winnerLabel}
        />
        
        <View style={styles.boardContainer}>
          <Board 
            board={board} 
            winningIndexes={winningIndexes} 
            onTilePress={handleTilePress} 
            disabled={isOnline && !isSetupPhase && (!session.inGame || !session.isYourTurn || isGameOver)}
          />
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
          onRestart={handleRestart}
          canUndo={canUndo}
          hasStarted={hasStarted}
          mode={mode}
          canRestart={!isOnline || session.isHost}
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
  leaveButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#1f2937',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 6,
  },
  leaveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
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
