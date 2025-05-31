import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { socket, axios, authUser } = useContext(AuthContext);

  const getUsers = useCallback(async () => {
    if (!authUser?._id) return;

    try {
      setIsLoading(true);
      const { data } = await axios.get("/api/messages/users");

      if (data.success) {
        const filteredUsers = data.users.filter(
          (user) => user._id !== authUser._id
        );
        setUsers(filteredUsers);
        setUnseenMessages(data.unseenMessages || {});
      } else {
        throw new Error(data.message || "Failed to fetch users");
      }
    } catch (err) {
      console.error("GetUsers Error:", err);
      toast.error(err?.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  }, [authUser, axios]);

  const getMessages = useCallback(async () => {
    if (!selectedUser?._id) return;

    try {
      setIsLoading(true);
      const { data } = await axios.get(`/api/messages/${selectedUser._id}`);

      if (data.success) {
        setMessages(data.messages);

        setUnseenMessages((prev) => {
          if (prev[selectedUser._id]) {
            return { ...prev, [selectedUser._id]: 0 };
          }
          return prev;
        });
      } else {
        throw new Error(data.message || "Failed to fetch messages");
      }
    } catch (err) {
      console.error("GetMessages Error:", err);
      toast.error(err?.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedUser, axios]);

  const sendMessages = useCallback(async (newMessage) => {
    if (!selectedUser?._id) {
      toast.error("Please select a user to chat with");
      return false;
    }

    try {
      let content = {};
      
      // FIX: Use content object with text/image fields
      if (typeof newMessage === "string") {
        if (!newMessage.trim()) {
          toast.error("Message cannot be empty");
          return false;
        }
        content = { text: newMessage.trim() };
      } else if (newMessage.image) {
        content = { image: newMessage.image };
      } else {
        toast.error("Invalid message format");
        return false;
      }

      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        { content }  // Send as content object
      );

      if (data.success) {
        setMessages((prev) => [...prev, data.newMessage]);

        socket?.emit("sendMessage", {
          receiverId: selectedUser._id,
          message: data.newMessage,
        });

        return true;
      } else {
        throw new Error(data.message || "Failed to send message");
      }
    } catch (err) {
      console.error("SendMessage Error:", err);
      toast.error(err?.response?.data?.message || err.message);
      return false;
    }
  }, [selectedUser, axios, socket]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      if (selectedUser?._id === newMessage.senderId) {
        // Create a new object to avoid mutation
        const seenMessage = { ...newMessage, seen: true };
        setMessages((prev) => [...prev, seenMessage]);

        axios.put(`/api/messages/mark/${newMessage._id}`).catch((err) =>
          console.error("Mark message error:", err)
        );
      } else {
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1,
        }));
      }
    };

    const handleConnectError = (error) => {
      console.error("Socket error:", error);
      toast.error("Connection lost. Trying to reconnect...");
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("connect_error", handleConnectError);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("connect_error", handleConnectError);
    };
  }, [socket, selectedUser, axios]);

  useEffect(() => {
    if (authUser?._id) {
      getUsers();
    } else {
      setUsers([]);
      setMessages([]);
      setUnseenMessages({});
      setSelectedUser(null);
    }
  }, [authUser, getUsers]);

  const value = {
    messages,
    users,
    selectedUser,
    getUsers,
    getMessages,
    sendMessages,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
    isLoading,
  };

  return (
    <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
  );
};