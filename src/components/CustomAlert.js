import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import GameButton from './GameButton';

const CustomAlert = ({ visible, title, message, onClose, icon = "information-circle", type = "info" }) => {
  const getIconColor = () => {
    switch (type) {
      case 'success': return theme.colors.success;
      case 'warning': return theme.colors.warning;
      case 'error': return theme.colors.danger;
      default: return theme.colors.accent;
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.alertBox}>
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={theme.icon.xl || 48} color={getIconColor()} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttonContainer}>
            <GameButton 
              title="OK" 
              variant={type === 'error' ? 'danger' : 'primary'} 
              onPress={onClose} 
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  alertBox: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.05)',
    ...theme.shadows.card,
  },
  iconContainer: {
    marginBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  message: {
    ...theme.typography.body1,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
  }
});

export default CustomAlert;
