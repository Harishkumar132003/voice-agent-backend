require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { AccessToken } = require("livekit-server-sdk");

const createToken = async (participantName,roomName) => {
  const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
    identity: participantName,
    ttl: '10m',
  });
  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  return await at.toJwt();
};

const app = express();
const port = 4000;
app.use(cors());

app.get('/getToken', async (req, res) => {
  const { participantName, roomName } = req.query;
  res.send(await createToken(participantName,roomName));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});