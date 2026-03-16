import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Controls = ({ isSetupPhase, onAutoFill, onRestart, onUndo, canUndo, hasStarted, mode, canRestart }) => {
  const isOnline = mode === 'online';
  const showUndo = !isOnline && canUndo;
  const restartDisabled = isOnline && !canRestart;

  return (
    <View style={styles.container}>
      {isSetupPhase ? (
        <View style={styles.column}>
          <TouchableOpacity style={styles.primaryButton} onPress={onAutoFill}>
            <Text style={styles.buttonText}>Random Number</Text>
          </TouchableOpacity>
          {hasStarted && (
            <TouchableOpacity 
              style={[styles.restartButtonLarge, restartDisabled && styles.disabledButton]} 
              onPress={onRestart}
              disabled={restartDisabled}
            >
              <Text style={styles.dangerButtonText}>Restart</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.row}>
          <TouchableOpacity 
            style={[styles.dangerButton, restartDisabled && styles.disabledButton]} 
            onPress={onRestart}
            disabled={restartDisabled}
          >
            <Text style={styles.dangerButtonText}>Restart</Text>
          </TouchableOpacity>
          {showUndo && (
            <TouchableOpacity style={styles.secondaryButton} onPress={onUndo}>
              <View style={styles.buttonContent}>
                <MaterialCommunityIcons name="undo" size={24} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.secondaryButtonText}>Undo</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 40,
    marginTop: 5,
  },
  column: {
    flexDirection: 'column',
    gap: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
  },
  primaryButton: {
    backgroundColor: '#009688',
    height: 60, // Fixed height for perfect centering
    justifyContent: 'center',
    borderRadius: 4,
    alignItems: 'center', 
    width: '100%',
  },
  secondaryButton: {
    backgroundColor: '#a27146',
    height: 60,
    justifyContent: 'center',
    borderRadius: 4,
    flex: 1,
    alignItems: 'center',
  },
  dangerButton: {
    backgroundColor: '#009688',
    height: 60,
    justifyContent: 'center',
    borderRadius: 4,
    flex: 1,
    alignItems: 'center',
  },
  restartButtonLarge: {
    backgroundColor: '#009688',
    height: 60,
    justifyContent: 'center',
    borderRadius: 4,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 22, // Slightly larger for better readability
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 24, // Matched with Restart
    fontWeight: 'bold',
    includeFontPadding: false, // Prevents vertical shifts
    textAlignVertical: 'center',
  },
  dangerButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  disabledButton: {
    opacity: 0.6,
  }
});

export default Controls;
