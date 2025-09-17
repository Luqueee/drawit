"use client";

import { envs } from "@/env";
import { useSession } from "next-auth/react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const canvasContext = createContext<
  | {
      ws: Socket | null;
      users: number;
    }
  | undefined
>(undefined);

export const CanvasProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { data: session } = useSession();
  const wsRef = useRef<Socket | null>(null);
  const [usersCont, setUsersCount] = useState(0);
  useEffect(() => {
    if (!session?.accessToken) return;

    const ws = io(`${envs.API_URL}/rplace`, {
      auth: { token: `Bearer ${session?.accessToken}` },
    });

    wsRef.current = ws;

    ws.on("sockets:users", (data: { users: number }) => {
      console.log("Users connected:", data.users);
      setUsersCount(data.users);
    });
  }, [session?.accessToken]);

  return (
    <canvasContext.Provider value={{ ws: wsRef.current, users: usersCont }}>
      {children}
    </canvasContext.Provider>
  );
};

export const useCanvasProvider = () => {
  const context = useContext(canvasContext);
  if (context === undefined) {
    throw new Error("useCanvasProvider must be used within a CanvasProvider");
  }
  return context;
};
