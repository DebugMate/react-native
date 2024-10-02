import { Platform } from "react-native";
import Constants from "expo-constants";

let DeviceInfo = null;
if (Platform.OS !== "web") {
  try {
    DeviceInfo = require("react-native-device-info");
  } catch (e) {
    console.warn("DeviceInfo not available, using Expo Managed Workflow.");
  }
}

class Context {
  constructor() {
    this.error = null;
    this.request = null;
    this.user = null;
    this.environment = null;

    this.context = this.getDeviceInfo();
  }

  getDeviceInfo() {
    const defaultInfo = {
      systemName: "unknown",
      systemVersion: "unknown",
    };

    if (Constants.appOwnership === "expo") {
      return {
        systemName: Constants.platform?.ios ? "iOS" : "Android",
        systemVersion: Constants.systemVersion || "unknown",
      };
    }

    if (DeviceInfo) {
      return {
        systemName: DeviceInfo.getSystemName(),
        systemVersion: DeviceInfo.getSystemVersion(),
      };
    }

    return defaultInfo;
  }

  setError(error) {
    this.error = error;
    return this;
  }

  setRequest(request) {
    this.request = request;
    return this;
  }

  setUser(user) {
    this.user = user;
    return this;
  }

  setEnvironment(environment) {
    this.environment = environment;
    return this;
  }

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

export { Context };
