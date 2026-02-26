import express from "express";
import { createServer } from "node:http";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db.js";
import connectToSocket from "./config/socket.js";
import meetingRoute from "./routes/meeting.route.js";
import authRoute from "./routes/auth.route.js";
import roomRoute from "./routes/roomRoutes.js";
import { validateMeetingData, validateChatMessage } from "./middleware/validation.js";
import { socketAuthMiddleware, validateRoomAccess } from "./middleware/socketAuth.js";

const app = express();
const server = createServer(app);

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);

// Routes
app.get("/", (req, res) => {
  res.send("Hello, World!");
});
app.use("/api/meeting", meetingRoute);
app.use("/api/auth", authRoute);
app.use("/api/rooms", roomRoute);

// Connect to Database
connectDB();

// Socket.io 
const io = connectToSocket(server);

// Apply authentication middleware to all socket connections
io.use(socketAuthMiddleware);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id, "User:", socket.userId);

  socket.on("join-meeting", (data) => {
    try {
      const { meetingId, userId } = data;
      
      // Validate input
      if (!meetingId || !userId) {
        socket.emit("error", { message: "Meeting ID and User ID are required" });
        return;
      }
      
      if (!/^[a-zA-Z0-9_-]+$/.test(meetingId)) {
        socket.emit("error", { message: "Invalid meeting ID format" });
        return;
      }
      
      if (typeof userId !== 'string' || userId.length < 1 || userId.length > 50) {
        socket.emit("error", { message: "Invalid user ID format" });
        return;
      }
      
      socket.join(meetingId);
      console.log(`${userId} joined meeting ${meetingId}`);
      
      // Notify others in the room
      socket.to(meetingId).emit("participant-joined", {
        roomName: meetingId,
        participant: {
          identity: userId,
          sid: socket.id
        }
      });
      
      socket.emit("joined-meeting", { meetingId, userId });
    } catch (error) {
      console.error("Error in join-meeting:", error);
      socket.emit("error", { message: "Failed to join meeting" });
    }
  });

  socket.on("leave-meeting", (data) => {
    try {
      const { meetingId, userId } = data;
      
      if (!meetingId || !userId) {
        socket.emit("error", { message: "Meeting ID and User ID are required" });
        return;
      }
      
      socket.leave(meetingId);
      console.log(`${userId} left meeting ${meetingId}`);
    } catch (error) {
      console.error("Error in leave-meeting:", error);
      socket.emit("error", { message: "Failed to leave meeting" });
    }
  });

  socket.on("chat-message", (data) => {
    try {
      const { roomName, message, sender, timestamp } = data;
      
      // Validate chat message
      if (!roomName || !message || !sender) {
        socket.emit("error", { message: "Room name, message, and sender are required" });
        return;
      }
      
      if (typeof message !== 'string' || message.length > 1000) {
        socket.emit("error", { message: "Invalid message format or length" });
        return;
      }
      
      if (typeof sender !== 'string' || sender.length > 50) {
        socket.emit("error", { message: "Invalid sender format or length" });
        return;
      }
      
      io.to(roomName).emit("chat-message", { roomName, message, sender, timestamp: timestamp || Date.now() });
      console.log(`Chat message in ${roomName}: ${sender}: ${message}`);
    } catch (error) {
      console.error("Error in chat-message:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  socket.on("video-stream", (data) => {
    try {
      const { roomName, participantName, hasVideo } = data;
      
      if (!roomName || !participantName || typeof hasVideo !== 'boolean') {
        socket.emit("error", { message: "Invalid video stream data" });
        return;
      }
      
      socket.to(roomName).emit("video-stream", { participantName, hasVideo });
      console.log(`Video stream in ${roomName}: ${participantName} has video: ${hasVideo}`);
    } catch (error) {
      console.error("Error in video-stream:", error);
      socket.emit("error", { message: "Failed to update video stream" });
    }
  });

  socket.on("camera-toggle", (data) => {
    try {
      const { roomName, participantName, isCameraOff } = data;
      
      if (!roomName || !participantName || typeof isCameraOff !== 'boolean') {
        socket.emit("error", { message: "Invalid camera toggle data" });
        return;
      }
      
      socket.to(roomName).emit("camera-toggle", { participantName, isCameraOff });
      console.log(`Camera toggle in ${roomName}: ${participantName} camera off: ${isCameraOff}`);
    } catch (error) {
      console.error("Error in camera-toggle:", error);
      socket.emit("error", { message: "Failed to toggle camera" });
    }
  });

  // WebRTC signaling with validation
  socket.on("offer", (data) => {
    try {
      const { to, offer } = data;
      
      if (!to || !offer) {
        socket.emit("error", { message: "Target socket ID and offer are required" });
        return;
      }
      
      if (typeof to !== 'string' || typeof offer !== 'object') {
        socket.emit("error", { message: "Invalid offer data format" });
        return;
      }
      
      socket.to(to).emit("offer", { from: socket.id, offer });
      console.log(`Relaying offer from ${socket.id} to ${to}`);
    } catch (error) {
      console.error("Error in offer:", error);
      socket.emit("error", { message: "Failed to process offer" });
    }
  });

  socket.on("answer", (data) => {
    try {
      const { to, answer } = data;
      
      if (!to || !answer) {
        socket.emit("error", { message: "Target socket ID and answer are required" });
        return;
      }
      
      if (typeof to !== 'string' || typeof answer !== 'object') {
        socket.emit("error", { message: "Invalid answer data format" });
        return;
      }
      
      socket.to(to).emit("answer", { from: socket.id, answer });
      console.log(`Relaying answer from ${socket.id} to ${to}`);
    } catch (error) {
      console.error("Error in answer:", error);
      socket.emit("error", { message: "Failed to process answer" });
    }
  });

  socket.on("ice-candidate", (data) => {
    try {
      const { to, candidate } = data;
      
      if (!to || !candidate) {
        socket.emit("error", { message: "Target socket ID and candidate are required" });
        return;
      }
      
      if (typeof to !== 'string' || typeof candidate !== 'object') {
        socket.emit("error", { message: "Invalid ICE candidate data format" });
        return;
      }
      
      socket.to(to).emit("ice-candidate", { from: socket.id, candidate });
      console.log(`Relaying ICE candidate from ${socket.id} to ${to}`);
    } catch (error) {
      console.error("Error in ice-candidate:", error);
      socket.emit("error", { message: "Failed to process ICE candidate" });
    }
  });

  socket.on("end-meeting", (data) => {
    try {
      const { meetingId } = data;
      
      if (!meetingId) {
        socket.emit("error", { message: "Meeting ID is required" });
        return;
      }
      
      if (!/^[a-zA-Z0-9_-]+$/.test(meetingId)) {
        socket.emit("error", { message: "Invalid meeting ID format" });
        return;
      }
      
      io.to(meetingId).emit("meeting-ended", { meetingId });
      console.log(`Meeting ${meetingId} ended`);
    } catch (error) {
      console.error("Error in end-meeting:", error);
      socket.emit("error", { message: "Failed to end meeting" });
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id, "User:", socket.userId);
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});