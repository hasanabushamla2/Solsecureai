import { io } from "socket.io-client";
const SERVER_URL = process.env.NEXT_PUBLIC_API_URL;
export const socket = io(SERVER_URL, {
  transports: ["polling", "websocket"],
  withCredentials: true,
});