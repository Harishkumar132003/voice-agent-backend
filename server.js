require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { AccessToken,AgentDispatchClient } = require("livekit-server-sdk");
const {
  RoomAgentDispatch,
  RoomConfiguration,
} = require("@livekit/protocol"); // Protobuf types

const app = express();
const port = 4000;

app.use(cors());

// Main token generation function
const createTokenWithAgentDispatch = async (participantName, roomName) => {

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
  });

  return await token.toJwt();
};

async function createExplicitDispatch(roomName) {
  const agentName = 'test-agent'
  const agentDispatchClient = new AgentDispatchClient(process.env.LIVEKIT_URL, process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET);

  // create a dispatch request for an agent named "test-agent" to join "my-room"
  const dispatch = await agentDispatchClient.createDispatch({
    metadata: '{"user_id": "12345"}',
  });
  console.log('created dispatch', dispatch);

  const dispatches = await agentDispatchClient.listDispatch(roomName);
  console.log(`there are ${dispatches.length} dispatches in ${roomName}`);
}

// GET /getToken?participantName=abc&roomName=my-room
app.get("/getToken", async (req, res) => {
  const { participantName, roomName } = req.query;
  // createExplicitDispatch(roomName)

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
