import { Platform } from "react-native";

/**
 * Set up global error handling to capture uncaught exceptions and unhandled promise rejections.
 * This function integrates with the global error handling mechanism of the environment (web or native).
 *
 * @param {Object} debugmate - An instance of the Debugmate class used to publish errors.
 * @returns {void}
 */
const setupGlobalErrorHandlers = (debugmate) => {
  if (Platform.OS === "web") {
    /**
     * Handles global JavaScript errors on web.
     *
     * @param {string} message - Error message.
     * @param {string} source - Source file where the error occurred.
     * @param {number} lineNumber - Line number of the error.
     * @param {number} colNumber - Column number of the error.
     * @param {Error} error - Error object, if available.
     * @returns {void}
     */
    const handleGlobalError = (
      message,
      source,
      lineNumber,
      colNumber,
      error
    ) => {
      if (!error) {
        error = new Error(message);
        error.fileName = source;
        error.lineNumber = lineNumber;
        error.columnNumber = colNumber;
      }

      debugmate.publish(error);
    };

    /**
     * Handles unhandled promise rejections on web.
     *
     * @param {PromiseRejectionEvent} event - Event representing an unhandled promise rejection.
     * @returns {void}
     */
    const handleUnhandledRejection = (event) => {
      const reason =
        event.reason instanceof Error ? event.reason : new Error(event.reason);
      debugmate.publish(reason);
    };

    window.onerror = handleGlobalError;
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
  } else {
    /**
     * Handles global JavaScript errors on React Native.
     *
     * @param {Error} error - The error object that was thrown.
     * @param {boolean} isFatal - Indicates whether the error is fatal.
     * @returns {void}
     */
    const handleGlobalError = (error, isFatal) => {
      debugmate.publish(error);
    };

    ErrorUtils.setGlobalHandler(handleGlobalError);
  }
};

export default setupGlobalErrorHandlers;
