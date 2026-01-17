import Meeting from "../models/Meeting.js";

export const createMeeting = async (req, res) => {
  try {
    const { meetingId } = req.body;

    const meeting = await Meeting.create({
      meetingId,
      host: req.user?.id || "000000000000000000000000",
      participants: [req.user?.id || "000000000000000000000000"],
    });

    res.status(201).json(meeting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const joinMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;

    const meeting = await Meeting.findOne({ meetingId });
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    meeting.participants.push(
      req.user?.id || "000000000000000000000000"
    );
    await meeting.save();

    res.json(meeting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const leaveMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;

    const meeting = await Meeting.findOne({ meetingId });
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    meeting.participants = meeting.participants.filter(
      (id) => id.toString() !== (req.user?.id || "")
    );

    await meeting.save();
    res.json({ message: "Left meeting successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
