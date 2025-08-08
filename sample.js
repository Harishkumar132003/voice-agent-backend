require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { AccessToken,AgentDispatchClient ,RoomServiceClient} = require("livekit-server-sdk");

async function createExplicitDispatch(roomName,id,skill,name) {
  const agentName = 'interview-agent'
  const agentDispatchClient = new AgentDispatchClient(process.env.LIVEKIT_HTTP, process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET);

  // create a dispatch request for an agent named "test-agent" to join "my-room"
  const dispatch = await agentDispatchClient.createDispatch(roomName,agentName,{
    metadata: JSON.stringify({
    id,
    skills: skill.split(','),
    name:name
  }),
  });
  console.log('created dispatch', dispatch);

  // const dispatches = await agentDispatchClient.listDispatch(roomName);
  // console.log(`there are ${dispatches.length} dispatches in ${roomName}`);
}

const createToken = async (participantName,roomName,id,skill) => {
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
createExplicitDispatch(roomName,id,skill,participantName)
  return await at.toJwt();
};

const app = express();
const port = 4000;
app.use(cors());

app.get('/getToken', async (req, res) => {
  const { participantName, roomName, id, skill } = req.query;
  res.send(await createToken(participantName,roomName,id,skill));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});