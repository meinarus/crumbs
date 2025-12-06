"use client";

import { createContext, useContext } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  businessName?: string;
  image?: string | null;
};

type SessionContextType = {
  user: User;
};

const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User;
}) {
  return (
    <SessionContext.Provider value={{ user }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
