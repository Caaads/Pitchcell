import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot 
} from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType } from "./firebase";
import { UserProfile } from "./types";
import firebaseConfig from "../firebase-applet-config.json";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  dailyUsageCount: number;
  isPlayground: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  incrementUsage: () => Promise<void>;
  togglePremium: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to get local date string YYYY-MM-DD
export function getLocalDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [dailyUsageCount, setDailyUsageCount] = useState(0);
  
  // Set initial playground state immediately based on project configuration to prevent double rendering/waiting cycles
  const isPlaygroundInit = firebaseConfig.apiKey === "mock-api-key-pitchcell" || firebaseConfig.projectId === "pitchcell-mock";
  const [isPlayground, setIsPlayground] = useState(isPlaygroundInit);

  // Listen to Auth state changes
  useEffect(() => {
    // If we've detected playground mode, handle authentication via local storage
    if (isPlayground) {
      const savedUser = localStorage.getItem("pitchcell_mock_user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        
        // Load mock profile
        const savedProfile = localStorage.getItem(`pitchcell_profile_${parsed.uid}`);
        if (savedProfile) {
          setProfile(JSON.parse(savedProfile));
        } else {
          const freshProfile: UserProfile = {
            uid: parsed.uid,
            email: parsed.email || "playground@pitchcell.ai",
            isPremium: false,
            createdAt: new Date().toISOString(),
          };
          localStorage.setItem(`pitchcell_profile_${parsed.uid}`, JSON.stringify(freshProfile));
          setProfile(freshProfile);
        }

        // Load mock daily usage
        const dateStr = getLocalDateString();
        const usageKey = `pitchcell_usage_${parsed.uid}_${dateStr}`;
        const count = parseInt(localStorage.getItem(usageKey) || "0", 10);
        setDailyUsageCount(count);
      } else {
        setUser(null);
        setProfile(null);
        setDailyUsageCount(0);
      }
      setLoading(false);
      return;
    }

    let unsubscribeUsage: (() => void) | null = null;

    // Real Firebase listener
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // Set current user immediately
      setUser(currentUser);
      
      if (currentUser) {
        const uid = currentUser.uid;
        
        // Optimistic default profile to prevent UX block while Firestore fetches
        const optimisticProfile: UserProfile = {
          uid,
          email: currentUser.email || "",
          isPremium: false,
          createdAt: new Date().toISOString(),
        };
        setProfile(optimisticProfile);

        // Resolve loading immediately to make firebase validation fast
        setLoading(false);

        // Run network query asynchronously in the background
        const userDocRef = doc(db, "users", uid);
        try {
          const docSnap = await getDoc(userDocRef);
          let currentProfile: UserProfile;

          if (docSnap.exists()) {
            currentProfile = docSnap.data() as UserProfile;
            setProfile(currentProfile);
          } else {
            currentProfile = optimisticProfile;
            await setDoc(userDocRef, currentProfile);
            setProfile(currentProfile);
          }

          // Unsubscribe from any previous usage snapshot to prevent memory leak
          if (unsubscribeUsage) {
            unsubscribeUsage();
          }

          // Fetch usage using live real-time listener
          const dateStr = getLocalDateString();
          const usageDocRef = doc(db, "users", uid, "dailyUsage", dateStr);
          
          unsubscribeUsage = onSnapshot(usageDocRef, (snap) => {
            if (snap.exists()) {
              setDailyUsageCount(snap.data().count || 0);
            } else {
              setDailyUsageCount(0);
            }
          }, (err) => {
            console.warn("Usage snapshot failed:", err);
          });

        } catch (error) {
          console.error("Firebase profile loading error, fallback to playground mode:", error);
          setIsPlayground(true);
        }
      } else {
        setProfile(null);
        setDailyUsageCount(0);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubscribeUsage) {
        unsubscribeUsage();
      }
    };
  }, [isPlayground]);

  // Handle Google Login
  const loginWithGoogle = async () => {
    if (isPlayground) {
      const mockUid = "mock-google-" + Math.floor(Math.random() * 100000);
      const mockUser = {
        uid: mockUid,
        email: "innovator@pitchcell.ai",
        displayName: "Startup Founder",
        photoURL: ""
      } as any;
      localStorage.setItem("pitchcell_mock_user", JSON.stringify(mockUser));
      setUser(mockUser);
      setIsPlayground(true); // stay in playground mode for mock triggers
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, "auth/google");
    }
  };

  // Handle Email Login
  const loginWithEmail = async (email: string, pass: string) => {
    if (isPlayground) {
      const mockUid = "mock-email-" + btoa(email).slice(0, 8);
      const mockUser = {
        uid: mockUid,
        email: email,
        displayName: email.split("@")[0],
        photoURL: ""
      } as any;
      localStorage.setItem("pitchcell_mock_user", JSON.stringify(mockUser));
      setUser(mockUser);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, "auth/login");
    }
  };

  // Handle Email Sign Up
  const signupWithEmail = async (email: string, pass: string) => {
    if (isPlayground) {
      const mockUid = "mock-email-" + btoa(email).slice(0, 8);
      const mockUser = {
        uid: mockUid,
        email: email,
        displayName: email.split("@")[0],
        photoURL: ""
      } as any;
      localStorage.setItem("pitchcell_mock_user", JSON.stringify(mockUser));
      setUser(mockUser);
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "auth/signup");
    }
  };

  // Sign out
  const logout = async () => {
    if (isPlayground) {
      localStorage.removeItem("pitchcell_mock_user");
      setUser(null);
      setProfile(null);
      setDailyUsageCount(0);
      return;
    }

    try {
      await signOut(auth);
    } catch (error) {
      console.error("Signout error:", error);
    }
  };

  // Increment Usage
  const incrementUsage = async () => {
    if (!user) return;
    const dateStr = getLocalDateString();

    if (isPlayground) {
      const usageKey = `pitchcell_usage_${user.uid}_${dateStr}`;
      const newCount = dailyUsageCount + 1;
      localStorage.setItem(usageKey, String(newCount));
      setDailyUsageCount(newCount);
      return;
    }

    const usageDocRef = doc(db, "users", user.uid, "dailyUsage", dateStr);
    try {
      const docSnap = await getDoc(usageDocRef);
      if (docSnap.exists()) {
        const currentCount = docSnap.data().count || 0;
        await updateDoc(usageDocRef, { count: currentCount + 1 });
      } else {
        await setDoc(usageDocRef, {
          userId: user.uid,
          date: dateStr,
          count: 1
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/dailyUsage/${dateStr}`);
    }
  };

  // Upgrade or toggle Premium
  const togglePremium = async () => {
    if (!user || !profile) return;
    const nextPremium = !profile.isPremium;

    if (isPlayground) {
      const updatedProfile = { ...profile, isPremium: nextPremium };
      localStorage.setItem(`pitchcell_profile_${user.uid}`, JSON.stringify(updatedProfile));
      setProfile(updatedProfile);
      return;
    }

    const userDocRef = doc(db, "users", user.uid);
    try {
      await updateDoc(userDocRef, { isPremium: nextPremium });
      setProfile(prev => prev ? { ...prev, isPremium: nextPremium } : null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        dailyUsageCount,
        isPlayground,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        logout,
        incrementUsage,
        togglePremium,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
};
