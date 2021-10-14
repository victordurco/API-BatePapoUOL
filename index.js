import express from "express";
import cors from "cors";
import dayjs from "dayjs";

const app = express(); // create server
app.use(express.json());
app.use(cors());

let participants = [];
const messages = [];

const isEmptyString = (name) => {
  if (name.name === "") return true;
  else return false;
};

const createUser = (name) => {
  const user = {
    name,
    lastStatus: Date.now(),
  };
  participants.push(user);
  return user;
};

const createStatusMessage = (from, text) => {
  const msg = {
    from,
    to: "Todos",
    text,
    type: "status",
    time: dayjs().format("HH:mm:ss"),
  };
  messages.push(msg);
  return msg;
};

const messageIsValid = (msg) => {
  if (isEmptyString(msg.to) || isEmptyString(msg.text)) return false;
  if (msg.type !== "message" && msg.type !== "private_message") return false;
  return true;
};

const participantExist = (name) => {
  const found = participants.some((p) => p.name === name);
  return found;
};

//SERVER ROUTES
app.post("/participants", (req, res) => {
  let available = true;
  const name = req.body;
  if (isEmptyString(name.name) || !name) {
    res.status(400);
    res.send("the name cannot be empty");
    return;
  }
  participants.forEach((p) => {
    if (participantExist(name.name)) {
      available = false;
    }
  });
  if (available) {
    createStatusMessage(name, "entra na sala...");
    res.status(200);
    res.send(createUser(name.name));
  } else {
    res.sendStatus(409);
  }
});

app.get("/participants", (req, res) => {
  res.send(participants);
});

app.post("/messages", (req, res) => {
  const from = req.headers.user;
  const { to, text, type } = req.body;
  if (!to || !text || !type) res.sendStatus(400);
  const msg = {
    from,
    to,
    text,
    type,
    time: dayjs().format("HH:mm:ss"),
  };

  if (messageIsValid(msg) && participantExist(from)) {
    messages.push(msg);
    res.sendStatus(200);
  } else res.sendStatus(400);
});

app.get("/messages", (req, res) => {
  const user = req.headers.user;
  const limit = req.query.limit;
  const filteredMessages = messages.filter((msg) => {
    const privateMessages = msg.type === "private_message";
    const userMessage = msg.to === user || msg.from === user;
    return !privateMessages || userMessage;
  });
  const limitedMessages = filteredMessages.slice(-limit);
  res.send(limitedMessages);
});

app.post("/status", (req, res) => {
  const user = req.headers.user;
  if (!participantExist(user)) res.sendStatus(400);
  const participant = participants.find((p) => p.name === user);
  participant.lastStatus = Date.now();
  res.sendStatus(200);
});

setInterval(() => {
  const now = Date.now();
  const expiredParticipants = participants.filter((p) => {
    if (now - p.lastStatus >= 15000) return true;
  });
  expiredParticipants.forEach((p) => {
    createStatusMessage(p.name, "sai da sala...");
  });
  participants = participants.filter((p) => !expiredParticipants.includes(p));
}, 15000);

app.listen(4000); // start server
