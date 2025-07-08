import React, { createContext, useContext, useEffect, useState } from 'react';
import Adgeist from '../NativeAdgeist';

interface AdgeistContextType {
  publisherId: string;
  apiKey: string;
  domain: string;
  isTestEnvironment: boolean;
  isInitialized: boolean;
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

  useEffect(() => {
    const initializeAdgeist = async () => {
      try {
        await Adgeist.initializeSdk(customAdgeistApiOrigin);
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing Adgeist SDK:', error);
        setIsInitialized(false);
      }
    };

    initializeAdgeist();
  }, [customAdgeistApiOrigin]);

  return (
    <AdgeistContext.Provider
      value={{ publisherId, apiKey, domain, isTestEnvironment, isInitialized }}
    >
      {children}
    </AdgeistContext.Provider>
  );
};

export const useAdgeistContext = () => useContext(AdgeistContext);
