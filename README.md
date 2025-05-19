# SpeakAI - Modern React Native App

A beautiful, modern React Native mobile app built with Expo and TypeScript, featuring smooth animations and a dark theme.

## Features

- Modern UI with dark theme and gradient backgrounds
- Smooth entrance animations using react-native-reanimated
- Custom Inter font integration
- TypeScript support
- Navigation between screens
- Mobile-first design

## Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- Expo Go app installed on your mobile device
  - [Android Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
  - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npx expo start
```

3. Connect to your mobile device:
   - Make sure your mobile device and computer are on the same WiFi network
   - Open the Expo Go app on your device
   - Scan the QR code shown in the terminal or Expo DevTools
   - The app will load on your device

## Development

The app uses:
- TypeScript for type safety
- React Navigation for screen management
- Expo Linear Gradient for beautiful backgrounds
- React Native Reanimated for smooth animations
- Inter font family for modern typography

## Deployment

To deploy your app to production:

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Configure your project:
```bash
eas build:configure
```

3. Build for your target platform:
```bash
eas build --platform android
# or
eas build --platform ios
```

## Troubleshooting

If you encounter any issues:
1. Ensure your mobile device and computer are on the same network
2. Try restarting the Expo development server
3. Make sure you have the latest version of Expo Go installed
4. Check that all dependencies are properly installed
5. Clear the Metro bundler cache: `npx expo start -c` 