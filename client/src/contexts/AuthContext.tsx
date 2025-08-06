import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";
import type { User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: "ngo" | "volunteer" | "admin") => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Check for existing token in localStorage
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log("🔑 Attempting login with:", { email, password: "***" });
      
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      console.log("📡 Response status:", response.status);
      console.log("📡 Response headers:", response.headers);

      if (!response.ok) {
        let errorMessage = `Login failed with status: ${response.status}`;
        try {
          const errorData = await response.json();
          console.log("❌ Error response data:", errorData);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (jsonError) {
          // If JSON parsing fails, use the default error message
          console.warn("⚠️ Failed to parse error response as JSON:", jsonError);
          // Try to get response as text for debugging
          try {
            const textResponse = await response.text();
            console.log("📄 Raw error response:", textResponse);
          } catch (textError) {
            console.warn("⚠️ Failed to get response as text:", textError);
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("✅ Login successful, received data:", data);
      
      setToken(data.token);
      setUser(data.user);
      
      // Store in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect based on role
      switch (data.user.role) {
        case "ngo":
          setLocation("/ngo-dashboard");
          break;
        case "volunteer":
          setLocation("/volunteer-dashboard");
          break;
        case "admin":
          setLocation("/admin-dashboard");
          break;
        default:
          setLocation("/dashboard");
      }
    } catch (error) {
      console.error("💥 Login error:", error);
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string, role: "ngo" | "volunteer" | "admin") => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (!response.ok) {
        let errorMessage = `Signup failed with status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (jsonError) {
          // If JSON parsing fails, use the default error message
          console.warn("Failed to parse error response as JSON:", jsonError);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setToken(data.token);
      setUser(data.user);
      
      // Store in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect based on role
      switch (data.user.role) {
        case "ngo":
          setLocation("/ngo-dashboard");
          break;
        case "volunteer":
          setLocation("/volunteer-dashboard");
          break;
        case "admin":
          setLocation("/admin-dashboard");
          break;
        default:
          setLocation("/dashboard");
      }
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  const logout = () => {
    console.log("🚪 Logout function called");
    console.log("📦 Current localStorage token:", localStorage.getItem("token"));
    console.log("👤 Current user:", user);
    
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    console.log("🧹 Auth state cleared, navigating to /login");
    setLocation("/login");
    console.log("✅ Logout completed");
  };

  const value = {
    user,
    token,
    login,
    signup,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}