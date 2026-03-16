import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import GameButton from './GameButton';

const Controls = ({ isSetupPhase, onAutoFill, onRestart, onUndo, canUndo, hasStarted, mode, canRestart }) => {
  const isOnline = mode === 'online';
  const showUndo = !isOnline && canUndo;
  const restartDisabled = isOnline && !canRestart;

  return (
    <View style={styles.container}>
      {isSetupPhase ? (
        <View style={styles.column}>
          <GameButton 
            title="RANDOM FILL" 
            variant="accent" 
            onPress={onAutoFill} 
          />
          {hasStarted && (
            <GameButton 
              title="RESTART" 
              variant="danger" 
              onPress={onRestart} 
              disabled={restartDisabled}
            />
          )}
        </View>
      ) : (
        <View style={styles.row}>
          <View style={styles.flexBtn}>
            <GameButton 
              title="RESTART" 
              variant="danger" 
              onPress={onRestart} 
              disabled={restartDisabled}
            />
          </View>
          {showUndo && (
            <View style={styles.flexBtn}>
              <GameButton 
                title="UNDO" 
                variant="secondary" 
                onPress={onUndo} 
              />
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  column: {
    flexDirection: 'column',
    gap: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  flexBtn: {
    flex: 1,
  }
});

export default Controls;
