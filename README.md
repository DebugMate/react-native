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
  - [Using Error Boundaries](#using-error-boundaries)
- [API Reference](#api-reference)

## Installation

To install DebugMate for React Native, you can use either npm:

```bash
npm install debugmate-react-native
```

## Usage

#### Basic Setup

o get started with DebugMate, you need to initialize it with your API domain and token. This will allow Debugmate to publish error reports to your server.

```javascript
import Debugmate from "debugmate-react-native";

const debugmate = new Debugmate({
  domain: "https://your-domain.com",
  token: "your-api-token",
  enabled: true, // Enable or disable error reporting
});
```

#### Set User Context

You can attach user information to the error reports to get more context about which user experienced the error.

```javascript
const user = {
  id: 123,
  name: "John Doe",
  email: "john@example.com",
};

debugmate.setUser(user);
```

#### Set Environment Context

You can also set the environment context, which can include details about the application, server, and other important metadata.

```javascript
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

#### Using Error Boundary

To catch errors in React components, it’s recommended to use an ErrorBoundary. Here’s an example of how to implement one with DebugMate:

```javascript
import Debugmate from "debugmate-react-native";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };

    this.debugmate = new Debugmate({
      domain: DEBUGMATE_DOMAIN,
      token: DEBUGMATE_TOKEN,
      enabled: DEBUGMATE_ENABLED,
    });

    this.debugmate.setUser(user);
    this.debugmate.setEnvironment(environment);

    this.debugmate.setupGlobalErrorHandling();
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.log("Error info:", errorInfo);

    // Publish error using DebugMate
    this.debugmate.publish(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.errorText}>Something went wrong.</Text>
          <Text style={styles.errorDetails}>
            {this.state.errorInfo?.componentStack}
          </Text>
          <Button
            title="Try again"
            onPress={() => this.setState({ hasError: false })}
          />
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

Wrap your application components with this ErrorBoundary to catch and handle errors more gracefully.

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
