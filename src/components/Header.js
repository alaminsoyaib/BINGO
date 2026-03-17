import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { theme } from '../theme';

const Header = ({ isSetupPhase, nextNumberToPlace, isWin, mode, onlineStatus, turnLabel, lastCalledNumber, winnerLabel }) => {
  const isOnline = mode === 'online' || mode === 'cloud';
  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let anim;
    if (isWin) {
      anim = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleValue, {
            toValue: 1.15,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          })
        ])
      );
      anim.start();
    } else {
      scaleValue.setValue(1);
    }

    return () => {
      if (anim) {
        anim.stop();
      }
    };
  }, [isWin, scaleValue]);

  return (
    <View style={styles.container}>
      {isOnline && (
        <View style={styles.onlineStatusBox}>
          <Text style={styles.onlineStatusText}>{onlineStatus}</Text>
          {turnLabel && <Text style={styles.turnText}>{turnLabel}</Text>}
          {lastCalledNumber !== null && lastCalledNumber !== undefined && (
            <Text style={styles.lastCallText}>LAST CALL: {lastCalledNumber}</Text>
          )}
          {winnerLabel && <Text style={styles.winnerText}>{winnerLabel}</Text>}
        </View>
      )}
      
      <View style={styles.phaseContainer}>
        {isWin ? (
          <Animated.Text style={[styles.winTitle, { transform: [{ scale: scaleValue }] }]}>
            YOU WON!
          </Animated.Text>
        ) : isSetupPhase ? (
          <>
            <Text style={styles.titleLabel}>PREPARE YOUR BOARD</Text>
            <View style={styles.drawnBox}>
              <Text style={styles.drawnLabel}>NEXT TILE: </Text>
              <Text style={styles.drawnNumber}>{nextNumberToPlace > 25 ? '--' : nextNumberToPlace}</Text>
            </View>
          </>
        ) : (
          <Text style={styles.titleLabel}>MATCH LINES TO WIN</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  onlineStatusBox: {
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    borderWidth: 2,
    borderColor: theme.colors.surfaceLight,
    alignItems: 'center',
    width: '100%',
    marginBottom: theme.spacing.xs,
  },
  onlineStatusText: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    fontWeight: 'bold',
  },
  turnText: {
    ...theme.typography.h2,
    color: theme.colors.accentYellow,
    marginVertical: theme.spacing.xs,
  },
  lastCallText: {
    ...theme.typography.body1,
    color: theme.colors.textPrimary,
  },
  winTitle: {
    ...theme.typography.h1,
    color: '#00FF41',
    textShadowColor: '#00FF41',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  winnerText: {
    ...theme.typography.h2,
    color: theme.colors.success,
    marginTop: theme.spacing.xs,
  },
  phaseContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: theme.spacing.xs,
    minHeight: theme.spacing.xxl + theme.spacing.sm,
  },
  titleLabel: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    letterSpacing: theme.typography.button.letterSpacing,
  },
  drawnBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.xl,
    marginTop: theme.spacing.xs,
  },
  drawnLabel: {
    ...theme.typography.body1,
    color: theme.colors.textSecondary,
  },
  drawnNumber: {
    ...theme.typography.h2,
    color: theme.colors.accent,
  }
});

export default Header;
