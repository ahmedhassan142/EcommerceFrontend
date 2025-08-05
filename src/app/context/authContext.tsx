"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';

interface UserType {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  isLoading: boolean;
  user: UserType | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const checkAuth = async (): Promise<boolean> => {
  setIsLoading(true);
  try {
    const token = Cookies.get("authToken");
    if (!token) {
      // Clear any residual state if no token exists
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      return false;
    }

    const response = await axios.get(`${process.env.AUTH_SERVICE_URL}/api/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.valid) {
      setToken(token);
      setUser(response.data.user);
      setIsAuthenticated(true);
      return true;
    } else {
      // Clear invalid token
      Cookies.remove("authToken");
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      return false;
    }
  } catch (error) {
    // Clear state on error
    Cookies.remove("authToken");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    return false;
  } finally {
    setIsLoading(false);
  }
};
  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(config => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      config.withCredentials = true;
      return config;
    });

    const responseInterceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [token]);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${process.env.AUTH_SERVICE_URL}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );
      
      const { token, user } = response.data;
      Cookies.set("authToken", token, { expires: 7 });
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      setToken(token);
      setIsAuthenticated(true);
       localStorage.removeItem('sessionId'); 
      
      return { success: true, message: "Login successful!" };
    } catch (error: any) {
      setIsAuthenticated(false);
      setToken(null);
      Cookies.remove("authToken");
      localStorage.removeItem("user");
      
      const message = error.response?.data?.message || "Invalid email or password";
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${process.env.AUTH_SERVICE_URL}/api/auth/register`,
        userData,
        { withCredentials: true }
      );
      
      const { token, user } = response.data;
      Cookies.set("authToken", token, { expires: 7 });
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      setToken(token);
      setIsAuthenticated(true);
      
      return { success: true, message: "Registration successful!" };
    } catch (error: any) {
      const message = error.response?.data?.message || "Registration failed";
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await axios.post(
        `${process.env.AUTH_SERVICE_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Logout failed");
      console.error('Logout failed:', error);
    } finally {
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      Cookies.remove("authToken");
      localStorage.removeItem("user");
      router.push('/login');
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      token, 
      isLoading,
      user,
      login, 
      logout, 
      checkAuth,
      register
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};