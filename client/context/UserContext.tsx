import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { clearUsername, getUsername, saveUsername } from "@/lib/user";

interface UserContextType {
  username: string | null;
  isLoading: boolean;
  signIn: (newUsername: string) => Promise<void>;
  signOut: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const storedUser = await getUsername();
      setUsername(storedUser);
      setIsLoading(false);
    };
    checkUser();
  }, []);

  const signIn = async (newUsername: string) => {
    await saveUsername(newUsername);
    setUsername(newUsername);
  };

  const signOut = async () => {
    await clearUsername();
    setUsername(null);
  };

  return (
    <UserContext.Provider value={{ username, isLoading, signIn, signOut }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}