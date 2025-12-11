import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import Adgeist from '../specs/NativeAdgeist';
import { ConsentModal } from '../components/deprecated/ConsentModal';
import type {
  AdgeistContextType,
  AdgeistProviderProps,
} from '../types/Provider';

const AdgeistContext = createContext<AdgeistContextType>({
  isTestEnvironment: false,
  isInitialized: false,
  setAdgeistConsentModal: () => {},
});

export const AdgeistProvider: React.FC<AdgeistProviderProps> = ({
  children,
  customBidRequestBackendDomain = 'beta.v2.bg-services.adgeist.ai',
  customPackageOrBundleID = '',
  customAdgeistAppID = '',
  isTestEnvironment = false,
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
      await Adgeist.destroySdk();

      await Adgeist.initializeSdk(
        customBidRequestBackendDomain,
        customPackageOrBundleID,
        customAdgeistAppID
      );

      setIsInitialized(true);
      onInitializationSuccess?.();
    } catch (error: unknown) {
      const err =
        error instanceof Error ? error : new Error('Unknown error occurred');
      setInitializationError(err);
      setIsInitialized(false);
      onInitializationError?.(err);
    }
  }, [
    customBidRequestBackendDomain,
    onInitializationError,
    onInitializationSuccess,
    customPackageOrBundleID,
    customAdgeistAppID,
  ]);

  useEffect(() => {
    initializeAdgeist();
  }, [initializeAdgeist]);

  return (
    <AdgeistContext.Provider
      value={{
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
