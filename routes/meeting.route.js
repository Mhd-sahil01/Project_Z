import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  createMeeting,
  joinMeeting,
  leaveMeeting,
} from "../controllers/meeting.controller.js";

const router = express.Router();

router.post("/create", authMiddleware, createMeeting);
router.post("/join/:meetingId", authMiddleware, joinMeeting);
router.post("/leave/:meetingId", authMiddleware, leaveMeeting);

export default router;
