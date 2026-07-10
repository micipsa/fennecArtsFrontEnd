/* eslint-disable react-refresh/only-export-components */
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
    let active = true;
    let newSocket = null;

    const initSocket = async () => {
      await Promise.resolve();
      if (!active) return;

      if (utilisateur) {
        let socketUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
        if (socketUrl.includes("localhost") && window.location.hostname !== "localhost") {
          socketUrl = socketUrl.replace("localhost", window.location.hostname);
        }
        
        newSocket = io(socketUrl, {
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });

        setSocket(newSocket);
      } else {
        setSocket(null);
      }
    };

    initSocket();

    return () => {
      active = false;
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [utilisateur]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

