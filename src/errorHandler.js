const setupGlobalErrorHandlers = (debugmate) => {
  const handleGlobalError = (error, isFatal) => {
    // Enviar erro para o debugmate ou API externa
    console.error("Global Error Captured:", { error, isFatal });
    debugmate.publish(error);
  };

  // Define o manipulador global de erros para erros JavaScript não capturados.
  ErrorUtils.setGlobalHandler(handleGlobalError);

  return {
    cleanupErrorHandlers: () => {
      ErrorUtils.setGlobalHandler(null);
    },
  };
};

export default setupGlobalErrorHandlers;
