import express from "express";
import cors from "cors";
import dayjs from "dayjs";

const app = express(); // create server
app.use(express.json());
app.use(cors());

const participants = [];
const messages = [];

const isEmptyString = (name) => {
  if (name.name === "") return true;
  else return false;
};

const createUser = (name) => {
  const user = {
    ...name,
    lastStatus: Date.now(),
  };
  participants.push(user);
  return user;
};

const createStatusMessage = (from, to, text) => {
  const msg = {
    from,
    to,
    text,
    type: "status",
    time: dayjs().format("hh:mm:ss"),
  };
  messages.push(msg);
  return msg;
};

const messageIsValid = (msg) => {
  if (isEmptyString(msg.to) || isEmptyString(msg.text)) return false;
  if (msg.type !== "message" && msg.type !== "private_message") return false;
  return true;
};

const findParticipant = (name) => {
  const found = participants.find((p) => p.name === name);
  if (found) return true;
  else return false;
};

//SERVER ROUTES
app.post("/participants", (req, res) => {
  const name = req.body;
  if (isEmptyString(name.name)) {
    res.status(400);
    res.send("the name cannot be empty");
  }
  createStatusMessage(name.name, "Todos", "entra na sala...");
  res.status(200);
  res.send(createUser(name));
});

app.get("/participants", (req, res) => {
  res.send(participants);
});

app.post("/messages", (req, res) => {
  const from = req.headers.user;
  const { to, text, type } = req.body;
  const msg = {
    from,
    to,
    text,
    type,
    time: dayjs().format("hh:mm:ss"),
  };
  if (messageIsValid(msg) && findParticipant(from)) {
    messages.push(msg);
    res.sendStatus(200);
  } else res.sendStatus(400);
});

app.get("/messages", (req, res) => {
  res.send(messages);
});

app.listen(4000); // start server
