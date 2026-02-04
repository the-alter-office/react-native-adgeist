export interface AdgeistContextType {
  isTestEnvironment: boolean;
  isInitialized: boolean;
  initializationError?: Error;
  setAdgeistConsentModal: (value: boolean) => void;
}

export interface AdgeistProviderProps {
  children: React.ReactNode;
  customBidRequestBackendDomain?: string | null;
  customPackageOrBundleID?: string | null;
  customAdgeistAppID?: string | null;
  isTestEnvironment?: boolean;
  onInitializationError?: (error: Error) => void;
  onInitializationSuccess?: () => void;
}
