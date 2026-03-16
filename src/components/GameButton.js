import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { theme } from '../theme';

const GameButton = ({ 
  title, 
  onPress, 
  subtitle,
  variant = 'primary', // 'primary', 'secondary', 'accent', 'danger'
  disabled = false,
  style
}) => {
  
  const getColors = () => {
    switch (variant) {
      case 'secondary':
        return { bg: theme.colors.secondary, border: '#D65A5A', text: theme.colors.textPrimary };
      case 'accent':
        return { bg: theme.colors.accent, border: '#00A3A0', text: '#1A1829' };
      case 'danger':
        return { bg: theme.colors.danger, border: '#B32424', text: theme.colors.textPrimary };
      case 'primary':
      default:
        return { bg: theme.colors.primary, border: theme.colors.primaryDark, text: theme.colors.textPrimary };
    }
  };

  const colors = getColors();

  return (
    <TouchableOpacity 
      activeOpacity={0.8} 
      onPress={onPress} 
      disabled={disabled}
      style={[styles.container, style, disabled && styles.disabled]}
    >
      <View style={[styles.inner, { backgroundColor: colors.bg, borderColor: colors.border }]}>
        <Text style={[styles.text, { color: colors.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.subtitle, { color: colors.text }]}>{subtitle}</Text>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    ...theme.shadows.button,
  },
  disabled: {
    opacity: 0.5,
  },
  inner: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 4, // 3D effect
  },
  text: {
    ...theme.typography.button,
  },
  subtitle: {
    ...theme.typography.body2,
    opacity: 0.8,
    marginTop: 4,
  }
});

export default GameButton;
