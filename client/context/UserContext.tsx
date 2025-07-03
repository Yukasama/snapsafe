import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import {
  clearData,
  getDisplayName,
  getUsername,
  saveData,
} from "@/lib/user";

interface UserContextType {
  username: string | null;
  displayName: string | null;
  isLoading: boolean;
  signIn: (newUsername: string) => Promise<void>;
  signOut: () => void;
  setDisplayName: (newDisplayName: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);
  const [displayName, setDisplayNameState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const storedUser = await getUsername();
        const storedDisplayName = await getDisplayName();
        setUsername(storedUser);
        setDisplayNameState(storedDisplayName);
      } catch (e) {
        console.error("Failed to load user data:", e);
      } finally {
        setIsLoading(false);
      }
    };
    checkUser();
  }, []);

  const signIn = async (newUsername: string) => {
    await saveData(newUsername, displayName);
    setUsername(newUsername);
  };

  const setDisplayName = async (newDisplayName: string) => {
    await saveData(username, newDisplayName);
    setDisplayNameState(newDisplayName);
  };

  const signOut = async () => {
    await clearData();
    setUsername(null);
    setDisplayNameState(null);
  };

  return (
    <UserContext.Provider
      value={{
        username,
        displayName,
        isLoading,
        signIn,
        signOut,
        setDisplayName,
      }}
    >
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
