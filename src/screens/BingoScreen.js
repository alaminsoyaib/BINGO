import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, Dimensions, Modal, ScrollView, BackHandler } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import ConfettiCannon from 'react-native-confetti-cannon';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ScreenWrapper from '../components/ScreenWrapper';
import { theme } from '../theme';
import { useBingoGame } from '../hooks/useBingoGame';
import Header from '../components/Header';
import Board from '../components/Board';
import Controls from '../components/Controls';
import GameButton from '../components/GameButton';

const WinOverlay = ({ player }) => {
  const leftCannonRef = useRef(null);
  const rightCannonRef = useRef(null);

  useEffect(() => {
    let interval;
    let timeout;
    let isActive = true;

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
      }, 100);
    };

    // Tiny 10ms wait so the unstarted Cannon views can link to their refs first
    setTimeout(() => {
      if (isActive) fireCannons();
    }, 10);

    let count = 1;
    interval = setInterval(() => {
      if (!isActive) return;
      if (count < 6) {
        fireCannons();
        count++;
      } else {
        clearInterval(interval);
      }
    }, 2800);

    return () => {
      isActive = false;
      if (interval) clearInterval(interval);
      if (timeout) clearTimeout(timeout);
    };
  }, [player]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
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
    </View>
  );
};

const BingoScreen = ({ mode = 'offline', session, onExitOnline, onBack, onReturnToLobby }) => {
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

  const [showSetupTooltip, setShowSetupTooltip] = useState(false);
  const [showGameTooltip, setShowGameTooltip] = useState(false);
  const [instructionsVisible, setInstructionsVisible] = useState(false);
  const [exitModalVisible, setExitModalVisible] = useState(false);

  useEffect(() => {
    const checkFirstTime = async () => {
      try {
        const seen = await AsyncStorage.getItem('hasSeenBingoTooltips');
        if (seen !== 'true') {
          setShowSetupTooltip(true);
          setShowGameTooltip(true);
          await AsyncStorage.setItem('hasSeenBingoTooltips', 'true');
        }
      } catch (e) {
        console.warn('Failed to read tooltip persistence', e);
      }
    };
    checkFirstTime();
  }, []);

  const player = useAudioPlayer(require('../../assets/bingo_trim.mp3'));
  const winSentRef = useRef(false);
  const resetSeenRef = useRef(0);

  const isOnline = mode !== 'offline' && !!session;
  const onlineModeLabel = mode === 'cloud' ? 'Global room' : 'Local room';
  const currentTurnPlayer = isOnline ? session.players?.find(p => p.id === session.currentTurnPlayerId) : null;
  const isGameOver = isOnline && session.winners && session.winners.length > 0;
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
  let winnerLabel = null;
  if (isOnline && isGameOver) {
    if (session.winners.length > 1) {
      if (session.winners.includes(session.playerId)) {
        const others = session.winners.filter(id => id !== session.playerId).map(id => session.players.find(p => p.id === id)?.name || 'Player');
        winnerLabel = `Winners: You & ${others.join(' & ')}`;
      } else {
        winnerLabel = `Winners: ${session.winners.map(id => session.players.find(p => p.id === id)?.name || 'Player').join(' & ')}`;
      }
    } else if (session.winners.length === 1 && session.winners[0] !== session.playerId) {
      const winnerName = session.players.find(p => p.id === session.winners[0])?.name || 'Player';
      winnerLabel = `Winner: ${winnerName}`;
    }
  }

  const isLocalWinner = isWin || (isOnline && isGameOver && session.winners.includes(session.playerId));

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

  useEffect(() => {
    const handleHardwareBack = () => {
      if (isOnline) {
        setExitModalVisible(true);
        return true;
      }
      onBack();
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', handleHardwareBack);
    return () => subscription.remove();
  }, [isOnline, onBack]);

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
    if (session.setPlayerReady) {
      session.setPlayerReady(true);
    }
    if (onReturnToLobby) {
      onReturnToLobby();
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
    <ScreenWrapper>
        <View style={styles.headerWrapper}>
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.backButton} onPress={() => {
              if (isOnline) {
                setExitModalVisible(true);
              } else {
                onBack();
              }
            }}>
              <Ionicons name="arrow-back" size={theme.icon.lg} color={theme.colors.textPrimary} />
            </TouchableOpacity>
            <View style={styles.topBarRight}>
              <TouchableOpacity style={styles.helpButton} onPress={() => setInstructionsVisible(true)}>
                <Ionicons name="help-circle" size={theme.icon.lg} color={theme.colors.accentYellow} />
              </TouchableOpacity>
              {isOnline && onExitOnline ? (
                <TouchableOpacity style={styles.leaveButton} onPress={() => setExitModalVisible(true)}>
                  <Text style={styles.leaveButtonText}>Leave Room</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
          <Header
            isSetupPhase={isSetupPhase}
            nextNumberToPlace={nextNumberToPlace}
            isWin={isLocalWinner}
            mode={mode}
            onlineStatus={onlineStatus}
            turnLabel={turnLabel}
            lastCalledNumber={isOnline ? session.lastCalledNumber : null}
            winnerLabel={winnerLabel}
          />
        </View>

        {isSetupPhase && showSetupTooltip && (
          <View style={styles.tooltipFlowWrapper}>
            <View style={styles.tooltipContainer}>
              <Text style={styles.tooltipText}>Tap tiles to place numbers, or use AUTO-FILL!</Text>
              <TouchableOpacity onPress={() => setShowSetupTooltip(false)} hitSlop={{top: 10, right: 10, bottom: 10, left: 10}}>
                <Ionicons name="close-circle" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <View style={styles.tooltipTail} />
          </View>
        )}
        {!isSetupPhase && !isWin && showGameTooltip && (
          <View style={styles.tooltipFlowWrapper}>
            <View style={styles.tooltipContainer}>
              <Text style={styles.tooltipText}>
                {isOnline 
                  ? "Tap a number on your turn to call it!"
                  : "Tap numbers to mark them. Get 5 in a row to win!"}
              </Text>
              <TouchableOpacity onPress={() => setShowGameTooltip(false)} hitSlop={{top: 10, right: 10, bottom: 10, left: 10}}>
                <Ionicons name="close-circle" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <View style={styles.tooltipTail} />
          </View>
        )}

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

        {isLocalWinner && <WinOverlay player={player} />}

        <Controls
          isSetupPhase={isSetupPhase}
          onAutoFill={autoFillRemaining}
          onUndo={undoLastMark}
          onRestart={handleRestart}
          canUndo={canUndo}
          hasStarted={hasStarted}
          mode={mode}
          canRestart={!isOnline || isGameOver}
        />

        <Modal visible={instructionsVisible} animationType="fade" transparent={true} onRequestClose={() => setInstructionsVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>HOW TO PLAY</Text>
              <ScrollView style={styles.modalScroll}>
                <View style={styles.listItem}>
                  <Text style={styles.listNumber}>1.</Text>
                  <Text style={styles.instructionText}>In the <Text style={styles.boldText}>Setup Phase</Text>, place numbers 1-25 on your board by tapping tiles, or use AUTO-FILL.</Text>
                </View>
                <View style={styles.listItem}>
                  <Text style={styles.listNumber}>2.</Text>
                  <Text style={styles.instructionText}>Once all numbers are placed, tap <Text style={styles.boldText}>START</Text> to begin.</Text>
                </View>
                <View style={styles.listItem}>
                  <Text style={styles.listNumber}>3.</Text>
                  <Text style={styles.instructionText}>{isOnline ? 'During gameplay, wait for your turn and tap a number to call it out to everyone.' : 'During gameplay, tap numbers as they are called to mark them.'}</Text>
                </View>
                <View style={styles.listItem}>
                  <Text style={styles.listNumber}>4.</Text>
                  <Text style={styles.instructionText}>Complete 5 tiles in a row (horizontal, vertical, or diagonal) to get a <Text style={styles.boldText}>BINGO</Text>.</Text>
                </View>
                <View style={styles.listItem}>
                  <Text style={styles.listNumber}>5.</Text>
                  <Text style={styles.instructionText}>The first player to complete the word B I N G O wins!</Text>
                </View>
              </ScrollView>
              <GameButton title="GOT IT" variant="secondary" onPress={() => setInstructionsVisible(false)} style={{ marginTop: theme.spacing.lg }} />
            </View>
          </View>
        </Modal>

        <Modal visible={exitModalVisible} animationType="fade" transparent={true} onRequestClose={() => setExitModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { alignItems: 'center' }]}>
              {isGameOver ? (
                <>
                  <Text style={styles.modalTitle}>GAME OVER</Text>
                  <Text style={[styles.instructionText, { textAlign: 'center', marginBottom: theme.spacing.xl }]}>What would you like to do next?</Text>
                  <GameButton title="PLAY AGAIN" variant="success" onPress={() => { setExitModalVisible(false); handleRestart(); }} style={{ width: '100%', marginBottom: theme.spacing.md }} />
                  <GameButton title="EXIT ROOM" variant="danger" onPress={() => { setExitModalVisible(false); if (onExitOnline) onExitOnline(); }} style={{ width: '100%' }} />
                </>
              ) : (
                <>
                  <Text style={styles.modalTitle}>LEAVE ROOM?</Text>
                  <Text style={[styles.instructionText, { textAlign: 'center', marginBottom: theme.spacing.xl }]}>Are you sure you want to leave? Your progress will be lost and you will be disconnected.</Text>
                  <GameButton title="CANCEL" variant="secondary" onPress={() => setExitModalVisible(false)} style={{ width: '100%', marginBottom: theme.spacing.md }} />
                  <GameButton title="EXIT ROOM" variant="danger" onPress={() => { setExitModalVisible(false); if (onExitOnline) onExitOnline(); }} style={{ width: '100%' }} />
                </>
              )}
            </View>
          </View>
        </Modal>

      </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  headerWrapper: {
    width: '100%',
    justifyContent: 'center',
    paddingTop: 10,
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    zIndex: 10,
    elevation: 10,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  helpButton: {
    padding: theme.spacing.sm,
    backgroundColor: 'rgba(45, 42, 67, 0.6)',
    borderRadius: theme.radius.round,
  },
  backButton: {
    padding: theme.spacing.sm,
    backgroundColor: 'rgba(45, 42, 67, 0.6)', // subtle circular background for better touch rhythm
    borderRadius: theme.radius.round,
  },
  placeholder: {
    width: theme.spacing.xl + theme.spacing.xs,
  },
  leaveButton: {
    backgroundColor: theme.colors.danger,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.sm,
    elevation: 3,
  },
  leaveButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body2.fontSize,
    fontWeight: '600',
  },
  tooltipFlowWrapper: {
    alignItems: 'center',
    width: '100%',
    zIndex: 20,
    elevation: 10,
    marginBottom: 0,
  },
  tooltipContainer: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '90%',
    ...theme.shadows.card,
  },
  tooltipText: {
    ...theme.typography.body2,
    color: theme.colors.textPrimary,
    flex: 1,
    marginRight: theme.spacing.md,
    fontWeight: '600',
  },
  tooltipTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: theme.colors.accent,
    marginTop: -1, // slight overlap to prevent gap
  },
  boardContainer: {
    width: '100%',
    marginTop: 10,
    marginBottom: 5,
  },
  bingoContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    gap: theme.spacing.sm,
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
    fontSize: theme.typography.title.fontSize,
  },
  letterBox: {
    width: theme.spacing.xxl,
    height: theme.spacing.xxl,
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.radius.sm / 2,
  },
  activeLetterBox: {
    backgroundColor: theme.colors.success,
  },
  letterText: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
  },
  activeLetterText: {
    color: theme.colors.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  modalContent: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.surfaceLight,
    ...theme.shadows.card,
  },
  modalTitle: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  modalScroll: {
    maxHeight: 300,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    alignItems: 'flex-start',
  },
  listNumber: {
    ...theme.typography.body1,
    color: theme.colors.textSecondary,
    lineHeight: 24,
    marginRight: theme.spacing.sm,
    minWidth: 16,
  },
  instructionText: {
    flex: 1,
    ...theme.typography.body1,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  boldText: {
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  }
});

export default BingoScreen;
