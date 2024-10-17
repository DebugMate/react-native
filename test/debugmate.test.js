import Debugmate from "../src/debugmate";
import { Context } from "../src/context";

jest.mock("../src/context");

describe("Debugmate class", () => {
  let debugmate;
  let mockFetch;

  beforeEach(() => {
    Debugmate.instance = null;

    Context.mockClear();

    Context.prototype.payload = jest.fn().mockReturnValue({
      user: { id: 1, name: "John Doe" },
      request: { url: "http://localhost", method: "GET" },
      environment: [],
      context: {
        systemName: "iOS",
        systemVersion: "14.4",
        deviceName: "iPhone 12",
      },
    });

    mockFetch = jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ success: true }),
    });

    debugmate = new Debugmate({
      domain: "http://localhost",
      token: "test-token",
      enabled: true,
    });
  });

  afterEach(() => {
    mockFetch.mockRestore();
  });

  test("should create an instance with correct properties", () => {
    expect(debugmate.domain).toBe("http://localhost");
    expect(debugmate.token).toBe("test-token");
    expect(debugmate.enabled).toBe(true);
  });

  test("should use singleton pattern", () => {
    const secondInstance = new Debugmate();
    expect(secondInstance).toBe(debugmate);
  });

  test("should set user information", () => {
    const user = { id: 1, name: "John Doe" };
    debugmate.setUser(user);
    expect(debugmate.context.setUser).toHaveBeenCalledWith(user);
  });

  test("should set environment information", () => {
    const environment = {
      environment: "development",
      debug: true,
      timezone: "UTC",
      server: "nginx",
      database: "mysql",
      npm: "6.14.8",
    };
    debugmate.setEnvironment(environment);
    expect(debugmate.context.setEnvironment).toHaveBeenCalledWith(environment);
  });

  test("should set request information", () => {
    const request = {
      request: {
        url: "http://localhost",
        method: "GET",
      },
      headers: {},
      query_string: {},
      body: null,
    };
    debugmate.setRequest(request);
    expect(debugmate.context.setRequest).toHaveBeenCalledWith(request);
  });

  test("should not publish error if disabled or missing data", () => {
    debugmate.enabled = false;
    debugmate.publish(new Error("Test error"));
    expect(debugmate.context.setError).not.toHaveBeenCalled();
  });

  test("should publish error with valid data", async () => {
    const error = new Error("Test error");

    await debugmate.publish(error);

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost/api/capture",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "X-DEBUGMATE-TOKEN": "test-token",
          "Content-Type": "application/json",
        }),
        body: expect.any(String),
      })
    );
  });

  test("should not publish if error is missing", () => {
    debugmate.publish(null);
    expect(debugmate.context.setError).not.toHaveBeenCalled();
  });

  test("should not publish if environment is not valid", () => {
    Debugmate.instance = null;

    const invalidDebugmate = new Debugmate({
      domain: "",
      token: "",
      enabled: true,
    });

    const error = new Error("Test error");

    invalidDebugmate.publish(error);

    expect(mockFetch).not.toHaveBeenCalled();
  });
});
