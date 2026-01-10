import express from "express";

const app = express();
const PORT = process.env.PORT || 8080;

// app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use("/api/meeting", require("./routes/meetingRoutes"));


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});