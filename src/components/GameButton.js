import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ActivityIndicator } from 'react-native';
import { theme } from '../theme';

const GameButton = ({
  title,
  onPress,
  subtitle,
  variant = 'primary', // 'primary', 'secondary', 'accent', 'danger'
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle
}) => {

  const getColors = () => {
    switch (variant) {
      case 'secondary':
        return { bg: theme.colors.secondary, border: '#D65A5A', text: '#2D2A43' };
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
      disabled={disabled || loading}
      style={[styles.container, style, (disabled || loading) && styles.disabled]}
    >
      <View style={[styles.inner, { backgroundColor: colors.bg, borderColor: colors.border }]}>
        {loading ? (
          <ActivityIndicator color={colors.text} size="small" />
        ) : (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {icon && typeof icon === 'function' ? icon(colors.text) : icon}
              <Text style={[styles.text, { color: colors.text }, textStyle]}>{title}</Text>
            </View>
            {subtitle && <Text style={[styles.subtitle, { color: colors.text }]}>{subtitle}</Text>}
          </>
        )}
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
    borderBottomWidth: theme.spacing.xs, // 3D effect
  },
  text: {
    ...theme.typography.button,
  },
  subtitle: {
    ...theme.typography.body2,
    opacity: 0.8,
    marginTop: theme.spacing.xs,
  }
});

export default GameButton;
