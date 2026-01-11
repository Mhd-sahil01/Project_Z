import User from "../store/userStore.js";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";

export const login = async (req, res) => {
    const { email, password } = req.body;
    // check for blank options
    if (!email || !password) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "All fields are required!" })
    }

    // check if the email is valid
    const user =  User.has({ email });
    if (!user) {
        return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid email or password" });
    }

    // check if the password is valid
    const isMatch = await bcrypt.compare(password, User.get(password));
    if (!isMatch) {
        return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid email or password" });
    }

    return res.status(httpStatus.OK).json({ message: "Login successful" });

}

export const register = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    const existingUser1 = User.has({ email });
    const existingUser2 = User.has({ username });

    // check if the user already exist
    if (existingUser1 || existingUser2) {
        return res.status(409).json({ message: "User already exist!" });
    }

    // Hash the password
    const hashPassword = await bcrypt.hash(password, 10);
    User.set({ username, email, password: hashPassword });

    // create new user
    return res.status(201).json({ message: "User registered successfully!" });
}

export const logout = (req, res) => {
    res.send("logout page"); // will be implemented later
}