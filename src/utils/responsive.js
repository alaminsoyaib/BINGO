import { Dimensions } from 'react-native';

const getWindow = () => Dimensions.get('window');

// Clamp is still useful for other things
export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

// Disabled responsive scaling to ensure UI sizing is strictly consistent
// across all devices, behaving exactly like native DP sizing.
export const scale = (size) => size;

export const verticalScale = (size) => size;

export const moderateScale = (size, factor = 0.5) => size;

// Just return the requested base size
export const rs = (size, min, max) => size;

export const rvs = (size, min, max) => size;

export const windowSize = () => getWindow();
