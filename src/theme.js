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
      fontSize: 48,
      fontWeight: '900',
      textTransform: 'uppercase',
      letterSpacing: 2,
    },
    h1: {
      fontFamily: 'sans-serif',
      fontSize: 32,
      fontWeight: '800',
    },
    h2: {
      fontFamily: 'sans-serif',
      fontSize: 24,
      fontWeight: 'bold',
    },
    body1: {
      fontFamily: 'sans-serif',
      fontSize: 18,
      fontWeight: '600',
    },
    body2: {
      fontFamily: 'sans-serif',
      fontSize: 16,
      fontWeight: '500',
    },
    button: {
      fontFamily: 'sans-serif',
      fontSize: 18,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: 1,
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 20,
    xl: 30,
    round: 9999,
  },
  shadows: {
    button: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 6,
    },
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 8,
    }
  }
};
