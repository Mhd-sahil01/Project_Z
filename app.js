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


server.listen(app.get("port"), () => {
    console.log("listening to the port 8080");
});