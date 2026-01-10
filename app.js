import express from "express";
import { createServer } from "node:http";


import connectToSocket from "./config/socket.js";

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

app.use("/api/meeting", require("./routes/meetingRoutes"));


server.listen(app.get("port"), () => {
    console.log("listening to the port 8080");
});