const { withAppBuildGradle } = require('expo/config-plugins');

const MARKER = '// withCmakeVersion';

/**
 * Compile le C++ du module app avec une version de CMake précise (installée par le SDK Manager).
 * Sous Windows, le ninja de CMake 3.22.1 (1.10) ignore les chemins longs : depuis
 * react-native-safe-area-context 5.10, un fichier codegen dépasse 260 caractères. Le ninja de
 * CMake 4.1.2 (1.12) les accepte quand `LongPathsEnabled` est activé.
 */
const withCmakeVersion = (config, { version = '4.1.2' } = {}) =>
  withAppBuildGradle(config, (mod) => {
    if (!mod.modResults.contents.includes(MARKER)) {
      mod.modResults.contents += `\n${MARKER}\nandroid.externalNativeBuild.cmake.version = "${version}"\n`;
    }
    return mod;
  });

module.exports = withCmakeVersion;
