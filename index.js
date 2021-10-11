import express from "express";
import cors from "cors";
import dayjs from "dayjs";

const app = express(); // create server
app.use(express.json());
app.use(cors());

const participants = [];
const messages = [];

const nameIsValid = (name) => {
  if (name.name === "") return false;
  else return true;
};

const createUser = (name) => {
  const user = {
    ...name,
    lastStatus: Date.now(),
  };
  participants.push(user);
  return user;
};

const createMessage = (from, to, text, type) => {
  const msg = {
    from,
    to,
    text,
    type,
    time: dayjs().format("hh-mm-ss"),
  };
  messages.push(msg);
  return msg;
};

app.post("/participantes", (req, res) => {
  const name = req.body;
  if (!nameIsValid(name.name)) {
    res.status(400);
    res.send("the name cannot be empty");
  }
  createMessage(name.name, "Todos", "entra na sala...", "status");
  res.status(200);
  res.send(createUser(name));
});

app.get("/participantes", (req, res) => {
  res.send(participants);
});

app.listen(4000); // start server
