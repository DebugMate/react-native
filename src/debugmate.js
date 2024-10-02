import { Context } from "./context.js";
import { parse } from "./stackTraceParser.js";
import setupGlobalErrorHandlers from "./errorHandler";

class Debugmate {
  constructor() {
    this.domain = "";
    this.token = "";
    this.enabled = true;
    this.context = new Context();
  }

  setUser(user) {
    this.context.setUser(user);
  }

  setEnvironment(environment) {
    this.context.setEnvironment(environment);
  }

  setRequest(request) {
    this.context.setRequest(request);
  }

  publish(
    error,
    userContext = null,
    environmentContext = null,
    requestContext = null
  ) {
    if (!this.isPublishingAllowed(error)) return;

    if (userContext) {
      this.setUser(userContext);
    }

    if (environmentContext) {
      this.setEnvironment(environmentContext);
    }

    if (requestContext) {
      this.setRequest(requestContext);
    }

    const data = this.payload(error);

    fetch(`${this.domain}/api/capture`, {
      method: "POST",
      headers: {
        "X-DEBUGMATE-TOKEN": this.token,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    })
      .then(this.handleResponse)
      .catch((err) => console.error("Debugmate error:", err));
  }

  isPublishingAllowed(error) {
    if (!error || !this.enabled || !this.domain || !this.token) {
      console.warn(
        "Error not published to Debugmate. Check environment variables or the error."
      );
      return false;
    }
    return true;
  }

  async handleResponse(response) {
    if (!response.ok) {
      throw new Error(`Request error: ${response.status}`);
    }

    const text = await response.text();
    if (!text) {
      console.log("Debugmate: Empty response received, assuming success.");
      return;
    }
    try {
      const data = JSON.parse(text);
      if (!data.success) {
        console.error("Failed to report error:", data);
      }
    } catch (e) {
      console.error("Error parsing response:", e);
    }
  }

  payload(error) {
    const trace = this.trace(error);
    let data = {
      exception: error.name,
      message: error.message,
      file: trace[0]?.file || "unknown",
      type: "web",
      trace: trace,
    };

    const contextPayload = this.context.payload();

    if (contextPayload.user) {
      data.user = contextPayload.user;
    }

    if (contextPayload.request) {
      data.request = contextPayload.request;
    }

    if (contextPayload.environment) {
      data.environment = contextPayload.environment;
    }

    if (contextPayload.context) {
      data.context = contextPayload.context;
    }

    return data;
  }

  trace(error) {
    const stackTrace = parse(error);
    if (!stackTrace.sources || stackTrace.sources.length === 0) {
      return [];
    }

    return stackTrace.sources.map((source) => ({
      file: source.file,
      line: source.line,
      column: source.column,
      function: source.function,
      class: source.file,
      preview: stackTrace.stack.split("\n"),
    }));
  }

  setupGlobalErrorHandling() {
    setupGlobalErrorHandlers(this);
  }
}

export default Debugmate;
