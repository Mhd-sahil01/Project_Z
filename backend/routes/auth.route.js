import express from "express";
import {login, register, logout} from "../controllers/auth.controller.js";
import { validateRegistration, validateLogin } from "../middleware/validation.js";

const authRouter = express.Router();

// Register, login, and logout routes
authRouter.post("/register", validateRegistration, register);
authRouter.post("/login", validateLogin, login);
authRouter.post("/logout", logout);

export default authRouter;