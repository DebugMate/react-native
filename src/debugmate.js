import Context from "./context.js";
import { parse } from "./stackTraceParser.js";
import setupGlobalErrorHandlers from "./errorHandler";

/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} name
 * @property {string} email
 */

/**
 * @typedef {Object} Environment
 * @property {string} environment
 * @property {boolean} debug
 * @property {string} timezone
 * @property {string} server
 * @property {string} database
 * @property {string} npm
 */

/**
 * @typedef {Object} Request
 * @property {Object} request
 * @property {Object} headers
 * @property {Object} query_string
 * @property {string} body
 */

class Debugmate {
  static instance = null;

  /**
   * Create a new Debugmate instance or return the existing one.
   * @param {Object} options - Options for configuration
   * @param {string} options.domain - The domain for the Debugmate API
   * @param {string} options.token - The API token for Debugmate
   * @param {boolean} [options.enabled=true] - Whether the Debugmate error tracking is enabled
   */
  constructor(options = {}) {
    if (!Debugmate.instance) {
      this.domain = options.domain;
      this.token = options.token;
      this.enabled = options.enabled !== undefined ? options.enabled : true;
      this.context = new Context();

      Debugmate.instance = this;
    }

    return Debugmate.instance;
  }

  /**
   * Set the current user information (id, name, email).
   * @param {User} user - User object with id, name, and email.
   * @returns {void}
   */
  setUser(user) {
    this.context.setUser(user);
  }

  /**
   * Set the current environment information (environment, debug, timezone, server, database, npm).
   * @param {Environment} environment - Environment object with various environment details.
   * @returns {void}
   */
  setEnvironment(environment) {
    this.context.setEnvironment(environment);
  }

  /**
   * Set the current request information (request, headers, query_string, body).
   * @param {Request} request - Request object containing request details.
   * @returns {void}
   */
  setRequest(request) {
    this.context.setRequest(request);
  }

  /**
   * Publish an error to the Debugmate API.
   * @param {Error} error - The error to be reported.
   * @param {User|null} [userContext=null] - The user context, if available.
   * @param {Environment|null} [environmentContext=null] - The environment context, if available.
   * @param {Request|null} [requestContext=null] - The request context, if available.
   * @returns {void}
   */
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

  /**
   * Check if publishing errors is allowed based on the presence of the error, domain, and token.
   * Logs a warning if the error cannot be published.
   * @param {Error} error - The error to be checked.
   * @returns {boolean} - True if publishing is allowed, false otherwise.
   */
  isPublishingAllowed(error) {
    if (!error || !this.enabled || !this.domain || !this.token) {
      console.warn(
        "Error not published to Debugmate. Check environment variables or the error."
      );
      return false;
    }
    return true;
  }

  /**
   * Handle the API response after attempting to publish an error.
   * Logs any errors related to the response.
   * @param {Response} response - The response from the Debugmate API.
   * @returns {Promise<void>}
   */
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

  /**
   * Construct a payload object with error details and context information for the API.
   * @param {Error} error - The error to be reported.
   * @returns {Object} - The payload object formatted for the Debugmate API.
   */
  payload(error) {
    const trace = this.trace(error);
    let data = {
      exception: error.name,
      message: error.message,
      file: trace[0]?.file || "unknown",
      type: "cli",
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

  /**
   * Parse the error stack trace to extract relevant information.
   * This uses the `stackTraceParser` to extract the file, line, column, and function details.
   * @param {Error} error - The error object to parse.
   * @returns {Array<Object>} - The array of trace information.
   */
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

  /**
   * Set up global error handling to capture uncaught exceptions and promise rejections.
   * @returns {void}
   */
  setupGlobalErrorHandling() {
    setupGlobalErrorHandlers(this);
  }

  /**
    * Clean up global error handling by removing the error handlers previously set up.
    * This function should be called when the error handling setup is no longer needed.
    * @returns {void}
    */
  cleanupGlobalErrorHandling() {
    if (this.errorHandlers) {
        this.errorHandlers.cleanupErrorHandlers();
    }
}
}

export default Debugmate;
