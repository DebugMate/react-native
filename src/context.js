import { Platform } from "react-native";

let DeviceInfo = null;
let Constants = null;

if (Platform.OS !== "web") {
  try {
    Constants = require("expo-constants");
  } catch (e) {
    DeviceInfo = require("react-native-device-info");
    console.warn(
      "DeviceInfo or Constants not available, possibly running on a non-Expo environment."
    );
  }
}

/**
 * @typedef {Object} Environment
 * @property {string} environment - Current environment (e.g., production, development)
 * @property {boolean} debug - Debug mode flag
 * @property {string} timezone - Timezone of the application
 * @property {string} server - Server information (e.g., nginx, mobile)
 * @property {string} database - Database information
 * @property {string} npmVersion - Version of the npm package
 * @property {string} jsVersion - Version of the JavaScript engine
 * @property {string} browser - Browser information (for web contexts)
 */

/**
 * @typedef {Object} Request
 * @property {Object} request - Request object containing URL, method, params
 * @property {Object} headers - Headers sent with the request
 * @property {Object} query_string - Query string from the request
 * @property {string} body - Body of the request
 */

/**
 * Context class to manage and gather information related to errors, requests, users, environments, and device context.
 */
class Context {
  constructor() {
    this.error = null;
    this.request = null;
    this.user = null;
    this.environment = [];
    this.context = this.getDeviceInfo();
  }

  /**
   * Retrieves device information such as system name, version, and device name.
   * Tries to use expo-constants for Expo apps, and react-native-device-info for React Native apps.
   * @returns {Object} An object with device information.
   */
  getDeviceInfo() {
    const defaultInfo = {
      systemName: "unknown",
      systemVersion: "unknown",
      deviceName: "unknown",
      appOwnership: "unknown",
    };

    if (Constants && Constants.default?.appOwnership === "expo") {
      return {
        systemName: Constants.default.platform?.ios ? "iOS" : "Android",
        systemVersion: Constants.default.systemVersion || "unknown",
        deviceName: Constants.default.deviceName || "unknown",
        appOwnership: Constants.default.appOwnership || "unknown",
      };
    } else if (DeviceInfo) {
      return {
        systemName: DeviceInfo.getSystemName(),
        systemVersion: DeviceInfo.getSystemVersion(),
        deviceName: DeviceInfo.getDeviceName(),
        appOwnership: "standalone",
      };
    }

    return defaultInfo;
  }

  /**
   * Sets the error information.
   * @param {Error} error - The error to be set.
   * @returns {Context} Returns the current context instance for chaining.
   */
  setError(error) {
    this.error = error;
    return this;
  }

  /**
   * Sets the request context information.
   * @param {Request} request - The request object containing request details.
   * @returns {Context} Returns the current context instance for chaining.
   */
  setRequest(request) {
    this.request = request;
    return this;
  }

  /**
   * Sets the user information.
   * @param {Object} user - The user object containing user details (e.g., id, name, email).
   * @returns {Context} Returns the current context instance for chaining.
   */
  setUser(user) {
    this.user = user;
    return this;
  }

  /**
   * Sets the environment information, organizing it into specific groups for JavaScript, App, and System.
   * @param {Environment} environment - The environment object containing relevant information.
   * @returns {Context} Returns the current context instance for chaining.
   */
  setEnvironment(environment) {
    this.environment = [
      {
        group: "JavaScript",
        variables: {
          version: environment.jsVersion || "unknown",
        },
      },
      {
        group: "App",
        variables: {
          environment: environment.environment || "production",
          debug: environment.debug !== undefined ? environment.debug : __DEV__,
          timezone: environment.timezone || "unknown",
        },
      },
      {
        group: "System",
        variables: {
          os: Platform.OS,
          server: environment.server || "unknown",
          database: environment.database || "unknown",
          npm: environment.npmVersion || "unknown",
          browser: environment.browser || "unknown",
        },
      },
    ];

    return this;
  }

  /**
   * Builds the payload with the current context state (error, request, user, environment, and device context).
   * @returns {Object} The payload object to be sent to the Debugmate API.
   */
  payload() {
    return {
      error: this.error,
      request: this.request,
      user: this.user,
      environment: this.environment,
      context: this.context,
    };
  }
}

export default Context;
