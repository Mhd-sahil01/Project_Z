import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
});

// Mongoose automatically creates _id
export default mongoose.model("Meeting", meetingSchema);
