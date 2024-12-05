import ErrorBoundary from './src/components/ErrorBoundary';
import Debugmate from './src/debugmate';
import { DebugmateProvider, useDebugmateContext } from './src/Providers/DebugmateProvider';
import { useDebugmateState } from './src/contexts/Debugmate';

export default Debugmate;
export { ErrorBoundary, DebugmateProvider, useDebugmateContext, useDebugmateState };