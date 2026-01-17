import express from "express";
import { createServer } from "node:http";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import connectToSocket from "./config/socket.js";

import meetingRoute from "./routes/meeting.route.js";
import authRoute from "./routes/auth.route.js";

/* ===============================
   ENV & DATABASE (FIRST)
================================ */
dotenv.config();
connectDB();

/* ===============================
   APP & SERVER
================================ */
const app = express();
const server = createServer(app);

/* ===============================
   MIDDLEWARE
================================ */
app.use(express.json());
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

/* ===============================
   ROUTES
================================ */
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use("/api/meeting", meetingRoute);
app.use("/api/auth", authRoute);

/* ===============================
   SOCKET.IO
================================ */
const io = connectToSocket(server);

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("join-meeting", ({ meetingId, userId }) => {
    socket.join(meetingId);
    socket.to(meetingId).emit("user-joined", userId);
  });

  socket.on("leave-meeting", ({ meetingId, userId }) => {
    socket.leave(meetingId);
    socket.to(meetingId).emit("user-left", userId);
  });

  socket.on("end-meeting", ({ meetingId }) => {
    io.to(meetingId).emit("meeting-ended");
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
  });
});

/* ===============================
   START SERVER (LAST)
================================ */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
