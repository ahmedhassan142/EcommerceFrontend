"use client";
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { useAuth } from "./authContext";
import axios from "axios";

interface Userdetails {
  _id:string;
  firstName: string;
  lastName: string;
  email: string;
  name: string; 
  role:string// Combined first + last name
}

interface ProfileContextType {
updateUserDetails:Userdetails | null;
  userDetails: Userdetails | null;
  isLoading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const { isAuthenticated, token, logout } = useAuth();
  const [userDetails, setUserDetails] = useState<Userdetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserDetails = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setUserDetails(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(
        `${process.env.AUTH_SERVICE_URL}/api/auth/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Transform the response data to match UserDetails interface
      const userData = response.data;
      setUserDetails({
        _id: userData._id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        name: `${userData.firstName} ${userData.lastName}`,
        role:userData.role
      });
    } catch (err: any) {
      console.error("Profile fetch error:", err);
      setError(err.response?.data?.error || "Failed to load profile");
      setUserDetails(null);
      
      // Auto-logout if token is invalid
      if (err.response?.status === 401) {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, token, logout]);
  const updateUserDetails = (newDetails: Userdetails) => {

  setUserDetails(newDetails);
};

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  return (
    <ProfileContext.Provider value={{ 
      userDetails,
      updateUserDetails, 
      isLoading, 
      error,
      refreshProfile: fetchUserDetails 
    }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};