"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export const USER_OPTIONS = ["Sara Meier", "Marco Keller"] as const;
export type UserOption = (typeof USER_OPTIONS)[number];

const USER_TO_SLUG: Record<UserOption, string> = {
  "Sara Meier": "sara_meier",
  "Marco Keller": "marco_keller",
};

export function userToSlug(user: UserOption): string {
  return USER_TO_SLUG[user];
}

type UserContextValue = {
  currentUser: UserOption;
  userSlug: string;
  setCurrentUser: (user: UserOption) => void;
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserOption>("Sara Meier");
  const userSlug = userToSlug(currentUser);

  const setUser = useCallback((user: UserOption) => {
    setCurrentUser(user);
  }, []);

  return (
    <UserContext.Provider value={{ currentUser, userSlug, setCurrentUser: setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
