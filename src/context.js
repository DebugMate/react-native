class Context {
  constructor() {
    this.error = null;
    this.request = null;
    this.user = null;
    this.environment = null;
    this.device = {
      deviceId: "unknown",
      systemName: "unknown",
      systemVersion: "unknown",
      appVersion: "unknown",
      buildNumber: "unknown",
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