import React, { createContext, useContext } from 'react';
import { useDebugmateState } from '../contexts/Debugmate';
import ErrorBoundary from '../components/ErrorBoundary';

/**
 * DebugmateContext provides access to the Debugmate state throughout the component tree.
 * This context is intended to be used by components that need access to error reporting or state
 * related to the Debugmate service.
 *
 * @type {React.Context<DebugmateState | null>}
 */
export const DebugmateContext = createContext(null);

/**
 * Custom hook that returns the current Debugmate context value.
 *
 * @returns {DebugmateState} The current Debugmate context value, which holds state related to Debugmate.
 */
export const useDebugmateContext = () => useContext(DebugmateContext);

/**
 * DebugmateProvider is a React component that wraps its children with the Debugmate context and
 * an ErrorBoundary for global error handling. It manages the Debugmate state and provides
 * it to the component tree.
 *
 * @param {object} props - The properties passed to this component.
 * @param {React.ReactNode} props.children - The child components to render within the provider.
 * @param {string} props.domain - The domain for Debugmate error reporting.
 * @param {string} props.token - The token used for authentication with Debugmate.
 * @param {boolean} props.enabled - Flag to enable or disable Debugmate error handling.
 * @param {Object}  props.user - Optional user information to associate with error reports.
 * @param {Object}  props.environment - Optional environment metadata to provide additional context.
 * @param {Object}  props.request
 * 
 * @returns {JSX.Element} - The rendered provider and its children, wrapped in an ErrorBoundary.
 */
export const DebugmateProvider = ({ children, domain, token, enabled, user, environment, request}) => {
  const debugmate = useDebugmateState({ domain, token, enabled, user, environment, request });

  return (
    <DebugmateContext.Provider value={debugmate}>
      <ErrorBoundary 
        domain={domain}
        token={token} 
        enabled={enabled} 
        user={user} 
        environment={environment} 
        request={request}
      >
        {children}
      </ErrorBoundary>
    </DebugmateContext.Provider>
  );
};
