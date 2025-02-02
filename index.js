const express = require("express");
const { verifyToken, generateToken } = require("./auth");
const { redisClient } = require("./redis");
const app = express();
app.use(express.json());
app.post("/login", async (req, res) => {
  const user = req.body;

  // Generate JWT token
  const token = generateToken(user);

  try {
    // Store token in Redis with expiration time of 1 hour (3600 seconds)
    await redisClient.setEx(`token:${user.username}`, 3600, token);

    res.json({ 'message':'Token generated successfully..!', 'token':token });
  } catch (err) {
    console.error("Error storing token in Redis:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/validateUser", verifyToken, (req, res) => {
  res.json({ message: "Protected route accessed", user: req.user });
});
app.post("/logout", verifyToken, async (req, res) => {
  try {
    const user = req.body;
    const rrr = await redisClient.get(`token:${user.username}`);
    
    console.log(rrr);
    await redisClient.del(`token:${user.username}`);
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Error removing token from Redis:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
