module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // The Reanimated/Worklets Babel plugin MUST be listed last. With Reanimated
    // v4 the plugin ships from `react-native-worklets`.
    plugins: ['react-native-worklets/plugin'],
  };
};
