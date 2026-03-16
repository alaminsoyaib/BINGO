import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const Header = ({ isSetupPhase, nextNumberToPlace, isWin }) => {
  return (
    <View style={styles.container}>
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
  winTitle: {
    fontSize: 28, // Slightly larger for emphasis
    color: '#059669', // Match win green
    fontWeight: 'bold',
    paddingVertical: 10,
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
