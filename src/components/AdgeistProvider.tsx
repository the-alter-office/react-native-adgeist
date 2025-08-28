/**
 * @module AdgeistProvider
 * @description Context provider for Adgeist ad-serving configuration and initialization
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import Adgeist from '../NativeAdgeist';
import { ConsentModal } from './ConsentModal';

/**
 * Interface for Adgeist context
 */
interface AdgeistContextType {
  publisherId: string;
  apiKey: string;
  domain: string;
  isTestEnvironment: boolean;
  isInitialized: boolean;
  initializationError?: Error;
  setAdgeistConsentModal: (value: boolean) => void;
}

/**
 * Props for AdgeistProvider
 */
interface AdgeistProviderProps {
  children: React.ReactNode;
  /** Custom API origin for Adgeist SDK */
  customAdgeistApiOrigin?: string;
  /** Publisher identifier */
  publisherId: string;
  /** API key for authentication */
  apiKey: string;
  /** Domain for ad serving */
  domain: string;
  /** Enable test environment mode */
  isTestEnvironment?: boolean;
  /** Callback for initialization errors */
  onInitializationError?: (error: Error) => void;
  /** Callback for successful initialization */
  onInitializationSuccess?: () => void;
}

const AdgeistContext = createContext<AdgeistContextType>({
  publisherId: '',
  apiKey: '',
  domain: '',
  isTestEnvironment: true,
  isInitialized: false,
  setAdgeistConsentModal: () => {},
});

/**
 * AdgeistProvider component for managing ad-serving configuration
 * @param props - Component properties
 * @returns JSX.Element
 */
export const AdgeistProvider: React.FC<AdgeistProviderProps> = ({
  children,
  publisherId = '',
  apiKey = '',
  domain = '',
  customAdgeistApiOrigin = 'bg-services-qa-api.adgeist.ai',
  isTestEnvironment = true,
  onInitializationError,
  onInitializationSuccess,
}) => {
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [initializationError, setInitializationError] = useState<
    Error | undefined
  >();
  const [adgeistConsentModal, setAdgeistConsentModal] =
    useState<boolean>(false);

  /**
   * Initializes Adgeist SDK
   */
  const initializeAdgeist = useCallback(async () => {
    setInitializationError(undefined);
    setIsInitialized(false);

    try {
      await Adgeist.initializeSdk(customAdgeistApiOrigin);
      setIsInitialized(true);
      onInitializationSuccess?.();
    } catch (error: unknown) {
      const err =
        error instanceof Error ? error : new Error('Unknown error occurred');
      setInitializationError(err);
      setIsInitialized(false);
      onInitializationError?.(err);
    }
  }, [customAdgeistApiOrigin, onInitializationError, onInitializationSuccess]);

  useEffect(() => {
    initializeAdgeist();
  }, [initializeAdgeist]);

  return (
    <AdgeistContext.Provider
      value={{
        publisherId,
        apiKey,
        domain,
        isTestEnvironment,
        isInitialized,
        initializationError,
        setAdgeistConsentModal,
      }}
    >
      {initializationError && <>{children}</>}

      {isInitialized && (
        <>
          {adgeistConsentModal && <ConsentModal />}
          {children}
        </>
      )}
    </AdgeistContext.Provider>
  );
};

/**
 * Hook to access Adgeist context
 * @returns AdgeistContextType
 */
export const useAdgeistContext = () => {
  const context = useContext(AdgeistContext);
  if (!context) {
    throw new Error('useAdgeistContext must be used within an AdgeistProvider');
  }
  return context;
};
