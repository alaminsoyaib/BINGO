import { rs, rvs, clamp, windowSize } from './utils/responsive';

const { width: screenWidth } = windowSize();

export const theme = {
  colors: {
    background: '#1A1829',     // Deep space/dark purple
    surface: '#2D2A43',        // Panels & Cards backgrounds
    surfaceLight: '#3F3B5D',
    primary: '#6C5CE7',        // Buttons, highlights
    primaryDark: '#5044A8',    // Button depth
    secondary: '#FF7675',      // Accent, maybe bingo complete
    accent: '#00CEC9',         // Start game, special actions
    textPrimary: '#FFFFFF',
    textSecondary: '#A9A6C2',
    accentYellow: '#FDCB6E',
    tileEmpty: '#3F3B5D',
    tileAssigned: '#6C5CE7',   // the color when a number is present
    tileMarked: '#E17055',     // the color when user marks it
    tileWinning: '#00B894',    // the complete bingo line
    danger: '#D63031',
    success: '#00B894',
    warning: '#FDCB6E',
  },
  typography: {
    fontFamily: 'sans-serif', // Forces basic Roboto instead of user's curly fonts
    // ...
    title: {
      fontFamily: 'sans-serif',
      fontSize: rs(48, 36, 60),
      fontWeight: '900',
      textTransform: 'uppercase',
      letterSpacing: rs(2, 1, 3),
    },
    h1: {
      fontFamily: 'sans-serif',
      fontSize: rs(32, 24, 40),
      fontWeight: '800',
    },
    h2: {
      fontFamily: 'sans-serif',
      fontSize: rs(24, 18, 30),
      fontWeight: 'bold',
    },
    body1: {
      fontFamily: 'sans-serif',
      fontSize: rs(18, 14, 22),
      fontWeight: '600',
    },
    body2: {
      fontFamily: 'sans-serif',
      fontSize: rs(16, 13, 20),
      fontWeight: '500',
    },
    button: {
      fontFamily: 'sans-serif',
      fontSize: rs(18, 14, 22),
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: rs(1, 0.5, 2),
    }
  },
  spacing: {
    xs: rs(4, 3, 6),
    sm: rs(8, 6, 11),
    md: rs(16, 12, 20),
    lg: rs(24, 16, 30),
    xl: rs(32, 22, 40),
    xxl: rs(48, 32, 56),
  },
  layout: {
    maxContentWidth: clamp(screenWidth, 360, 860),
    maxCardWidth: clamp(screenWidth * 0.96, 320, 740),
    qrSize: clamp(screenWidth * 0.42, 130, 190),
  },
  icon: {
    sm: rs(18, 16, 22),
    md: rs(24, 20, 28),
    lg: rs(28, 24, 34),
  },
  radius: {
    sm: rs(8, 6, 12),
    md: rs(12, 9, 16),
    lg: rs(20, 14, 24),
    xl: rs(30, 20, 36),
    round: 9999,
  },
  shadows: {
    button: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: rvs(4, 2, 6) },
      shadowOpacity: 0.3,
      shadowRadius: rs(4, 2, 6),
      elevation: rs(6, 4, 10),
    },
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: rvs(8, 4, 10) },
      shadowOpacity: 0.5,
      shadowRadius: rs(8, 5, 12),
      elevation: rs(8, 5, 12),
    }
  }
};
