# WaterSupply

A water delivery ledger built with Expo, React Native, TypeScript, Expo Router, and Firebase Cloud Firestore. Track customer accounts, deliveries, payments, and outstanding bottle balances.

## Current status

This is a prototype with one shared dataset. Authentication and private per-user ledgers are planned but **not implemented**. Do not use it for sensitive customer data until authentication and database access controls are in place.

Firestore access depends on the rules deployed to your Firebase project. This repository does not include a production-ready rules configuration. Do not enable unrestricted database access to make setup work.

## Features

- Create customer accounts with an opening bottle balance.
- Record dated cash or credit deliveries.
- Record payments in bottle quantities; this is not a currency-based accounting system.
- View customer history and outstanding balances.
- View daily delivery/payment totals and recent activity.
- Delete customer accounts and their related deliveries and payments.

## Local setup

You need Git, Node.js and npm compatible with the Expo version in `package.json`, and a Firebase project with Cloud Firestore. Local Android builds require Android development tools; local iOS builds require macOS and Xcode.

```sh
git clone git@github.com:AbdullahRizwan/WaterSupply.git
cd WaterSupply
npm ci
cp .env.example .env
```

Fill in `.env` using your Firebase app configuration:

```dotenv
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
```

The app requires all three variables and throws an error if any is missing. Restart Expo after changing them. `.env` is ignored by Git; `.env.example` contains placeholders only.

Values prefixed with `EXPO_PUBLIC_` are client configuration, not a place for private credentials. Never put service-account keys or other server secrets there.

Use a separate Firebase development project with disposable data while security work is pending. Starting the UI does not grant database access: restrictive rules will reject the current unauthenticated app's reads and writes.

```sh
npm start
```

## Commands

| Command | Purpose |
| --- | --- |
| `npm start` | Start the Expo development server. |
| `npm run android` | Build and run the Android app locally. |
| `npm run ios` | Build and run the iOS app locally. |
| `npm run web` | Start Expo for the web target. |
| `npm run typecheck` | Run TypeScript checks without emitting files. |
| `npm test` | Compile ledger helpers and run the Node assertion tests. |

The test runner writes temporary files to `.tmp-test-build/`, which is ignored by Git. The existing tests cover selected ledger calculations, not authentication, Firestore rules, or end-to-end app behavior.

`eas.json` defines development, preview, and production build profiles. `app.json` currently contains the original project's app identifiers and EAS project ID; review those before building under a different Expo account.

## Project structure

```text
app/          Expo Router screens and layouts
components/   Shared UI components
constants/    Theme values
hooks/        Firestore subscriptions for accounts and activity
services/     Firebase initialization and database writes
types/        Data models
utils/        Ledger calculations and asynchronous helpers
scripts/      Helper test runner
assets/       App icons and splash artwork
```

## Current data model

```text
accounts/{accountId}
  deliveries/{deliveryId}
  payments/{paymentId}
```

Accounts store a name, bottle balance, and creation date. Deliveries store quantity, cash/credit status, and date. Payments store quantity and date. These accounts represent customers, not login identities.

All app instances configured for the same Firebase project query the same collections. Deliveries/payments and their account balance updates currently use separate writes, so partial failures can leave inconsistent data. Account deletion also uses multiple operations.

## Planned multi-user support

The agreed direction is independent users, each with a private ledger:

- Email/password login, email verification, and password reset.
- Customer records under `users/{userId}/accounts/{accountId}`.
- Firestore rules enforcing ownership for every read and write.
- User-scoped queries and cleared state on sign-out.
- Atomic activity and balance updates.
- Migration of existing records to a designated owner.
- Tests proving one user cannot access another user's records.

Registration policy is still undecided. These items describe planned work, not available functionality.
