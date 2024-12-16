import React, { Component } from 'react';
import Debugmate from '../debugmate';

/**
 * ErrorBoundary is a React component that catches JavaScript errors in its child component tree,
 * logs them to an external service, and displays a fallback UI.
 *
 * It uses the Debugmate service to report the errors.
 *
 * @component
 * @example
 * // Example usage:
 * <ErrorBoundary domain="your-domain" token="your-token" enabled={true}>
 *   <YourComponent />
 * </ErrorBoundary>
 */
class ErrorBoundary extends Component {
    /**
     * Creates an instance of the ErrorBoundary component.
     *
     * @param {object} props - The properties passed to this component.
     * @param {string} props.domain - The domain for Debugmate error reporting.
     * @param {string} props.token - The token used to authenticate with Debugmate.
     * @param {boolean} props.enabled - Flag to enable or disable the Debugmate service.
     * @param {Object}  props.user - Optional user information to associate with error reports.
     * @param {Object}  props.environment - Optional environment metadata to provide additional context.
     * @param {Object}  props.request
     */
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };

        const { domain, token, enabled, user, environment, request } = props;

        this.debugmate = new Debugmate({
            domain,
            token,
            enabled
        });

        if (user) {
            this.debugmate.setUser(user);
        }
      
        if (environment) {
            this.debugmate.setEnvironment(environment);
        }
      
        if (request) {
            this.debugmate.setRequest(request);
        }

        this.debugmate.setupGlobalErrorHandling();
    }

    /**
     * This lifecycle method is invoked when an error is thrown in a child component.
     * It updates the state to reflect the error.
     *
     * @param {Error} error - The error that was thrown.
     * @returns {object} - The updated state with the error information.
     */
    static getDerivedStateFromError(error) {
        return { hasError: true, error: error };
    }

    /**
     * This lifecycle method is invoked after an error has been thrown.
     * It allows the error details to be logged and published to Debugmate.
     *
     * @param {Error} error - The error that was thrown.
     * @param {object} errorInfo - The additional error information such as the component stack.
     */
    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
        console.error("Error info:", errorInfo);

        this.debugmate.publish(error);
    }

    /**
     * Renders the component. If an error has been caught, a fallback UI is shown.
     *
     * @returns {JSX.Element} - The rendered component or fallback UI.
     */
    render() {
        if (this.state.hasError) {
            return <h1>Something went wrong: {this.state.error?.message}</h1>;
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
