import React, { createContext, useContext, useEffect, useState } from 'react';
import Adgeist from '../NativeAdgeist';
import { ConsentModal } from './ConsentModal';

interface AdgeistContextType {
  publisherId: string;
  apiKey: string;
  domain: string;
  isTestEnvironment: boolean;
  isInitialized: boolean;
  setAdgeistConsentModal: (value: boolean) => void;
}

interface AdgeistProviderPropsType {
  children: React.ReactNode;
  customAdgeistApiOrigin?: string;
  publisherId: string;
  apiKey: string;
  domain: string;
  isTestEnvironment: boolean;
}

const AdgeistContext = createContext<AdgeistContextType>({
  publisherId: '',
  apiKey: '',
  domain: '',
  isTestEnvironment: true,
  isInitialized: false,
  setAdgeistConsentModal: () => {},
});

export const AdgeistProvider: React.FC<AdgeistProviderPropsType> = ({
  children,
  publisherId = '',
  apiKey = '',
  domain = '',
  customAdgeistApiOrigin = 'bg-services-qa-api.adgeist.ai',
  isTestEnvironment = true,
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [adgeistConsentModal, setAdgeistConsentModal] = useState(false);
  const [isKotlinInitializationFailed, setIsKotlinInitializationFailed] =
    useState(false);

  useEffect(() => {
    const initializeAdgeist = async () => {
      setIsKotlinInitializationFailed(false);
      setIsInitialized(false);

      try {
        await Adgeist.initializeSdk(customAdgeistApiOrigin);
        setIsInitialized(true);
      } catch {
        setIsKotlinInitializationFailed(true);
        setIsInitialized(false);
      }
    };

    initializeAdgeist();
  }, [customAdgeistApiOrigin]);

  return (
    <AdgeistContext.Provider
      value={{
        publisherId,
        apiKey,
        domain,
        isTestEnvironment,
        isInitialized,
        setAdgeistConsentModal,
      }}
    >
      {isKotlinInitializationFailed && <>{children}</>}

      {isInitialized && (
        <>
          {adgeistConsentModal && <ConsentModal />}
          {children}
        </>
      )}
    </AdgeistContext.Provider>
  );
};

export const useAdgeistContext = () => useContext(AdgeistContext);
