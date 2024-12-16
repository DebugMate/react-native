import Debugmate from './src/debugmate';
import { DebugmateProvider, useDebugmateContext } from './src/Providers/DebugmateProvider';
import { useDebugmateState } from './src/contexts/Debugmate';
import ErrorBoundary from './src/components/ErrorBoundary';

export { DebugmateProvider, useDebugmateContext, useDebugmateState, ErrorBoundary };
export default Debugmate;
