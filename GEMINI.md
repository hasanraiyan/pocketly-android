# Pocketly - Personal Finance Tracker

Pocketly is a modern mobile application for personal finance management, built with React Native and Expo. It allows users to track transactions, manage accounts, analyze spending patterns, and interact with a financial assistant via chat.

## Project Overview

- **Purpose:** Comprehensive personal finance tracking and analysis.
- **Platform:** Cross-platform mobile (Android, iOS) and Web via Expo.
- **Backend:** Connects to a dynamic backend API (specified by the user) with Bearer token authentication.

## Main Technologies

- **Framework:** [Expo](https://expo.dev/) (SDK 54) & [React Native](https://reactnative.dev/) (v0.81.5)
- **UI Library:** [React Native Paper](https://reactnativepaper.com/)
- **Navigation:** [React Navigation](https://reactnavigation.org/) (Bottom Tabs, Stack)
- **State Management:** React Context API + `useReducer`
- **Charts:** [React Native Chart Kit](https://github.com/indiespirit/react-native-chart-kit)
- **Data Persistence:** `expo-secure-store` for credentials.
- **Icons:** `@expo/vector-icons` (Ionicons)

## Project Architecture

The project follows a modular structure within the `src` directory:

- `src/api/`: Contains the base API client (`client.js`) handles authentication and requests.
- `src/components/`:
    - `common/`: Reusable UI elements (Button, Card, Input).
    - `ui/`: Feature-specific components (records, connect, onboarding).
- `src/context/`: Centralized state management via `PocketlyContext`.
- `src/hooks/`: Custom hooks providing simplified interfaces to the state and API (`useTransactions`, `useAccounts`, `useAnalysis`).
- `src/navigation/`: Defines the app's navigation flow (e.g., `MainTabs`).
- `src/screens/`: High-level screen components corresponding to navigation routes.

## Building and Running

Ensure you have the Expo CLI installed and an emulator/physical device ready.

| Task | Command |
| :--- | :--- |
| **Start Dev Server** | `npm start` |
| **Run on Android** | `npm run android` |
| **Run on iOS** | `npm run ios` |
| **Run on Web** | `npm run web` |

## Development Conventions

- **Component Style:** Functional components using React Hooks.
- **State Flow:** Use the `usePocketly` hook to access global state and actions.
- **API Interaction:** All network requests should go through the `api` or `streamChat` functions in `src/api/client.js`.
- **Styling:** Primarily uses React Native `StyleSheet`. `react-native-paper` components should be used for consistent UI/UX.
- **Authentication:** Credentials (Base URL and Token) are managed via `SecureStore` and must be present for the app to function beyond the onboarding/connect phase.

## Key Files

- `App.js`: Entry point that manages the root navigation and authentication state.
- `src/context/PocketlyContext.js`: The "brain" of the application state.
- `src/api/client.js`: Handles all communication with the backend.
- `src/navigation/MainTabs.js`: Defines the primary user interface structure.
