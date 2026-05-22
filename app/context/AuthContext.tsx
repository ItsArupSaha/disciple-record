"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged, signOut as fbSignOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase/client";
import { checkAndCreateAdminUser } from "../actions/userActions";

export interface UserProfile {
  uid: string;
  email: string | null;
  role: "SUPER_ADMIN" | "ADMIN" | "USER" | "PENDING";
  name?: string;
  initiatedName?: string;
  address?: {
    thana: string;
    district: string;
    division: string;
  };
  mobileNumber?: string;
  whatsappNumber?: string;
  bloodGroup?: string;
  joinedIskconDate?: string;
  initiatedYear?: string;
  spiritualMaster?: string;
  isApproved: boolean;
  profileImageURL?: string;

  // JSSS Excel Fields
  serialNo?: string | number;
  oldSerialNo?: string | number;
  presentAddress?: string;
  permanentAddress?: string;
  dob?: string;
  occupation?: string;
  harinamInitiation?: string;
  initiationPlace?: string;
  brahmanInitiation?: string;
  brahmanInitiationDate?: string;
  brahmanInitiationPlace?: string;
  department?: string;
  service?: string;
  counselorName?: string;
  gender?: string;
  maritalStatus?: string;
  sadhanaGrantha?: string;
  shelteredDate?: string;
  namahattaName?: string;
  isNamahattaConnected?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (currentUser: User) => {
    try {
      const docRef = doc(db, "users", currentUser.uid);
      let docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        const res = await checkAndCreateAdminUser(currentUser.uid, currentUser.email, currentUser.displayName);
        if (res && res.success && res.role) {
          docSnap = await getDoc(docRef);
        }
      }

      if (docSnap.exists()) {
        setUserProfile(docSnap.data() as UserProfile);
      } else {
        setUserProfile(null);
      }
    } catch (err) {
      console.error("Error fetching profile", err);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser);
        // We can set a cookie for server-side auth here if needed.
        const token = await currentUser.getIdToken();
        document.cookie = `fb_token=${token}; path=/;`;
      } else {
        setUserProfile(null);
        document.cookie = `fb_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    await fbSignOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
