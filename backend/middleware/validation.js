import { sendSuccess } from "../middleware/responseFormatter.js";

// Input validation middleware
export const validateRegistration = (req, res, next) => {
    const { username, email, password } = req.body;
    const errors = [];

    // Username validation
    if (!username) {
        errors.push('Username is required');
    } else if (typeof username !== 'string') {
        errors.push('Username must be a string');
    } else if (username.length < 3 || username.length > 30) {
        errors.push('Username must be between 3 and 30 characters');
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        errors.push('Username can only contain letters, numbers, and underscores');
    }

    // Email validation
    if (!email) {
        errors.push('Email is required');
    } else if (typeof email !== 'string') {
        errors.push('Email must be a string');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Invalid email format');
    }

    // Password validation
    if (!password) {
        errors.push('Password is required');
    } else if (typeof password !== 'string') {
        errors.push('Password must be a string');
    } else if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

export const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];

    // Email validation
    if (!email) {
        errors.push('Email is required');
    } else if (typeof email !== 'string') {
        errors.push('Email must be a string');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Invalid email format');
    }

    // Password validation
    if (!password) {
        errors.push('Password is required');
    } else if (typeof password !== 'string') {
        errors.push('Password must be a string');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

export const validateMeetingData = (req, res, next) => {
    const { meetingId, userId } = req.body;
    const errors = [];

    // Meeting ID validation
    if (!meetingId) {
        errors.push('Meeting ID is required');
    } else if (typeof meetingId !== 'string') {
        errors.push('Meeting ID must be a string');
    } else if (meetingId.length < 3 || meetingId.length > 50) {
        errors.push('Meeting ID must be between 3 and 50 characters');
    } else if (!/^[a-zA-Z0-9_-]+$/.test(meetingId)) {
        errors.push('Meeting ID can only contain letters, numbers, hyphens, and underscores');
    }

    // User ID validation
    if (!userId) {
        errors.push('User ID is required');
    } else if (typeof userId !== 'string') {
        errors.push('User ID must be a string');
    } else if (userId.length < 1 || userId.length > 50) {
        errors.push('User ID must be between 1 and 50 characters');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

export const validateChatMessage = (req, res, next) => {
    const { roomName, message, sender } = req.body;
    const errors = [];

    // Room name validation
    if (!roomName) {
        errors.push('Room name is required');
    } else if (typeof roomName !== 'string') {
        errors.push('Room name must be a string');
    }

    // Message validation
    if (!message) {
        errors.push('Message is required');
    } else if (typeof message !== 'string') {
        errors.push('Message must be a string');
    } else if (message.length > 1000) {
        errors.push('Message cannot exceed 1000 characters');
    }

    // Sender validation
    if (!sender) {
        errors.push('Sender is required');
    } else if (typeof sender !== 'string') {
        errors.push('Sender must be a string');
    } else if (sender.length > 50) {
        errors.push('Sender name cannot exceed 50 characters');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};
