const { Context } = require("../src/context");
const DeviceInfo = require("react-native-device-info");
const Constants = require("expo-constants");

jest.mock("react-native-device-info", () => ({
  getSystemName: jest.fn().mockReturnValue("iOS"),
  getSystemVersion: jest.fn().mockReturnValue("14.4"),
  getDeviceName: jest.fn().mockResolvedValue("iPhone 12"),
}));

jest.mock("expo-constants", () => ({
  default: {
    platform: { ios: true },
    systemVersion: "14.4",
    deviceName: "iPhone 12",
    appOwnership: "expo",
  },
}));

describe("Context class", () => {
  let context;

  beforeEach(() => {
    context = new Context();
  });

  test("should initialize with default values", () => {
    expect(context.error).toBe(null);
    expect(context.request).toBe(null);
    expect(context.user).toBe(null);
    expect(context.environment).toEqual([]);
    expect(context.context).toEqual({
      systemName: "iOS",
      systemVersion: "14.4",
      deviceName: "iPhone 12",
      appOwnership: "expo",
    });
  });

  test("should set error", () => {
    const error = new Error("Test error");
    context.setError(error);
    expect(context.error).toBe(error);
  });

  test("should set request", () => {
    const request = { url: "http://localhost", method: "GET" };
    context.setRequest(request);
    expect(context.request).toBe(request);
  });

  test("should set user", () => {
    const user = { id: 1, name: "John Doe" };
    context.setUser(user);
    expect(context.user).toBe(user);
  });

  test("should set environment", () => {
    const environment = {
      jsVersion: "1.0.0",
      environment: "development",
      debug: true,
      timezone: "UTC",
      server: "nginx",
      database: "mysql",
      npmVersion: "6.14.8",
      browser: "Chrome",
    };
    context.setEnvironment(environment);

    expect(context.environment).toEqual([
      {
        group: "JavaScript",
        variables: { version: "1.0.0" },
      },
      {
        group: "App",
        variables: {
          environment: "development",
          debug: true,
          timezone: "UTC",
        },
      },
      {
        group: "System",
        variables: {
          os: "ios",
          server: "nginx",
          database: "mysql",
          npm: "6.14.8",
          browser: "Chrome",
        },
      },
    ]);
  });

  test("should build payload correctly", () => {
    const error = new Error("Test error");
    const request = { url: "http://localhost", method: "GET" };
    const user = { id: 1, name: "John Doe" };
    const environment = {
      jsVersion: "1.0.0",
      environment: "development",
      debug: true,
      timezone: "UTC",
      server: "nginx",
      database: "mysql",
      npmVersion: "6.14.8",
      browser: "Chrome",
    };

    context.setError(error);
    context.setRequest(request);
    context.setUser(user);
    context.setEnvironment(environment);

    const payload = context.payload();
    expect(payload).toEqual({
      error: error,
      request: request,
      user: user,
      environment: context.environment,
      context: {
        systemName: "iOS",
        systemVersion: "14.4",
        deviceName: "iPhone 12",
        appOwnership: "expo",
      },
    });
  });
});
