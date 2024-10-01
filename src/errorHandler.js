const setupGlobalErrorHandlers = (debugmate) => {
  const handleGlobalError = (error, isFatal) => {
    console.error("Global Error Captured:", { error, isFatal });
    debugmate.publish(error);
  };

  ErrorUtils.setGlobalHandler(handleGlobalError);

  return {
    cleanupErrorHandlers: () => {
      ErrorUtils.setGlobalHandler(null);
    },
  };
};

export default setupGlobalErrorHandlers;