import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '../api/client';

type FlagMap = Record<string, boolean>;

interface FeatureFlagContextValue {
  flags: FlagMap;
  isEnabled: (flag: string) => boolean;
  isLoading: boolean;
}

const FeatureFlagContext = createContext<FeatureFlagContextValue>({
  flags: {},
  isEnabled: () => false,
  isLoading: true,
});

/**
 * Fetches feature flags from GET /api/flags on mount and makes them
 * available to the entire React tree.
 *
 * This is the only place in the client that knows about the flags API.
 * If you swap to a paid provider on the backend, only the server changes —
 * this context remains untouched.
 */
export function FeatureFlagProvider({ children }: { children: ReactNode }) {
  const [flags, setFlags] = useState<FlagMap>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.flags
      .getAll()
      .then(setFlags)
      .catch(() => console.warn('[flags] Could not load feature flags'))
      .finally(() => setIsLoading(false));
  }, []);

  const isEnabled = (flag: string) => flags[flag] === true;

  return (
    <FeatureFlagContext.Provider value={{ flags, isEnabled, isLoading }}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function useFeatureFlagContext() {
  return useContext(FeatureFlagContext);
}
