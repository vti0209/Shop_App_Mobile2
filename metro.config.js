const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver = {
  ...config.resolver,
  sourceExts: [
    ...config.resolver.sourceExts,
    'web.js',
    'web.ts',
    'web.tsx',
    'css',
  ],
  resolverMainFields: ['react-native', 'browser', 'main'],
};

module.exports = mergeConfig(config, {});