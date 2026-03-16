import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const Header = ({ isSetupPhase, nextNumberToPlace, isWin, mode, onlineStatus, turnLabel, lastCalledNumber, winnerLabel }) => {
  const isOnline = mode === 'online';

  return (
    <View style={styles.container}>
      {isOnline && (
        <View style={styles.onlineStatus}>
          <Text style={styles.onlineStatusText}>{onlineStatus}</Text>
          {turnLabel && <Text style={styles.onlineStatusText}>{turnLabel}</Text>}
          {lastCalledNumber !== null && lastCalledNumber !== undefined && (
            <Text style={styles.onlineStatusText}>Last Call : {lastCalledNumber}</Text>
          )}
          {winnerLabel && <Text style={styles.winnerText}>{winnerLabel}</Text>}
        </View>
      )}
      {isWin ? (
        <Text style={styles.winTitle}>--- YOU WON ---</Text>
      ) : isSetupPhase ? (
        <>
          <Text style={styles.titleLabel}>Select 1-25 tiles</Text>
          <Text style={styles.drawnLabel}>
            Next Number : <Text style={styles.drawnNumber}>{nextNumberToPlace > 25 ? '--' : nextNumberToPlace}</Text>
          </Text>
        </>
      ) : (
        <>
          <Text style={styles.titleLabel}>Match lines to unlock letter</Text>
          <Text style={styles.titleLabel}>Play</Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 5,
    gap: 4,
  },
  onlineStatus: {
    alignItems: 'center',
    gap: 2,
    marginBottom: 6,
  },
  onlineStatusText: {
    fontSize: 16,
    color: '#3f3f46',
    fontWeight: '500',
  },
  winTitle: {
    fontSize: 28, // Slightly larger for emphasis
    color: '#059669', // Match win green
    fontWeight: 'bold',
    paddingVertical: 10,
  },
  winnerText: {
    fontSize: 18,
    color: '#0f766e',
    fontWeight: '700',
  },
  titleLabel: {
    fontSize: 24,
    color: '#18181b', // Changing to dark text to match the gray background
    fontWeight: '600',
  },
  drawnLabel: {
    fontSize: 18,
    color: '#3f3f46',
    fontWeight: '500',
  },
  drawnNumber: {
    fontSize: 20,
    color: '#27272a',
    fontWeight: 'bold',
  }
});

export default Header;
