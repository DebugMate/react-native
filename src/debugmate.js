import { parse } from "./stackTraceParser.js";
import setupGlobalErrorHandlers from "./errorHandler";
import { Context } from "./context.js";
import DeviceInfo from "react-native-device-info";

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
  constructor() {
    this.domain = "testing"; // Ajuste conforme necessário.
    this.token = "testing"; // Adapte a lógica de configuração conforme necessário.
    this.enabled = true; // Ajuste para controlar se o envio está habilitado.

    this.context = new Context();
  }

  /**
   * Set the current user information (id, name, email).
   * @param {User} user
   * @returns {void}
   */
  setUser(user) {
    this.context.setUser(user);
  }

  /**
   * Set the current environment information (environment, debug, timezone, server, database, npm).
   * @param {Environment} environment
   * @returns {void}
   */
  setEnvironment(environment) {
    this.context.setEnvironment(environment);
  }

  /**
   * Set the current request information (request, headers, query_string, body).
   * @param {Request} request
   * @returns {void}
   */
  setRequest(request) {
    this.context.setRequest(request);
  }

  /**
   * Publish an error to the external Debugmate API.
   * @param {Error} error
   * @param {User|null} userContext
   * @param {Environment|null} environmentContext
   * @returns {void}
   */
  publish(error, userContext = null, environmentContext = null) {
    if (!this.isPublishingAllowed(error)) return;

    if (userContext) {
      this.setUser(userContext);
    }

    if (environmentContext) {
      this.setEnvironment(environmentContext);
    }

    const requestPayload = this.context.appRequest();
    const data = this.payload(error, requestPayload);

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
   * Check if the error publishing is allowed based on the presence of error object, domain, and token.
   * Logs a warning and returns false if publishing is not allowed.
   * @param {Error} error
   * @returns {boolean}
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
   * Logs any response errors or failed error reports.
   * @param {Response} response
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
   * Set up global error handling to capture uncaught exceptions and promise rejections.
   * This function integrates with the global error handling mechanism of the environment.
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

  /**
   * Construct a payload object containing error details and context information for the API.
   * This payload is formatted according to the requirements of the Debugmate API.
   * @param {Error} error
   * @param {Request} request
   * @returns {Object}
   */
  payload(error, request) {
    const trace = this.trace(error);

    let data = {
      exception: error.name,
      message: error.message,
      file: trace[0]?.file || "unknown",
      type: "mobile", // Ajuste para indicar que é um erro mobile.
      trace: trace,
      ...this.context.payload(),
    };

    return data;
  }

  /**
   * Parse the error stack trace to extract relevant information.
   * This function uses the `stackTraceParser` module to extract the file, line, column, and function details
   * from the error stack.
   * @param {Error} error
   * @returns {Array<Object>}
   */
  trace(error) {
    const stackTrace = parse(error); // Adaptar o parser conforme necessário.
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
}

export default Debugmate;
