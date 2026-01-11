import express from "express";
import { createMeeting, joinMeeting, leaveMeeting , endMeeting } from "../controllers/meetingController.js";

const meetingRouter = express.Router();

meetingRouter.post("/create", createMeeting);
meetingRouter.post("/:meetingId/join", joinMeeting);
meetingRouter.post("/:meetingId/leave", leaveMeeting);
meetingRouter.post("/:meetingId/end", endMeeting);

export default meetingRouter;