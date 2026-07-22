export interface AdgeistContextType {
  isInitialized: boolean;
  initializationError?: Error;
  setAdgeistConsentModal: (value: boolean) => void;
}

export interface AdgeistProviderProps {
  children: React.ReactNode;
  customBidRequestBackendDomain?: string | null;
  customPackageOrBundleID?: string | null;
  customAdgeistAppID?: string | null;
  onInitializationError?: (error: Error) => void;
  onInitializationSuccess?: () => void;
}
