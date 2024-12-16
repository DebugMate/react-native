import Debugmate from './src/debugmate';
import { ReactNode } from 'react';

export interface DebugmateProviderProps {
  children: ReactNode;
  domain: string;
  token: string;
  enabled: boolean;
}

export const useDebugmateContext: () => DebugmateState;

export interface DebugmateState {
  domain: string;
  token: string;
  enabled: boolean;
  setUser: (user: User ) => void;
  setEnvironment: (env: Environment) => void;
  setRequest: (request: Request) => void;
  publish: (error: Error, userContext?: User|object, environmentContext?: Environment|object, requestContext?: Request|object) => void;
}

export interface User {
  id?: number;
  name?: string;
  email?: string;
}

export interface Environment {
  environment?: string;
  debug?: boolean;
  timezone?: string;
  server?: string;
  database?: string;
  npm?: string;
}

export interface Request {
  request?: object;
  headers?: object;
  query_string?: object;
  body?: string;
}

export const ErrorBoundary: React.ComponentType<{ domain: string; token: string; enabled: boolean }>;

export { DebugmateProvider, useDebugmateContext, useDebugmateState, ErrorBoundary };
export default Debugmate;
