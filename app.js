import express from "express";
import { createServer } from "node:http";
import cors from "cors";


import connectToSocket from "./config/socket.js";
import meetingRoute from "./routes/meeting.route.js";
import authRoute from "./routes/auth.route.js";

const app = express();
const server = createServer(app);
const io = connectToSocket(server);
app.use(express.json());
app.use(cors({
    origin: "*",
    credentials: true
}));

app.set("port", (process.env.PORT || 8080));

app.get("/", (req, res) => {
    res.send("Hello, World!");
});

app.use("/api/meeting", meetingRoute);
app.use("/api/auth", authRoute);

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
});


server.listen(app.get("port"), () => {
    console.log("listening to the port 8080");
});