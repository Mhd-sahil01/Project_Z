import express from "express";
import { createMeeting } from "../controllers/meetingController.js";
const meetingRouter = express.Router();

meetingRouter.post("/", createMeeting);

export default meetingRouter;