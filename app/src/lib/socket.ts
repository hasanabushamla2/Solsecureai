import { io } from "socket.io-client";

export const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
  autoConnect: false,
  transports: ["websocket", "polling"],
  auth: async (callback) => {
    try {
      const response = await fetch("/api/auth/me?socketTicket=1", {
        credentials: "same-origin",
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("Socket authentication failed");
      }
      const data = await response.json();

      callback({ ticket: data.socketTicket });
    } catch (error) {
      console.error(error);
      callback({ ticket: "" });
    }
  },
});
