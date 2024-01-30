import { io } from "socket.io-client";

// Lookup the variable VITE_DOMAIN in .env in the root folder
// This should point to the socket.io server
const URL = import.meta.env.VITE_DOMAIN || "http://localhost:3000"
const socket = io(URL, { autoConnect: false });

socket.onAny((event, ...args) => {
  console.log(event, args);
});

export default socket;
