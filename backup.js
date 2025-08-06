require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { AccessToken } = require("livekit-server-sdk");
const {
  RoomAgentDispatch,
  RoomConfiguration,
} = require("@livekit/protocol"); // Protobuf types

const app = express();
const port = 4000;

app.use(cors());

// Main token generation function
const createTokenWithAgentDispatch = async (participantName, roomName) => {
  const roomConfig = new RoomConfiguration({
    agents: [
      new RoomAgentDispatch({
        agentName: "test-agent",
        
      }),
    ],
  });

  const token = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    {
      identity: participantName,
      ttl: 60 * 60 * 5, // 5 hours
    }
  );

  token.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
    roomConfig, // 🔥 Agent dispatch config goes here
  });

  return await token.toJwt();
};

// GET /getToken?participantName=abc&roomName=my-room
app.get("/getToken", async (req, res) => {
  const { participantName, roomName } = req.query;

  if (!participantName || !roomName) {
    return res.status(400).json({
      error: "Missing participantName or roomName in query parameters",
    });
  }

  try {
    const token = await createTokenWithAgentDispatch(participantName, roomName);
    res.send(token); // Return JWT
  } catch (err) {
    console.error("Token generation failed:", err);
    res.status(500).json({ error: "Token generation failed" });
  }
});

app.listen(port, () => {
  console.log(`✅ LiveKit token server running at http://localhost:${port}`);
});
