import { Dimensions } from 'react-native';

const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

const getWindow = () => Dimensions.get('window');

export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const scale = (size) => (getWindow().width / BASE_WIDTH) * size;

export const verticalScale = (size) => (getWindow().height / BASE_HEIGHT) * size;

export const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

export const rs = (size, min = size * 0.85, max = size * 1.25) =>
  clamp(moderateScale(size), min, max);

export const rvs = (size, min = size * 0.85, max = size * 1.2) =>
  clamp(verticalScale(size), min, max);

export const windowSize = () => getWindow();
