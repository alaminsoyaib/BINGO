import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAudioPlayer } from 'expo-audio';
import ConfettiCannon from 'react-native-confetti-cannon';

import { theme } from '../theme';
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
  const winSentRef = useRef(false);
  const resetSeenRef = useRef(0);
  const leftCannonRef = useRef(null);
  const rightCannonRef = useRef(null);

  const isOnline = mode !== 'offline' && !!session;
  const onlineModeLabel = mode === 'cloud' ? 'Global room' : 'Local room';
  const currentTurnPlayer = isOnline ? session.players?.find(p => p.id === session.currentTurnPlayerId) : null;
  const isGameOver = isOnline && session.winnerId !== null && session.winnerId !== undefined;
  const onlineStatus = !isOnline
    ? ''
    : session.status === 'connecting'
    ? 'Connecting...'
    : session.status === 'error'
    ? (session.error || 'Connection error')
    : session.inGame
    ? `${onlineModeLabel} - Players: ${session.players.length}`
    : `${onlineModeLabel} - Waiting for all players`;
  const turnLabel = isOnline && session.inGame
    ? (session.isYourTurn ? 'Your turn' : `${currentTurnPlayer?.name || 'Player'}'s turn`)
    : null;
  const winnerLabel = isOnline && isGameOver && session.winnerId !== session.playerId
    ? `Winner: ${session.players.find(p => p.id === session.winnerId)?.name || 'Player'}`
    : null;

  useEffect(() => {
    let interval;
    let timeout;
    let isActive = true;

    if (isWin) {
      if (player) {
        player.seekTo(0);
        player.play();
      }

      const fireCannons = () => {
        if (!isActive) return;
        leftCannonRef.current?.start();
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
          if (!isActive) return;
          rightCannonRef.current?.start();
        }, 200);
      };

      fireCannons(); // trigger initial

      let count = 1;

      interval = setInterval(() => {
        if (!isActive) return;
        if (count < 5) {
          fireCannons();
          count++;
        } else {
          clearInterval(interval);
        }
      }, 2800);
    }

    return () => {
      isActive = false;
      if (interval) clearInterval(interval);
      if (timeout) clearTimeout(timeout);
    }
  }, [isWin, player]);

  useEffect(() => {
    if (isOnline && session?.inGame && isSetupPhase) {
      autoFillRemaining();
    }
  }, [isOnline, session?.inGame, isSetupPhase, autoFillRemaining]);

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
            disabled={isWin || (isOnline && !isSetupPhase && (!session.inGame || !session.isYourTurn || isGameOver))}
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

        <ConfettiCannon
          ref={leftCannonRef}
          count={100}
          origin={{ x: -10, y: 0 }}
          autoStart={false}
          fadeOut={true}
          fallSpeed={3000}
        />
        <ConfettiCannon
          ref={rightCannonRef}
          count={100}
          origin={{ x: Dimensions.get('window').width + 10, y: 0 }}
          autoStart={false}
          fadeOut={true}
          fallSpeed={3000}
        />

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
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 8,
    paddingTop: 40,
    alignItems: 'center',
  },
  leaveButton: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.danger,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 6,
  },
  leaveButtonText: {
    color: theme.colors.textPrimary,
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
    backgroundColor: theme.colors.surface,
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
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  activeLetterBox: {
    backgroundColor: theme.colors.success,
  },
  letterText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
  },
  activeLetterText: {
    color: theme.colors.textPrimary,
  }
});

export default BingoScreen;
