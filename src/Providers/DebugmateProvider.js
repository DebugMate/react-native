import React, { createContext, useContext } from 'react';
import { useDebugmateState } from '../contexts/Debugmate';

/**
 * Context to store the Debugmate instance.
 * @type {React.Context}
 */
export const DebugmateContext = createContext(null);

/**
 * Hook to access the Debugmate instance from the context.
 * @returns {Object} The Debugmate instance.
 */
export const useDebugmateContext = () => useContext(DebugmateContext);

/**
 * Provider for Debugmate. This component wraps your application and makes Debugmate available in the context.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The child components that will have access to the context.
 * @param {string} props.domain - The domain to which errors will be sent.
 * @param {string} props.token - The authentication token for the Debugmate API.
 * @param {boolean} props.enabled - Flag to enable or disable error tracking.
 *
 * @returns {JSX.Element} The provider configured with Debugmate.
 */
export const DebugmateProvider = ({ children, domain, token, enabled }) => {
  const debugmate = useDebugmateState({ domain, token, enabled });

  return (
    <DebugmateContext.Provider value={debugmate}>
      {children}
    </DebugmateContext.Provider>
  );
};