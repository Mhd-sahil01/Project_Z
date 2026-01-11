const store = require("../store/meetingStore");
const { randomUUID } = require('crypto'); // ✅

// Create meeting
exports.createMeeting = (req, res) => {
    const meetingId = randomUUID();
    store.set(meetingId, {
        participants: new Set(),
        active: true,
    });
    res.json({ meetingId });
};

// Join meeting
exports.joinMeeting = (req, res) => {
    const { meetingId, userId } = req.body;
    const meeting = store.get(meetingId);
    if (!meeting || !meeting.active) {
        return res.status(400).json({ error: "Meeting not active" });
    }
    meeting.participants.add(userId);
    res.json({ joined: true });
};

// Leave meeting
exports.leaveMeeting = (req, res) => {
    const { meetingId, userId } = req.body;
    const meeting = store.get(meetingId);
    meeting?.participants.delete(userId);
    res.json({ left: true });
};

// End meeting
exports.endMeeting = (req, res) => {
    const { meetingId } = req.body;
    const meeting = store.get(meetingId);
    if (meeting) meeting.active = false;
    res.json({ ended: true });
};
