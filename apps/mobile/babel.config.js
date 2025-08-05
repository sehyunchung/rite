module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      [
        '@tamagui/babel-plugin',
        {
          components: ['@rite/ui', 'tamagui'],
          config: '../../packages/ui/src/tamagui.config.ts',
          disableExtraction: process.env.NODE_ENV === 'development',
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};