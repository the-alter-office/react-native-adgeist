export interface AdgeistContextType {
  isTestEnvironment: boolean;
  isInitialized: boolean;
  initializationError?: Error;
  setAdgeistConsentModal: (value: boolean) => void;
}

export interface AdgeistProviderProps {
  children: React.ReactNode;
  customBidRequestBackendDomain?: string;
  customPackageOrBundleID?: string;
  customAdgeistAppID?: string;
  isTestEnvironment?: boolean;
  onInitializationError?: (error: Error) => void;
  onInitializationSuccess?: () => void;
}
