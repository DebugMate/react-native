import { Platform } from "react-native";

const setupGlobalErrorHandlers = (debugmate) => {
  if (Platform.OS === "web") {
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

    const handleUnhandledRejection = (event) => {
      const reason =
        event.reason instanceof Error ? event.reason : new Error(event.reason);
      debugmate.publish(reason);
    };

    window.onerror = handleGlobalError;
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
  } else {
    const handleGlobalError = (error, isFatal) => {
      debugmate.publish(error);
    };

    ErrorUtils.setGlobalHandler(handleGlobalError);
  }
};

export default setupGlobalErrorHandlers;
