// Lightweight manual mock for react-native-reanimated.
//
// The package's own `react-native-reanimated/mock` transitively imports the real
// entry point, which initializes `react-native-worklets` and throws under Jest
// ("Native part of Worklets doesn't seem to be initialized"). This mock exposes
// just the surface our code uses, backed by RN's Animated components, so screens
// that animate render synchronously in tests. Types still come from the real
// package during `tsc` — only the runtime is replaced here.
const { View, Text, Image, Animated } = require('react-native');

const noop = () => {};

const Extrapolation = { CLAMP: 'clamp', EXTEND: 'extend', IDENTITY: 'identity' };

module.exports = {
  __esModule: true,
  default: {
    View,
    Text,
    Image,
    ScrollView: Animated.ScrollView,
    FlatList: Animated.FlatList,
    createAnimatedComponent: (component) => component,
  },
  useSharedValue: (init) => ({ value: init }),
  useAnimatedStyle: (factory) =>
    typeof factory === 'function' ? factory() : {},
  useAnimatedScrollHandler: () => noop,
  useAnimatedReaction: noop,
  useDerivedValue: (factory) => ({
    value: typeof factory === 'function' ? factory() : undefined,
  }),
  useAnimatedRef: () => ({ current: null }),
  interpolate: () => 0,
  Extrapolation,
  Extrapolate: Extrapolation,
  runOnJS: (fn) => fn,
  runOnUI: (fn) => fn,
};
