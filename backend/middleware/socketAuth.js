import jwt from 'jsonwebtoken';

// Socket authentication middleware
export const socketAuthMiddleware = (socket, next) => {
    try {
        // Get token from handshake or query
        const token = socket.handshake.auth.token || socket.handshake.query.token;
        
        if (!token) {
            return next(new Error('Authentication token required'));
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        
        // Attach user info to socket
        socket.userId = decoded.id;
        socket.authenticated = true;
        
        next();
    } catch (error) {
        console.error('Socket authentication error:', error.message);
        next(new Error('Invalid authentication token'));
    }
};

// Room access validation middleware
export const validateRoomAccess = (socket, next) => {
    const { meetingId, userId } = socket.handshake.query;
    
    if (!meetingId || !userId) {
        return next(new Error('Meeting ID and User ID are required'));
    }
    
    // Validate meeting ID format
    if (!/^[a-zA-Z0-9_-]+$/.test(meetingId)) {
        return next(new Error('Invalid meeting ID format'));
    }
    
    // Validate user ID format
    if (typeof userId !== 'string' || userId.length < 1 || userId.length > 50) {
        return next(new Error('Invalid user ID format'));
    }
    
    socket.meetingId = meetingId;
    socket.userId = userId;
    
    next();
};
