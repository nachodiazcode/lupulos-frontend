"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";

import useAuth from "@/hooks/useAuth";
import { API_BASE_URL, api } from "@/lib/api";

interface RealtimeContextValue {
  /** Live socket.io connection (null when logged out / not yet connected). */
  socket: Socket | null;
  isConnected: boolean;
  /** Unread direct/group messages for the navbar badge. */
  unreadMessages: number;
  /** Re-fetch the unread count from the API (source of truth). */
  refreshUnread: () => void;
  /** Optimistically clear the badge (e.g. when opening the messages view). */
  resetUnread: () => void;
  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;
}

const RealtimeContext = createContext<RealtimeContextValue>({
  socket: null,
  isConnected: false,
  unreadMessages: 0,
  refreshUnread: () => {},
  resetUnread: () => {},
  joinChat: () => {},
  leaveChat: () => {},
});

export const useRealtime = () => useContext(RealtimeContext);

export const RealtimeProvider = ({ children }: { children: ReactNode }) => {
  const { token, isAuthReady } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const refreshUnread = useCallback(async () => {
    try {
      const res = await api.get("/chat/unread-count");
      setUnreadMessages(res.data?.data?.unreadMessages ?? 0);
    } catch {
      /* badge is best-effort; ignore transient failures */
    }
  }, []);

  const resetUnread = useCallback(() => setUnreadMessages(0), []);

  useEffect(() => {
    // Logged out (or not ready) → tear down any existing connection.
    if (!isAuthReady || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
        setUnreadMessages(0);
      }
      return;
    }

    const s = io(API_BASE_URL || undefined, {
      auth: { token },
      transports: ["websocket", "polling"],
      withCredentials: true,
    });
    socketRef.current = s;
    setSocket(s);

    s.on("connect", () => {
      setIsConnected(true);
      refreshUnread();
    });
    s.on("disconnect", () => setIsConnected(false));
    s.on("chat:inbox:update", () => refreshUnread());

    return () => {
      s.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    };
  }, [token, isAuthReady, refreshUnread]);

  const joinChat = useCallback((chatId: string) => {
    socketRef.current?.emit("chat:join", chatId);
  }, []);

  const leaveChat = useCallback((chatId: string) => {
    socketRef.current?.emit("chat:leave", chatId);
  }, []);

  return (
    <RealtimeContext.Provider
      value={{
        socket,
        isConnected,
        unreadMessages,
        refreshUnread,
        resetUnread,
        joinChat,
        leaveChat,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
};
