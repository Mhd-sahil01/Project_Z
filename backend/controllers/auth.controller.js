import User from "../models/user.js";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose"; // Import mongoose
import { sendSuccess, sendValidationError, sendConflictError, sendUnauthorizedError, sendInternalServerError } from "../middleware/responseFormatter.js";

// In-memory user storage for development
let inMemoryUsers = [];

// Check if User model is available
const isUserModelAvailable = () => {
    try {
        // Check if User model exists and MongoDB is connected
        return User && typeof User.findOne === 'function' && mongoose.connection.readyState === 1;
    } catch (error) {
        console.log("User model not available:", error.message);
        return false;
    }
};

// register
export const register = async (req, res) => {
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);
    
    const { username, email, password } = req.body;

    // check required fields
    if (!username || !email || !password)
        return sendValidationError(res, "All fields are required");

    try {
        let user;
        
        // Check if User model is available (MongoDB connection)
        if (isUserModelAvailable()) {
            console.log("Using MongoDB for user registration");
            // Use MongoDB
            const existingUser = await User.findOne({ $or: [{ email }, { username }] });
            if (existingUser)
                return sendConflictError(res, "User already exists");
            
            const hashedPassword = await bcrypt.hash(password, 10);
            user = new User({ username, email, password: hashedPassword });
            await user.save();
        } else {
            console.log("Using in-memory storage for user registration");
            // Use in-memory storage
            const existingUser = inMemoryUsers.find(u => u.email === email || u.username === username);
            if (existingUser)
                return sendConflictError(res, "User already exists");
            
            const hashedPassword = await bcrypt.hash(password, 10);
            user = {
                _id: Date.now().toString(),
                username,
                email,
                password: hashedPassword
            };
            inMemoryUsers.push(user);
        }

        // JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });
        
        // Set secure cookie
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('token', token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/'
        });

        // Respond with user data
        return sendSuccess(res, "User registered successfully", {
            token, // Include token in response for localStorage
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        }, httpStatus.CREATED);
    } catch (error) {
        console.log("error in Register controller:", error);
        return sendInternalServerError(res, error.message || "Registration failed. Please try again.");
    }
};

// login
export const login = async (req, res) => {
    const { email, password } = req.body;
    // Check required fields
    if (!email || !password)
        return sendValidationError(res, "All fields are required");

    try {
        let user;
        
        // Find user by email
        if (isUserModelAvailable()) {
            console.log("Using MongoDB for user login");
            // Use MongoDB
            user = await User.findOne({ email });
        } else {
            console.log("Using in-memory storage for user login");
            // Use in-memory storage
            user = inMemoryUsers.find(u => u.email === email);
        }
        
        if (!user) return sendUnauthorizedError(res, "Invalid email or password");

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return sendUnauthorizedError(res, "Invalid email or password");

        // JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });
        
        // Set secure cookie
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('token', token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/'
        });

        // Respond with user data
        return sendSuccess(res, "Login successful", {
            token, // Include token in response for localStorage
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.log("error in login controller:", error);
        return sendInternalServerError(res, error.message || "Login failed. Please try again.");
    }
};

// logout
export const logout = (req, res) => {
    try {
        // Clear the cookie for logout
        const isProduction = process.env.NODE_ENV === 'production';
        res.clearCookie('token', {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            path: '/'
        });
        // Respond successfully
        return sendSuccess(res, "Logout successful");
    } catch (error) {
        console.log("error in logout controller");
        return sendInternalServerError(res, error.message);
    }
};