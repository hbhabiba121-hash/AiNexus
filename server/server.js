const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const openaiRoutes = require("./routes/openaiRoutes");
const cvAnalyzerRoutes = require("./routes/cvAnalyzer");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.set("strictQuery", false);
mongoose
  .connect("mongodb://localhost:27017/AiNexus")
  .then(() => console.log("✓ Connected To MongoDB: localhost"))
  .catch(console.error);

app.get("/api/test", (req, res) => {
  res.send("API is working");
});

app.use("/api/v1/openai", openaiRoutes);
app.use("/api/v1/cv-analyzer", cvAnalyzerRoutes);

const PORT = 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);