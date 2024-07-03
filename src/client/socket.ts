import { io } from "socket.io-client";

// Lookup the variable VITE_DOMAIN in .env in the root folder
// This should point to the socket.io server
// as backup check process env
// then a default
const URL = import.meta.env.VITE_DOMAIN || "http://localhost:3000"
console.log(`Location of the socket io server: ${URL}`)
const socket = io(URL, { autoConnect: false });

socket.onAny((event, ...args) => {
  console.log(event, args);
});

export default socket;
