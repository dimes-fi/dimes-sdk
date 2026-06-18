import { createContext, useContext, type ReactNode } from "react";
import type { DimesClient } from "../client/dimes-client";
import { DimesError } from "../errors/dimes-error";

// eslint-disable-next-line @typescript-eslint/naming-convention
const DimesContext = createContext<DimesClient | null>(null);

export interface DimesProviderProps {
  client: DimesClient;
  children: ReactNode;
}

// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/explicit-function-return-type
export function DimesProvider({ client, children }: DimesProviderProps) {
  return <DimesContext.Provider value={client}>{children}</DimesContext.Provider>;
}

export function useDimesClient(): DimesClient {
  const client = useContext(DimesContext);
  if (!client) {
    throw new DimesError("missing_provider", "useDimesClient must be used within a <DimesProvider>");
  }
  return client;
}
