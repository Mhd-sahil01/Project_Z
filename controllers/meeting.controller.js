import Meeting from "../models/Meeting.js";

// Create a new meeting
export const createMeeting = async (req, res) => {
  try {
    const { title } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const meeting = new Meeting({
      title,
      host: req.user._id,
      participants: [req.user._id],
    });

    await meeting.save(); // 🔑 Must save to generate _id

    // Log the ID to check
    console.log("New Meeting ID:", meeting._id);

    res.status(201).json({ message: "Meeting created", meeting });
  } catch (err) {
    res.status(500).json({ message: "Error creating meeting", error: err.message });
  }
};

// Join a meeting
export const joinMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    if (!meeting.participants.includes(req.user._id)) {
      meeting.participants.push(req.user._id);
      await meeting.save();
    }

    res.status(200).json({ message: "Joined meeting", meeting });
  } catch (err) {
    res.status(500).json({ message: "Error joining meeting", error: err.message });
  }
};

// Leave a meeting
export const leaveMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    meeting.participants = meeting.participants.filter(
      userId => userId.toString() !== req.user._id.toString()
    );
    await meeting.save();

    res.status(200).json({ message: "Left meeting", meeting });
  } catch (err) {
    res.status(500).json({ message: "Error leaving meeting", error: err.message });
  }
};
