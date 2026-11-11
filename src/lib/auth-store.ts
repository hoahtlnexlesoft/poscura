import { useEffect, useState } from "react";

type User = {
  email: string;
  firstName: string;
  lastName: string;
  initials: string;
  plan: "Freemium" | "Premium";
};

const KEY = "poscura.auth";

function read(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}

export function signIn(email: string) {
  const user: User = {
    email,
    firstName: "Sam",
    lastName: "Miller",
    initials: "SM",
    plan: "Freemium",
  };
  localStorage.setItem(KEY, JSON.stringify(user));
  emit();
  return user;
}

export function signOut() {
  localStorage.removeItem(KEY);
  emit();
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    setUser(read());
    const fn = () => setUser(read());
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);
  return user;
}
