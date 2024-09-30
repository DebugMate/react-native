declare module 'debugmate' {
    export default class Debugmate {
      constructor();
      setUser(user: any): void;
      setEnvironment(environment: any): void;
      setRequest(request: any): void;
      publish(error: Error, userContext?: any, environmentContext?: any): void;
      setupGlobalErrorHandling(): void;
      cleanupGlobalErrorHandling(): void;
    }
  }