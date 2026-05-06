import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import useAuth from "../hooks/useAuth";

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { utilisateur } = useAuth();

  useEffect(() => {
    // Ne se connecter que si l'utilisateur est authentifié
    if (utilisateur) {
      // Remplacer l'URL par l'URL du backend en production (process.env.VITE_API_URL)
      const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
      
      const newSocket = io(socketUrl, {
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      setSocket(newSocket);

      // Cleanup on unmount or logout
      return () => {
        newSocket.disconnect();
      };
    } else if (socket) {
      // Déconnecter si logout
      socket.disconnect();
      setSocket(null);
    }
  }, [utilisateur]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
