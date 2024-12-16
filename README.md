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

To install DebugMate for React Native, you can use either npm:

```bash
npm i @debugmate/react-nativejs
```

## Usage

#### Basic Setup

Initialize DebugMate by wrapping your application with the DebugmateProvider. Provide your API domain, token, and any additional context like user and environment.

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
