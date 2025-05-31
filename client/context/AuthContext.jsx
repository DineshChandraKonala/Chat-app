import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUser, setOnlineUser] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check user is authenticated
  const checkAuth = async () => {
    try {
      if (!token) {
        setIsLoading(false);
        navigate("/login");
        return;
      }

      const { data } = await axios.get("/api/auth/check");
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      } else {
        logout();
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  // Login handler
  const login = async (state, credentials) => {
    try {
      const url = `${backendUrl}/api/auth/${state}`;
      const { data } = await axios.post(url, credentials);

      if (data.success && data.userData) {
        setAuthUser(data.userData);
        connectSocket(data.userData);

        const bearerToken = `Bearer ${data.token}`;
        axios.defaults.headers.common["Authorization"] = bearerToken;

        setToken(data.token);
        localStorage.setItem("token", data.token);
        toast.success(data.message);
        navigate("/");
        return true;
      } else {
        toast.error(data.message || "Login failed");
        return false;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
      return false;
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUser([]);
    delete axios.defaults.headers.common["Authorization"];
    socket?.disconnect();
    navigate("/login");
  };

  // Update profile handler
  const updateProfile = async (body) => {
    try {
      const url = `${backendUrl}/api/auth/update-profile`;
      const { data } = await axios.put(url, body);

      if (data.success) {
        setAuthUser(data.user);
        toast.success("Profile updated successfully");
        return true;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
      return false;
    }
  };

  // Connect socket.io
  const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;
    const newSocket = io(backendUrl, {
      query: {
        userId: userData._id,
      },
    });
    newSocket.connect();
    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (userIds) => {
      setOnlineUser(userIds);
    });
  };

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    checkAuth();

    return () => {
      socket?.disconnect();
    };
  }, []);

  if (isLoading) {
    return <div>Loading...</div>; // You can replace this with a proper loading component
  }

  const value = {
    axios,
    authUser,
    onlineUser,
    socket,
    login,
    logout,
    updateProfile,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};