import DeviceInfo from "react-native-device-info";

class Context {
  constructor() {
    this.error = null;
    this.request = null;
    this.user = null;
    this.environment = null;
    this.device = {
      deviceId: DeviceInfo.getDeviceId(),
      systemName: DeviceInfo.getSystemName(),
      systemVersion: DeviceInfo.getSystemVersion(),
      appVersion: DeviceInfo.getVersion(),
      buildNumber: DeviceInfo.getBuildNumber(),
    };
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
      device: this.device,
    };
  }
}

export { Context };
