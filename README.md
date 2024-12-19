# DebugMate React Native

DebugMate is an error tracking and monitoring tool designed for React Native applications. This package allows you to capture and send error reports along with environment, user, and request context information to a remote API.

#### Expo Support

DebugMate works seamlessly with Expo. It automatically detects whether your app is running inside an Expo environment and utilizes expo-constants to retrieve device and system information. You don’t need to configure anything extra for Expo-specific support.

#### Singleton Design Pattern

The DebugMate constructor is based on the Singleton pattern, meaning that only one instance of DebugMate will be created during the application’s lifecycle. When you call the constructor multiple times, it will return the same instance. This ensures that all error reporting is consistent throughout the app.

If for any reason you need to reset or reinitialize DebugMate, you can manually reset the singleton instance like this:

```javascript
// Reset the instance by setting it to null
Debugmate.instance = null;

// Create a new instance
const newDebugmate = new Debugmate({
  domain: "https://your-new-domain.com",
  token: "new-api-token",
  enabled: true,
});
```

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Basic Setup](#basic-setup)
  - [Set User Context](#set-user-context)
  - [Set Environment Context](#set-environment-context)
  - [Set Request Context](#set-request-context)
  - [Publish Errors](#publish-errors)
  - [Automatic Error Handling](#automatic-error-handling)
- [API Reference](#api-reference)

## Installation

### For React Native Projects with Expo

To install DebugMate in a project using Expo, simply run the following command:

```bash
npm i @debugmate/react-nativejs
```

The package comes with built-in support for Expo, and no additional configuration is necessary. Just wrap your app with the DebugmateProvider as shown in the usage section.

### For React Native Projects Without Expo (React Native CLI)

To install DebugMate in a React Native project without Expo, follow these steps:

1. Install the necessary packages using npm:

```bash
npm install react-native-device-info --save
npm install @debugmate/react-nativejs --save
```

2. After installing the packages, it is necessary to clear the cache to ensure the dependencies are configured properly. Run the following command:

```bash
npx react-native start --reset-cache
```
3. Now, you can proceed with the configuration and usage of DebugMate as described in the following sections.


## Usage

### Basic Setup

#### For React Native Projects with Expo

In Expo projects, you can use DebugmateProvider directly to integrate DebugMate without any additional setup. Here’s an example of how you can initialize DebugMate within an Expo-based application:

```tsx
// app/_layout

import {  ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { DebugmateProvider } from '@debugmate/react-nativejs';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <DebugmateProvider
        domain="https://your-domain.com"
        token="your-api-token"
        enabled={true}
        user={{
          id: 1,
          name: "John Doe",
          email: "john.doe@example.com",
        }}
        environment={{
          environment: "production",
          debug: false,
          timezone: "UTC",
          server: "nginx",
          database: "PostgreSQL",
        }}
      >
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      </DebugmateProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

```

#### For React Native Projects Without Expo (React Native CLI)

Modify your App.tsx (or equivalent entry file):

```tsx
// App.tsx

import { DebugmateProvider } from '@debugmate/react-nativejs';
import React from 'react';
import { SafeAreaView, ScrollView, StatusBar, Text, View, StyleSheet, useColorScheme } from 'react-native';

type SectionProps = {
  title: string;
};

function Section({ children, title }: SectionProps): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          { color: isDarkMode ? 'white' : 'black' },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          { color: isDarkMode ? 'lightgray' : 'darkgray' },
        ]}>
        {children}
      </Text>
    </View>
  );
}

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#1e1e1e' : '#f0f0f0',
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <DebugmateProvider
        domain="https://your-domain.com"
        token="your-api-token"
        enabled={true}
        user={{
          id: 1,
          name: "John Doe",
          email: "john.doe@example.com",
        }}
        environment={{
          environment: "production",
          debug: false,
          timezone: "UTC",
          server: "nginx",
          database: "PostgreSQL",
        }}
      >
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={backgroundStyle.backgroundColor}
        />
        <ScrollView contentInsetAdjustmentBehavior="automatic" style={backgroundStyle}>
          <Section title="Step One">
            Edit <Text style={styles.highlight}>App.tsx</Text> to change this
            screen and then come back to see your edits.
          </Section>
          <Section title="See Your Changes">
            Reload the app to see your changes.
          </Section>
          <Section title="Debug">
            Debug your app with enhanced error tracking.
          </Section>
        </ScrollView>
      </DebugmateProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
```

#### Set User Context

You can attach user information to the error reports to get more context about which user experienced the error.

```javascript
import { useDebugmateContext } from '@debugmate/react-nativejs';

const debugmate = useDebugmateContext();

debugmate.setUser({
  id: 123,
  name: "Jane Doe",
  email: "jane.doe@example.com",
});
```

#### Set Environment Context

You can also set the environment context, which can include details about the application, server, and other important metadata.

```javascript
import { useDebugmateContext } from '@debugmate/react-nativejs';

const debugmate = useDebugmateContext();

const environment = {
  environment: "production", // 'development', 'staging', 'production', etc.
  debug: false,
  timezone: "UTC",
  server: "nginx",
  database: "mysql",
  npm: "6.14.8",
};

debugmate.setEnvironment(environment);
```

#### Set Request Context

You can track information about the HTTP requests in case an error occurs during a network operation.

**Note:** The request context is only captured when you explicitly call the publish() method. There is no automatic way to capture request details. You must pass the request context manually each time you want to include it in the error report.

```javascript
import { useDebugmateContext } from '@debugmate/react-nativejs';

const debugmate = useDebugmateContext();

const request = {
  request: {
    url: "https://your-api.com/endpoint",
    method: "POST",
    params: { key: "value" },
  },
  headers: {
    Authorization: "Bearer token",
    "Content-Type": "application/json",
  },
  query_string: { search: "query" },
  body: JSON.stringify({ data: "payload" }),
};
```

#### Publish Errors

To publish errors manually, you can call the publish method, which will send the error and context information to the DebugMate API.

**Important**: When calling the publish method explicitly (e.g., inside a try/catch), if you want to include the userContext, environmentContext, and requestContext, you must pass them as parameters to the publish method. These contexts are **not captured automatically** when you call publish manually.

```javascript
import { useDebugmateContext } from '@debugmate/react-nativejs';

const debugmate = useDebugmateContext();

try {
  // Simulate some code that throws an error
  throw new Error("Something went wrong!");
} catch (error) {
  debugmate.publish(error, user, environment, request);
}
```

#### Automatic Error Handling

You can set up global error handling for both caught and uncaught errors in your React Native application:

```javascript
debugmate.setupGlobalErrorHandling();
```

This will automatically capture uncaught exceptions and unhandled promise rejections, and send them to the DebugMate API.

## API Reference

### DebugMate Constructor

- **domain:** The API endpoint to which errors are sent (required).

- **token:** The API token used for authentication (required).

- **enabled:** Boolean flag to enable or disable error reporting (optional, default: true).

### Methods

- **setUser(user):** Attach user information to the error report.

- **setEnvironment(environment):** Set environment metadata such as app version, server info, etc.

- **setRequest(request):** Attach details about the current HTTP request to the error report.

- **publish(error, userContext = null, environmentContext = null, requestContext = null):** Send an error report to the API. You must pass the request context as a parameter if you want to capture it.

- **setupGlobalErrorHandling():** Automatically capture uncaught exceptions.
