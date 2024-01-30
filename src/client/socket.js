import { io } from "socket.io-client";

const URL = process.env.DOMAIN || "http://localhost:3000"
const socket = io(URL, { autoConnect: false });

socket.onAny((event, ...args) => {
  console.log(event, args);
});

export default socket;
