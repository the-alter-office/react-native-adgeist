import React, { createContext, useContext } from 'react';

interface AdgeistContextType {
  publisherId: string;
  apiKey: string;
  domain: string;
  isTestEnvironment: boolean;
}

interface AdgeistProviderPropsType {
  children: React.ReactNode;
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
});

export const AdgeistProvider: React.FC<AdgeistProviderPropsType> = ({
  children,
  publisherId = '',
  apiKey = '',
  domain = '',
  isTestEnvironment = true,
}) => {
  return (
    <AdgeistContext.Provider
      value={{ publisherId, apiKey, domain, isTestEnvironment }}
    >
      {children}
    </AdgeistContext.Provider>
  );
};

export const useAdgeistContext = () => useContext(AdgeistContext);
