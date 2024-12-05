import { useEffect, useMemo } from 'react';
import Debugmate from '../debugmate';

/**
 * Hook to manage and initialize the Debugmate instance with provided configuration.
 *
 * @param {string} domain - The domain to which errors will be sent.
 * @param {string} token - The authentication token for the Debugmate API.
 * @param {boolean} enabled - Flag to enable or disable error tracking.
 * @param {Object}  user - Optional user information to associate with error reports.
 * @param {Object}  environment - Optional environment metadata to provide additional context.
 *
 * @returns {Object} The initialized Debugmate instance.
 */
export const useDebugmateState = ({ domain, token, enabled, user, environment }) => {

  if (!domain || !token || typeof enabled !== 'boolean') {
    throw new Error('Required parameters (domain, token, enabled) were not provided correctly.');
  }

  const debugmate = useMemo(() => {
    return new Debugmate({
      domain,
      token,
      enabled,
    });
  }, [domain, token, enabled]);

  useEffect(() => {
    debugmate.setupGlobalErrorHandling();

    if (user) {
      debugmate.setUser(user);
    }

    if (environment) {
      debugmate.setEnvironment(environment);
    }

    return () => {
      debugmate.cleanupGlobalErrorHandling();
    };
  }, [debugmate, user, environment]);

  return debugmate;
};
