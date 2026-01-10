import { Server } from "socket.io"

const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL,
            credentials: true
        }
    });
    return io;
}

export default connectToSocket;