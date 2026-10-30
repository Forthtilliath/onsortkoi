import { createReactNativeConfig } from '@forthtilliath/eslint-config/react-native';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  createReactNativeConfig({ expo: true }),
  {
    // Les config plugins Expo sont chargés par `require` : ils restent en CommonJS.
    files: ['plugins/**/*.js'],
    languageOptions: { sourceType: 'commonjs' },
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
  {
    ignores: ['dist/*', 'android/**'],
  },
]);
