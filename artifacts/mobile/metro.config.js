const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

/**
 * NativeWind v4 CSS interop setup.
 *
 * `withNativeWind` conflicts with Expo Router's `typedRoutes` feature (Expo SDK 54),
 * causing route discovery to fail. Instead we enable CSS source extension support
 * manually so Metro can resolve `global.css` without the full NativeWind transform.
 *
 * To activate the NativeWind className transform on native:
 *   1. Add `nativewind/babel` to babel.config.js presets
 *   2. Replace this block with `withNativeWind(config, { input: "./global.css" })`
 *   3. Disable React Compiler in app.json (`reactCompiler: false`) if conflicts persist
 */
const { assetExts, sourceExts } = config.resolver;
config.resolver.assetExts = assetExts.filter((ext) => ext !== "css");
config.resolver.sourceExts = [...sourceExts, "css"];

module.exports = config;
