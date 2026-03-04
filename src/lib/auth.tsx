import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";

export interface AuthUser {
  email: string;
  name: string;
  provider: "password" | "google";
}

interface LoginPayload {
  email: string;
  password: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  loginWithGoogle: () => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mapFirebaseUser() {
  const currentUser = firebaseAuth.currentUser;

  if (!currentUser || !currentUser.email) {
    return null;
  }

  const providerId = currentUser.providerData[0]?.providerId;

  return {
    email: currentUser.email,
    name: currentUser.displayName || currentUser.email.split("@")[0] || "ShopCOD User",
    provider: providerId === "google.com" ? "google" : "password",
  } satisfies AuthUser;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    setPersistence(firebaseAuth, browserLocalPersistence).catch(() => null);

    const unsubscribe = onAuthStateChanged(firebaseAuth, () => {
      if (!isMounted) {
        return;
      }

      setUser(mapFirebaseUser());
      setIsReady(true);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const login = async ({ email, password }: LoginPayload) => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      throw new Error("Debes completar correo y contrasena.");
    }

    try {
      await signInWithEmailAndPassword(firebaseAuth, trimmedEmail, trimmedPassword);
    } catch (error) {
      const authError = error as { code?: string };

      if (
        authError.code === "auth/invalid-credential" ||
        authError.code === "auth/user-not-found" ||
        authError.code === "auth/wrong-password"
      ) {
        await createUserWithEmailAndPassword(firebaseAuth, trimmedEmail, trimmedPassword);
      } else {
        throw error;
      }
    }

    const nextUser = mapFirebaseUser();

    if (!nextUser) {
      throw new Error("No se pudo validar tu sesion.");
    }

    setUser(nextUser);
    return nextUser;
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    await signInWithPopup(firebaseAuth, provider);

    const nextUser = mapFirebaseUser();

    if (!nextUser) {
      throw new Error("No se pudo validar tu sesion con Google.");
    }

    setUser(nextUser);
    return nextUser;
  };

  const logout = async () => {
    await signOut(firebaseAuth);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isReady,
        login,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}
