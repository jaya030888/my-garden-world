// Capacitor Configuration for Standalone Android APK Generation
// This configuration bridges the web build directly to Android native WebView.

const config = {
  appId: 'com.floraquest.gardenworld',
  appName: 'My Garden World',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false
  }
};

export default config;
