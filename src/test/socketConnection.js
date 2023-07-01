const { io } = require("socket.io-client");

// WebSocket URL
const socketUrl = 'ws://localhost:3000/';

// Authorization header
const authorizationHeader = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNjg4MjQ4OTc3LCJleHAiOjE2ODgyNDk4Nzd9.L7cMuPxdLuosqmcsCPWSUdamT5t0LiacDfF4i3ienTA";

// Create WebSocket connection
const socket = new io(socketUrl, {
  auth: {
    token: authorizationHeader
  }
});

socket.on("plaid-initialize", (arg) => {
  console.log(arg);
})

// client-side
socket.on("connect", () => {
  console.log(socket.id); // x8WIv7-mJelg7on_ALbx
});

socket.on("disconnect", () => {
  console.log(socket.id); // undefined
});
