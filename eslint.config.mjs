import { createReactNativeConfig } from '@forthtilliath/eslint-config/react-native';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  createReactNativeConfig({ turbo: false }),
  {
    ignores: ['dist/*', 'android/**'],
  },
]);
