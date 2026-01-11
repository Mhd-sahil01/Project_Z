import User from "";
// import httpStatus from "http-status";
import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";

export const login = (req, res) => {
    res.send("login page");
}

export const register = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    const existingUser1 = User.has({ email });
    const existingUser2 = User.has({ username });

        // check if the user already exist
    if(existingUser1 || existingUser2) {
        return res.status(409).json({ success: false, message: "User already exist!" });
    }

    // Hash the password
    const hashPassword = await bcrypt.hash(password, 10);
    User.set({ username, email, password: hashPassword });

    // create new user
    return res.status(201).json({ message: "User registered successfully!" }); 
}

export const logout = (req, res) => {
    res.send("logout page");
}